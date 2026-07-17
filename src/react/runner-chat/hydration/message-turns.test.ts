import { describe, expect, it } from "vitest";
import {
  attachHydratedMessageIdsToTurns,
  buildHydratedTurnsFromMessages,
} from "./message-turns.js";

describe("runner hydrated message turns", () => {
  it("builds normal and BTW turns without relying on message alternation", () => {
    const turns = buildHydratedTurnsFromMessages([
      {
        id: "user-1",
        role: "user",
        content: "Build the feature",
        createdAt: "2026-07-16T10:00:00.000Z",
      },
      {
        id: "user-btw",
        role: "user",
        content: "/btw what are you doing?",
        createdAt: "2026-07-16T10:00:01.000Z",
      },
      {
        id: "assistant-btw",
        role: "assistant",
        content: "I am running the tests.",
        createdAt: "2026-07-16T10:00:02.000Z",
        logMetadata: { isBTW: true },
      },
      {
        id: "assistant-1",
        role: "assistant",
        content: "Finished.",
        createdAt: "2026-07-16T10:00:05.000Z",
      },
    ]);

    expect(turns).toHaveLength(2);
    expect(turns.map((turn) => turn.presentation)).toEqual(["default", "btw"]);
    expect(turns[0]).toMatchObject({
      id: "user-1",
      sourceMessageId: "user-1",
      prompt: "Build the feature",
      status: "completed",
    });
    expect(turns[0].logs[0].message).toBe("Finished.");
    expect(turns[1].logs[0].message).toBe("I am running the tests.");
  });

  it("keeps an unanswered user turn live when the thread is running", () => {
    const turns = buildHydratedTurnsFromMessages(
      [
        {
          id: "user-1",
          role: "user",
          content: "Continue",
          createdAt: "2026-07-16T10:00:00.000Z",
        },
      ],
      { threadStatus: "running", completedAtMs: null },
    );
    expect(turns[0]).toMatchObject({
      status: "running",
      completedAtMs: undefined,
    });
  });

  it("reconciles hydrated user IDs and message metadata onto log-derived turns", () => {
    const [turn] = attachHydratedMessageIdsToTurns(
      [
        {
          id: "local-turn",
          prompt: "Analyze",
          logs: [],
          startedAtMs: 1,
          status: "completed",
        },
      ],
      [
        {
          id: "message-1",
          role: "user",
          content: "Analyze",
          logMetadata: {
            quotedSelection: { text: "selected text", sourceType: "run_summary" },
          },
        },
      ],
    );
    expect(turn).toMatchObject({
      id: "message-1",
      sourceMessageId: "message-1",
      quotedSelection: {
        text: "selected text",
        sourceType: "run_summary",
      },
    });
  });
});
