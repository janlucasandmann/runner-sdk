import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../types.js";
import { buildRunnerMetronomeWorkflowRunPayload } from "./metronome-workflow.js";

function workflowLog(workflow: Record<string, unknown>): RunnerLog {
  return {
    time: "00:01",
    message: "Workflow started",
    type: "info",
    eventType: "metronome_workflow",
    metadata: {
      metronomeWorkflow: workflow,
    },
  };
}

describe("metronome workflow projection", () => {
  it("projects only the origin thread event", () => {
    expect(buildRunnerMetronomeWorkflowRunPayload(
      workflowLog({
        workflowId: "workflow_1",
        runId: "run_1",
        workflowName: "Daily report",
        triggerCommand: "/run",
        isOriginThread: true,
      }),
      "thread_1",
      { userMessage: "Generate report" },
    )).toMatchObject({
      threadId: "thread_1",
      workflowId: "workflow_1",
      runId: "run_1",
      workflowName: "Daily report",
      userMessage: "Generate report",
      isOriginThread: true,
    });
  });

  it("rejects node-thread and malformed events", () => {
    expect(buildRunnerMetronomeWorkflowRunPayload(
      workflowLog({
        workflowId: "workflow_1",
        runId: "run_1",
        nodeId: "node_1",
        triggerCommand: "/run",
      }),
      "thread_1",
    )).toBeNull();
    expect(buildRunnerMetronomeWorkflowRunPayload(
      workflowLog({ runId: "run_1", triggerCommand: "/run" }),
      "thread_1",
    )).toBeNull();
  });
});
