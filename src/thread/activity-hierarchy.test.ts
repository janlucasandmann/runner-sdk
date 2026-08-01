import { describe, expect, it } from "vitest";

import { buildRunnerThreadActivityHierarchy } from "./activity-hierarchy.js";
import { normalizeRunnerThreadTimelinePage } from "./normalize.js";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadRun,
  RunnerThreadTimelineItem,
} from "./types.js";

const threadId = "thread-1";
const startedAt = "2026-08-01T08:00:00.000Z";

const human: RunnerThreadParticipant = {
  id: "participant-human",
  threadId,
  kind: "human",
  displayName: "Ada",
  avatarUrl: "/ada.png",
};

const worker: RunnerThreadParticipant = {
  id: "participant-worker",
  threadId,
  kind: "worker",
  displayName: "Spark",
  agentId: "agent-spark",
  avatarUrl: "/spark.webp",
};

const message: RunnerThreadMessage = {
  kind: "message",
  id: "message-1",
  threadId,
  sequence: 1,
  authorParticipantId: human.id,
  content: "Research the repository and run the tests.",
  modality: "text",
  status: "delivered",
  createdAt: startedAt,
};

const run: RunnerThreadRun = {
  kind: "run",
  id: "run-1",
  threadId,
  sequence: 2,
  runKind: "worker",
  status: "completed",
  actorParticipantId: worker.id,
  sourceMessageId: message.id,
  title: "Worker run",
  summary: "Implemented and verified the change.",
  origin: { kind: "message", sourceMessageId: message.id },
  startedAt,
  completedAt: "2026-08-01T08:01:00.000Z",
  createdAt: startedAt,
};

function action(
  id: string,
  sequence: number,
  type: string,
  groupId: string,
  title: string,
): RunnerThreadAction {
  return {
    kind: "action",
    id,
    threadId,
    runId: run.id,
    sequence,
    activityGroupId: groupId,
    actorParticipantId: worker.id,
    type,
    title,
    status: "completed",
    permissionRing: 1,
    metadata: {
      source: type === "reasoning" ? "provider_reasoning" : "runtime",
    },
    startedAt,
    completedAt: "2026-08-01T08:00:30.000Z",
    createdAt: startedAt,
  };
}

function group(
  id: string,
  sequence: number,
  title: string,
  actionIds: string[],
  parentGroupId: string | null,
  childGroupIds: string[] = [],
): RunnerThreadActivityGroup {
  return {
    kind: "activity_group",
    id,
    threadId,
    runId: run.id,
    sequence,
    version: 1,
    status: "sealed",
    title,
    liveSummary: title,
    parentGroupId,
    childGroupIds,
    actionIds,
    startSequence: sequence,
    endSequence: sequence + actionIds.length,
    metadata: { observerStatus: "fallback" },
    createdAt: startedAt,
    sealedAt: "2026-08-01T08:00:30.000Z",
  };
}

const reasoningActions = Array.from({ length: 40 }, (_, index) =>
  action(`reasoning-${index}`, 10 + index, "reasoning", "group-implement", `token-${index}`),
);
const inspectTool = {
  ...action("tool-inspect", 51, "command_execution", "group-inspect", "Inspect files"),
  toolName: "exec_command",
};
const testTool = {
  ...action("tool-test", 52, "command_execution", "group-verify", "Run tests"),
  toolName: "exec_command",
};

const groups: RunnerThreadActivityGroup[] = [
  group("group-root", 3, "Worker run", [], null, [
    "group-inspect",
    "group-implement",
    "group-verify",
  ]),
  group("group-inspect", 4, "Inspecting the repository", [inspectTool.id], "group-root"),
  group(
    "group-implement",
    5,
    "Implementing the change",
    reasoningActions.map((item) => item.id),
    "group-root",
  ),
  group("group-verify", 6, "Verifying the result", [testTool.id], "group-root"),
];

const items: RunnerThreadTimelineItem[] = [
  message,
  run,
  ...reasoningActions,
  inspectTool,
  testTool,
  ...groups,
];

describe("buildRunnerThreadActivityHierarchy", () => {
  it("builds overview records without exposing streamed reasoning fragments", () => {
    const records = buildRunnerThreadActivityHierarchy({
      items,
      participants: [human, worker],
      level: "overview",
    });

    expect(records.map((record) => record.kind)).toEqual(["message", "run"]);
    expect(records[0].actor?.displayName).toBe("Ada");
    expect(records[1].actor?.displayName).toBe("Spark");
    expect(records.some((record) => record.title.startsWith("token-"))).toBe(false);
  });

  it("uses semantic leaf groups for the action-group level", () => {
    const records = buildRunnerThreadActivityHierarchy({
      items,
      participants: [human, worker],
      level: "groups",
    });

    expect(records.filter((record) => record.kind === "activity_group")).toHaveLength(3);
    expect(records.map((record) => record.title)).toEqual([
      "User message",
      "Inspecting the repository",
      "Implementing the change",
      "Verifying the result",
    ]);
    expect(records.find((record) => record.group?.id === "group-inspect")?.actions).toHaveLength(1);
    expect(records.find((record) => record.group?.id === "group-implement")?.actions).toHaveLength(0);
  });

  it("shows only executable calls at the tool-call level", () => {
    const records = buildRunnerThreadActivityHierarchy({
      items,
      participants: [human, worker],
      level: "tool_calls",
    });

    expect(records.map((record) => record.kind)).toEqual([
      "message",
      "tool_call",
      "tool_call",
    ]);
    expect(records.filter((record) => record.kind === "tool_call").map((record) => record.title)).toEqual([
      "Inspect files",
      "Run tests",
    ]);
  });

  it("pairs runtime start and completion evidence without exposing unknown calls", () => {
    const toolStart: RunnerThreadAction = {
      ...action("tool-start", 60, "action_summary", "group-implement", "Run local commands"),
      toolName: "run_terminal_command",
      status: "started",
      metadata: {
        source: "grok_runtime_v2",
        status: "started",
        isToolStarted: true,
        toolId: "call-1",
        toolName: "run_terminal_command",
        runtimeSequence: 60,
      },
    };
    const toolCompletion: RunnerThreadAction = {
      ...action("tool-completion", 66, "command_execution", "group-implement", "Executed: unknown"),
      toolName: "unknown",
      output: "done",
      metadata: {
        source: "grok_runtime_v2",
        command: "unknown",
        runtimeSequence: 66,
      },
    };
    const records = buildRunnerThreadActivityHierarchy({
      items: [...items, toolStart, toolCompletion],
      participants: [human, worker],
      level: "tool_calls",
    });
    const calls = records.filter((record) => record.kind === "tool_call");

    expect(calls.map((record) => record.title)).toEqual([
      "Inspect files",
      "Run tests",
      "run_terminal_command",
    ]);
    expect(calls.some((record) => record.title.toLowerCase().includes("unknown"))).toBe(false);
    expect(calls.at(-1)?.group?.id).toBe("group-implement");
    expect(calls.at(-1)?.action?.status).toBe("completed");
    expect(calls.at(-1)?.action?.output).toBe("done");
  });

  it("uses runtime sequence metadata for compatibility actions", () => {
    const page = normalizeRunnerThreadTimelinePage({
      threadId,
      runs: [{
        id: run.id,
        kind: "worker",
        status: "completed",
        startedAt,
        completedAt: "2026-08-01T08:01:00.000Z",
      }],
      data: [{
        id: "legacy:tool-start",
        threadId,
        runId: run.id,
        kind: "action",
        sequence: null,
        createdAt: startedAt,
        payload: {
          eventType: "action_summary",
          content: "run_terminal_command",
          metadata: {
            source: "grok_runtime_v2",
            status: "started",
            isToolStarted: true,
            toolId: "call-1",
            toolName: "run_terminal_command",
            runtimeSequence: 1163,
          },
        },
      }],
    });
    const normalizedAction = page.items.find(
      (item): item is RunnerThreadAction => item.kind === "action",
    );

    expect(normalizedAction?.sequence).toBe(1163);
    expect(normalizedAction?.runId).toBe(run.id);
    expect(normalizedAction?.toolName).toBe("run_terminal_command");
  });
});
