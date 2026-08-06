import { describe, expect, it } from "vitest";

import {
  buildRunnerThreadActivityTree,
  flattenRunnerThreadActivityTree,
} from "./activity-tree.js";
import type { RunnerThreadPlanStep } from "./activity-plan.js";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadRun,
  RunnerThreadTimelineItem,
} from "./types.js";

const threadId = "thread-tree";
const human: RunnerThreadParticipant = {
  id: "human",
  threadId,
  kind: "human",
  displayName: "Ada",
};
const worker: RunnerThreadParticipant = {
  id: "worker",
  threadId,
  kind: "worker",
  displayName: "Spark",
  agentId: "spark",
};
const message: RunnerThreadMessage = {
  kind: "message",
  id: "message",
  threadId,
  sequence: 1,
  authorParticipantId: human.id,
  content: "Inspect the repository and run tests.",
  modality: "text",
  status: "delivered",
  createdAt: "2026-08-05T08:00:00.000Z",
};
const run: RunnerThreadRun = {
  kind: "run",
  id: "run",
  threadId,
  sequence: 2,
  runKind: "worker",
  status: "completed",
  actorParticipantId: worker.id,
  sourceMessageId: message.id,
  origin: { kind: "message", sourceMessageId: message.id },
  startedAt: "2026-08-05T08:00:01.000Z",
  completedAt: "2026-08-05T08:01:00.000Z",
  createdAt: "2026-08-05T08:00:01.000Z",
};

function tool(
  id: string,
  sequence: number,
  groupId: string,
  title: string,
  startedAt: string,
): RunnerThreadAction {
  return {
    kind: "action",
    id,
    threadId,
    runId: run.id,
    sequence,
    activityGroupId: groupId,
    actorParticipantId: worker.id,
    type: "command_execution",
    title,
    toolName: "exec_command",
    status: "completed",
    permissionRing: 1,
    startedAt,
    completedAt: startedAt,
    createdAt: startedAt,
  };
}

function group(
  id: string,
  sequence: number,
  title: string,
  actionId: string,
  createdAt: string,
  sealedAt: string,
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
    parentGroupId: "root",
    childGroupIds: [],
    actionIds: [actionId],
    startSequence: sequence,
    endSequence: sequence + 1,
    metadata: { observerStatus: "fallback" },
    createdAt,
    sealedAt,
  };
}

const inspectTool = tool(
  "inspect-tool",
  4,
  "inspect-group",
  "Inspect repository files",
  "2026-08-05T08:00:08.000Z",
);
const verifyTool = tool(
  "verify-tool",
  7,
  "verify-group",
  "Run focused tests",
  "2026-08-05T08:00:38.000Z",
);
const inspectGroup = group(
  "inspect-group",
  3,
  "Inspecting the repository",
  inspectTool.id,
  "2026-08-05T08:00:05.000Z",
  "2026-08-05T08:00:18.000Z",
);
const verifyGroup = group(
  "verify-group",
  6,
  "Verifying with focused tests",
  verifyTool.id,
  "2026-08-05T08:00:30.000Z",
  "2026-08-05T08:00:45.000Z",
);
const rootGroup: RunnerThreadActivityGroup = {
  ...group(
    "root",
    2.5,
    "Worker run",
    "",
    "2026-08-05T08:00:01.000Z",
    "2026-08-05T08:00:50.000Z",
  ),
  parentGroupId: null,
  childGroupIds: [inspectGroup.id, verifyGroup.id],
  actionIds: [],
};
const planSteps: RunnerThreadPlanStep[] = [
  {
    id: "plan-step:inspect",
    text: "Inspect the repository",
    status: "completed",
    completed: true,
    sequence: 5.001,
    createdAt: "2026-08-05T08:00:02.000Z",
    updatedAt: "2026-08-05T08:00:20.000Z",
    completedAt: "2026-08-05T08:00:20.000Z",
    actorParticipantId: worker.id,
    agentId: worker.agentId || null,
    runId: run.id,
  },
  {
    id: "plan-step:verify",
    text: "Run focused tests",
    status: "completed",
    completed: true,
    sequence: 8.001,
    createdAt: "2026-08-05T08:00:02.000Z",
    updatedAt: "2026-08-05T08:00:50.000Z",
    completedAt: "2026-08-05T08:00:50.000Z",
    actorParticipantId: worker.id,
    agentId: worker.agentId || null,
    runId: run.id,
  },
];
const items: RunnerThreadTimelineItem[] = [
  message,
  run,
  inspectTool,
  verifyTool,
  rootGroup,
  inspectGroup,
  verifyGroup,
];

describe("buildRunnerThreadActivityTree", () => {
  it("nests action groups and atomic tool calls beneath their plan steps", () => {
    const records = buildRunnerThreadActivityTree({
      items,
      participants: [human, worker],
      planSteps,
    });

    const inspectPlan = records.find((record) => record.id === "plan-step:inspect");
    const inspectGroupRecord = records.find((record) => record.group?.id === inspectGroup.id);
    const inspectToolRecord = records.find((record) => record.action?.id === inspectTool.id);
    const verifyPlan = records.find((record) => record.id === "plan-step:verify");
    const verifyGroupRecord = records.find((record) => record.group?.id === verifyGroup.id);

    expect(inspectPlan).toMatchObject({ depth: 0, expandable: true });
    expect(inspectGroupRecord).toMatchObject({
      parentId: inspectPlan?.id,
      depth: 1,
      expandable: true,
    });
    expect(inspectToolRecord).toMatchObject({
      parentId: inspectGroupRecord?.id,
      depth: 2,
      expandable: false,
    });
    expect(verifyGroupRecord?.parentId).toBe(verifyPlan?.id);
    expect(records.map((record) => record.kind)).toEqual([
      "message",
      "plan_step",
      "activity_group",
      "tool_call",
      "plan_step",
      "activity_group",
      "tool_call",
    ]);
  });

  it("keeps action groups as roots when no worker plan is available", () => {
    const records = buildRunnerThreadActivityTree({
      items,
      participants: [human, worker],
    });
    const groupRecord = records.find((record) => record.group?.id === inspectGroup.id);
    const toolRecord = records.find((record) => record.action?.id === inspectTool.id);

    expect(groupRecord?.parentId).toBeNull();
    expect(groupRecord?.depth).toBe(0);
    expect(toolRecord?.parentId).toBe(groupRecord?.id);
  });

  it("hides descendants of collapsed tree records without mutating the tree", () => {
    const records = buildRunnerThreadActivityTree({
      items,
      participants: [human, worker],
      planSteps,
    });
    const visible = flattenRunnerThreadActivityTree(
      records,
      new Set(["plan-step:inspect"]),
    );

    expect(visible.some((record) => record.group?.id === inspectGroup.id)).toBe(false);
    expect(visible.some((record) => record.group?.id === verifyGroup.id)).toBe(true);
    expect(records.some((record) => record.group?.id === inspectGroup.id)).toBe(true);
  });
});
