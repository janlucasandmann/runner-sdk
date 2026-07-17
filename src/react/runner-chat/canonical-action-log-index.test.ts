import { describe, expect, it } from "vitest";

import type { RunnerThreadAction } from "../../thread/types.js";
import type { RunnerTurn } from "./turn-types.js";
import {
  buildRunnerOriginalActionLogIndex,
  resolveRunnerOriginalActionLog,
} from "./canonical-action-log-index.js";

const turn: RunnerTurn = {
  id: "turn_1",
  prompt: "Create a file",
  startedAtMs: 1,
  status: "completed",
  logs: [
    {
      time: "00:01",
      message: "Created notes.txt",
      type: "success",
      eventType: "command_execution",
      metadata: {
        toolId: "tool_1",
        command: "touch notes.txt",
      },
    },
  ],
};

describe("canonical action log index", () => {
  it("matches canonical actions by durable identity", () => {
    const action = {
      id: "action_1",
      threadId: "thread_1",
      runId: "run_1",
      type: "tool",
      title: "Created a file",
      sourceEventId: "tool_1",
      createdAt: new Date(1).toISOString(),
    } as RunnerThreadAction;

    const match = resolveRunnerOriginalActionLog(
      action,
      buildRunnerOriginalActionLogIndex([turn]),
    );

    expect(match?.turn.id).toBe("turn_1");
    expect(match?.log.message).toBe("Created notes.txt");
  });

  it("falls back to matching command metadata", () => {
    const action = {
      id: "action_2",
      threadId: "thread_1",
      runId: "run_1",
      type: "tool",
      title: "Different presentation title",
      toolName: "",
      input: { command: "touch notes.txt" },
      createdAt: new Date(20_000).toISOString(),
    } as RunnerThreadAction;

    const match = resolveRunnerOriginalActionLog(
      action,
      buildRunnerOriginalActionLogIndex([turn]),
    );

    expect(match?.logIndex).toBe(0);
  });
});
