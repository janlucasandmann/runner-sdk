import { describe, expect, it } from "vitest";
import type { RunnerTurn } from "../turn-types.js";
import {
  mergeHydratedMessageTurnsIntoTurns,
  mergeHydratedTimelineLogsIntoMessageTurns,
  mergeHydratedTurns,
  turnsLikelyMatch,
} from "./turn-merge.js";

function turn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn",
    prompt: "Build it",
    logs: [],
    startedAtMs: Date.parse("2026-07-16T10:00:00.000Z"),
    status: "completed",
    ...overrides,
  };
}

describe("runner hydrated turn reconciliation", () => {
  it("matches canonical source IDs and complementary prompt/timeline projections", () => {
    expect(
      turnsLikelyMatch(
        turn({ id: "local", sourceMessageId: "message-1" }),
        turn({ id: "remote", sourceMessageId: "message-1" }),
      ),
    ).toBe(true);
    expect(
      turnsLikelyMatch(
        turn({ id: "local", logs: [] }),
        turn({
          id: "remote",
          prompt: "",
          logs: [
            {
              time: "00:01",
              type: "info",
              eventType: "command_execution",
              message: "npm test",
              metadata: { command: "npm test" },
            },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("collapses repeated canonical turns introduced by preview and live hydration", () => {
    const turns = mergeHydratedTurns([], [
      turn({
        id: "preview-turn",
        sourceMessageId: "msg-project-mention",
        prompt: "@Spark what is this ticket about?",
      }),
      turn({
        id: "history-turn",
        sourceMessageId: "msg-project-mention",
        prompt: "@Spark what is this ticket about?",
      }),
      turn({
        id: "event-turn",
        sourceMessageId: "msg-project-mention",
        prompt: "@Spark what is this ticket about?",
        logs: [
          {
            time: "00:01",
            type: "info",
            eventType: "command_execution",
            message: "Inspecting the ticket",
          },
        ],
      }),
    ]);

    expect(turns).toHaveLength(1);
    expect(turns[0]?.prompt).toBe("@Spark what is this ticket about?");
    expect(turns[0]?.logs).toHaveLength(1);
  });

  it("preserves a real local response over a remote fallback", () => {
    const [merged] = mergeHydratedTurns(
      [
        turn({
          id: "local",
          sourceMessageId: "message-1",
          logs: [
            {
              time: "00:05",
              type: "info",
              eventType: "agent_message",
              message: "Implemented the feature and tests pass.",
            },
          ],
        }),
      ],
      [
        turn({
          id: "remote",
          sourceMessageId: "message-1",
          logs: [
            {
              time: "00:05",
              type: "info",
              eventType: "agent_message",
              message: "[Task executed - no detailed response captured]",
            },
          ],
        }),
      ],
    );
    expect(merged.id).toBe("local");
    expect(merged.logs[0].message).toContain("Implemented");
  });

  it("assigns timestamped timeline logs to the correct message turn", () => {
    const turns = [
      turn({
        id: "first",
        prompt: "First",
        startedAtMs: Date.parse("2026-07-16T10:00:00.000Z"),
      }),
      turn({
        id: "second",
        prompt: "Second",
        startedAtMs: Date.parse("2026-07-16T10:01:00.000Z"),
      }),
    ];
    const merged = mergeHydratedTimelineLogsIntoMessageTurns(turns, [
      {
        createdAt: "2026-07-16T10:00:10.000Z",
        time: "00:10",
        type: "info",
        eventType: "command_execution",
        message: "first command",
      },
      {
        createdAt: "2026-07-16T10:01:10.000Z",
        time: "01:10",
        type: "info",
        eventType: "command_execution",
        message: "second command",
      },
    ]);
    expect(merged?.[0].logs.map((log) => log.message)).toEqual(["first command"]);
    expect(merged?.[1].logs.map((log) => log.message)).toEqual(["second command"]);
  });

  it("hydrates a canonical assistant response into a log-derived turn", () => {
    const [merged] = mergeHydratedMessageTurnsIntoTurns(
      [
        turn({
          sourceMessageId: "user-1",
          logs: [
            {
              time: "00:01",
              type: "info",
              eventType: "command_execution",
              message: "npm test",
            },
          ],
        }),
      ],
      [
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
    );
    expect(merged.logs.map((log) => log.eventType)).toEqual([
      "command_execution",
      "agent_message",
    ]);
    expect(merged.logs[1].message).toBe("Done");
  });

  it("preserves persisted connector metadata while reconciling a user turn", () => {
    const [merged] = mergeHydratedMessageTurnsIntoTurns(
      [
        turn({
          sourceMessageId: "user-connector-1",
          messageMetadata: { optimistic: true },
        }),
      ],
      [
        {
          id: "user-connector-1",
          role: "user",
          content: "Build it",
          createdAt: "2026-07-16T10:00:00.000Z",
          logMetadata: { runnerConnectorIds: ["github"] },
        },
      ],
    );

    expect(merged.messageMetadata).toEqual({
      optimistic: true,
      runnerConnectorIds: ["github"],
    });
  });

  it("recovers historical connector metadata while assigning structured logs", () => {
    const [merged] = mergeHydratedTimelineLogsIntoMessageTurns(
      [
        turn({
          id: "msg_mTMHJP4BQyBuA1VXZwwEJ",
          sourceMessageId: "msg_mTMHJP4BQyBuA1VXZwwEJ",
          prompt: "list all my repos",
          messageMetadata: null,
          startedAtMs: Date.parse("2026-08-04T08:20:49.082Z"),
        }),
      ],
      [
        {
          id: "log-github",
          type: "info",
          message: "Called GitHub",
          eventType: "mcp_tool_call",
          metadata: {
            toolName: "mcp__connector_github__search_repositories",
            serverName: "connector_github",
            timestamp: "2026-08-04T08:20:50.000Z",
          },
        },
      ],
    ) || [];

    expect(merged.messageMetadata).toMatchObject({
      runnerConnectorIds: ["github"],
      connectorMetadataSource: "structured_turn_evidence",
    });
  });
});
