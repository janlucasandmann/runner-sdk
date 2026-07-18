import { describe, expect, it, vi } from "vitest";

import type { RunnerConversationMessage } from "./conversation-messages.js";
import { resolveRunnerEditableTurnBoundary } from "./editable-turn-boundary.js";
import type { RunnerTurn } from "./turn-types.js";

function createTurn(id: string, prompt: string, options?: Partial<RunnerTurn>): RunnerTurn {
  return {
    id,
    prompt,
    logs: [],
    startedAtMs: 0,
    status: "completed",
    ...options,
  };
}

function createOptions(
  turns: RunnerTurn[],
  messages: RunnerConversationMessage[],
  turnId = turns[0]?.id || "",
) {
  const fetchMessages = vi.fn(async () => messages);
  return {
    fetchMessages,
    options: {
      apiKey: " test-key ",
      backendUrl: "https://runner.example",
      services: { fetchMessages },
      threadId: "thread-1",
      turnId,
      turns,
    },
  };
}

describe("resolveRunnerEditableTurnBoundary", () => {
  it("uses a canonical source-message identity and absolute message index", async () => {
    const harness = createOptions(
      [
        createTurn("turn-1", "Build it", {
          sourceMessageId: "msg_user_1",
        }),
      ],
      [
        { id: "msg_system", role: "system", content: "System" },
        { id: "msg_user_1", role: "user", content: "Build it" },
        { id: "msg_assistant", role: "assistant", content: "Done" },
      ],
    );

    await expect(resolveRunnerEditableTurnBoundary(harness.options)).resolves.toEqual({
      messageId: "msg_user_1",
      truncateAtMessageIndex: 1,
    });
    expect(harness.fetchMessages).toHaveBeenCalledWith({
      apiKey: "test-key",
      backendUrl: "https://runner.example",
      requestHeaders: undefined,
      threadId: "thread-1",
    });
  });

  it("matches by conversation position while excluding internal turns", async () => {
    const turns = [
      createTurn("turn-1", "First"),
      createTurn("turn-btw", "/btw status?", { presentation: "btw" }),
      createTurn("turn-notice", "", {
        presentation: "context-action-notice",
      }),
      createTurn("turn-2", "Second"),
    ];
    const harness = createOptions(
      turns,
      [
        { id: "msg_user_1", role: "user", content: "First" },
        { id: "msg_btw", role: "user", content: "/btw status?" },
        { id: "msg_context", role: "user", content: "/compact" },
        { id: "msg_user_2", role: "user", content: "Second" },
      ],
      "turn-2",
    );

    await expect(resolveRunnerEditableTurnBoundary(harness.options)).resolves.toEqual({
      messageId: "msg_user_2",
      truncateAtMessageIndex: 3,
    });
  });

  it("retains the source identity fallback for an unsaved thread", async () => {
    const fetchMessages = vi.fn();

    await expect(
      resolveRunnerEditableTurnBoundary({
        apiKey: "",
        backendUrl: "",
        services: { fetchMessages },
        threadId: null,
        turnId: "turn-1",
        turns: [
          createTurn("turn-1", "Draft", {
            sourceMessageId: "msg_local",
          }),
        ],
      }),
    ).resolves.toEqual({
      messageId: "msg_local",
      truncateAtMessageIndex: 0,
    });
    expect(fetchMessages).not.toHaveBeenCalled();
  });

  it("fails rather than guessing when no stable boundary exists", async () => {
    const harness = createOptions(
      [createTurn("turn-1", "First"), createTurn("turn-2", "Second")],
      [],
      "turn-2",
    );

    await expect(resolveRunnerEditableTurnBoundary(harness.options)).rejects.toThrow(
      "Message not found.",
    );
  });
});
