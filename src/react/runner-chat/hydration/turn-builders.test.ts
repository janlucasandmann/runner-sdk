import { describe, expect, it } from "vitest";
import {
  buildHydratedTurnsFromLogs,
  buildHydratedTurnsFromPayload,
} from "./turn-builders.js";

describe("runner hydrated turn builders", () => {
  it("projects a log transcript into a completed conversational turn", () => {
    const [turn] = buildHydratedTurnsFromLogs(
      [
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
          metadata: { durationMs: 5_000 },
        },
      ],
      "",
      [],
      { startedAtMs: Date.parse("2026-07-16T10:00:00.000Z") },
    );

    expect(turn).toMatchObject({
      prompt: "Build it",
      status: "completed",
      durationSeconds: 5,
      isInitialTurn: true,
    });
    expect(turn.logs.map((log) => log.eventType)).toEqual([
      "command_execution",
      "agent_message",
    ]);
  });

  it("projects pending permission and context actions as explicit turn states", () => {
    const permissionTurns = buildHydratedTurnsFromLogs(
      [
        {
          time: "00:00",
          type: "info",
          eventType: "user_message",
          message: "Deploy",
        },
        {
          time: "00:01",
          type: "info",
          eventType: "permission_request",
          message: "Allow deploy?",
          metadata: { status: "pending" },
        },
      ],
      "",
      [],
      { threadStatus: "permission_asked", completedAtMs: null },
    );
    expect(permissionTurns[0].status).toBe("permission_asked");

    const contextTurns = buildHydratedTurnsFromLogs(
      [
        {
          time: "00:00",
          type: "info",
          eventType: "user_message",
          message: "/compact",
        },
        {
          time: "00:01",
          type: "info",
          eventType: "action_summary",
          message: "Compacted",
          metadata: { actionType: "compact" },
        },
      ],
      "",
      [],
    );
    expect(contextTurns[0]).toMatchObject({
      prompt: "/compact",
      presentation: "context-action-notice",
    });
  });

  it("prefers canonical messages while retaining timeline activity", () => {
    const [turn] = buildHydratedTurnsFromPayload({
      threadId: "thread-1",
      threadStatus: "completed",
      initialPrompt: "Build it",
      startedAtMs: Date.parse("2026-07-16T10:00:00.000Z"),
      completedAtMs: Date.parse("2026-07-16T10:00:05.000Z"),
      messages: [
        {
          id: "user-1",
          role: "user",
          content: "Build it",
          createdAt: "2026-07-16T10:00:00.000Z",
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Done",
          createdAt: "2026-07-16T10:00:05.000Z",
        },
      ],
      logs: [
        {
          createdAt: "2026-07-16T10:00:02.000Z",
          time: "00:02",
          type: "info",
          eventType: "command_execution",
          message: "npm test",
        },
      ],
    });

    expect(turn).toMatchObject({
      id: "user-1",
      prompt: "Build it",
      status: "completed",
    });
    expect(turn.logs.map((log) => log.eventType)).toEqual([
      "command_execution",
      "agent_message",
    ]);
  });
});
