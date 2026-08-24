import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../types.js";
import { buildRunnerMetronomeWorkflowRunPayload } from "./metronome-workflow.js";

const runnerChatCss = readFileSync(
  fileURLToPath(new URL("../runner-chat.css", import.meta.url)),
  "utf8",
);
const activityCoreCss = readFileSync(
  fileURLToPath(new URL("../../platform-ui/components/thread-components/log-boxes/activity-core.css", import.meta.url)),
  "utf8",
);

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

  it("constrains workflow previews to the standard centered thread-log column", () => {
    expect(runnerChatCss).toMatch(
      /\.tb-metronome-turn-workflow-prompt-shell\s*\{[^}]*width:\s*min\(100%,\s*56rem\)/,
    );
    expect(runnerChatCss).toMatch(
      /\.tb-metronome-turn-workflow-prompt-shell\s*\{[^}]*max-width:\s*56rem/,
    );
    expect(runnerChatCss).toMatch(
      /\.tb-metronome-turn-workflow-prompt-shell\s*\{[^}]*margin:\s*12px\s+auto\s+var\(--tb-user-turn-shell-gap\)/,
    );
    expect(runnerChatCss).not.toMatch(
      /\.tb-metronome-turn-workflow-prompt-shell\s*\{[^}]*width:\s*100cqw/,
    );
  });

  it("uses one single-pixel border for the active minimap node", () => {
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-node\.is-active\s*\{[^}]*border-width:\s*1px/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-node\.is-active\s*\{[^}]*box-shadow:\s*none/,
    );
  });
});
