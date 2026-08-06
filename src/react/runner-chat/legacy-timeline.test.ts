import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../types.js";
import {
  buildSubagentTimelineGroups,
  buildTimelineItems,
  getTurnMetronomeWorkflowPromptLog,
  isRunnerTimelineToolCallItem,
} from "./legacy-timeline.js";
import {
  buildSubagentGroupPresentation,
} from "./legacy-timeline-presentation.js";
import type { RunnerTurn } from "./turn-types.js";

function log(patch: Partial<RunnerLog>): RunnerLog {
  return {
    time: "00:01",
    message: "",
    type: "info",
    ...patch,
  } as RunnerLog;
}

function turn(logs: RunnerLog[], patch: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn-1",
    prompt: "Do the work",
    status: "completed",
    startedAtMs: 1_000,
    logs,
    ...patch,
  } as RunnerTurn;
}

describe("legacy thread timeline projection", () => {
  it("keeps only the latest state for a permission request", () => {
    const pending = log({
      eventType: "permission_request",
      message: "Needs permission",
      metadata: { permissionRequestId: "permission-1", status: "pending" },
    });
    const approved = log({
      eventType: "permission_request",
      message: "Permission approved",
      metadata: { permissionRequestId: "permission-1", status: "approved" },
    });

    const items = buildTimelineItems([pending, approved]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "log",
      log: {
        message: "Permission approved",
        metadata: { permissionRequestId: "permission-1", status: "approved" },
      },
    });
  });

  it("groups a subagent invocation and its nested activity causally", () => {
    const invocation = log({
      eventType: "subagent_invocation",
      message: "Delegate",
      metadata: {
        subagentInvocation: {
          invocationId: "subagent-1",
          status: "started",
          agentName: "Verifier",
          message: "Review the implementation",
        } as never,
      },
    });
    const nested = log({
      eventType: "command_execution",
      message: "Run tests",
      metadata: {
        parentToolUseId: "subagent-1",
        subagentInvocation: { invocationId: "subagent-1" } as never,
      },
    });
    const completion = log({
      eventType: "subagent_invocation",
      message: "Complete",
      metadata: {
        subagentInvocation: {
          invocationId: "subagent-1",
          status: "completed",
          agentName: "Verifier",
        } as never,
        output: "All checks passed.",
      },
    });

    const groups = buildSubagentTimelineGroups([invocation, nested, completion]);
    const group = groups.get("subagent-1");

    expect(group?.invocationLog).toBe(invocation);
    expect(group?.logs).toEqual([nested]);
    expect(group?.completionLog).toBe(completion);
    if (!group) {
      throw new Error("Expected a subagent timeline group.");
    }

    const presentation = buildSubagentGroupPresentation(
      turn([invocation, nested, completion], { agentName: "Worker" }),
      group,
      { displayedEnvironmentLabel: "Development VM" },
    );
    expect(presentation).toMatchObject({
      invocationId: "subagent-1",
      title: "Verifier",
      environmentName: "Development VM",
      running: false,
      responseMessage: "All checks passed.",
    });
    expect(presentation.nestedItems).toHaveLength(2);
  });

  it("recognizes a metronome workflow event that replaces the user prompt", () => {
    const workflow = log({
      eventType: "metronome_workflow",
      metadata: {
        metronomeWorkflow: {
          status: "running",
          displayAsPrompt: true,
        },
      },
    });

    expect(getTurnMetronomeWorkflowPromptLog(turn([workflow]))).toBe(workflow);
  });

  it("classifies tool activity without treating reasoning as a tool call", () => {
    expect(isRunnerTimelineToolCallItem({
      kind: "log",
      log: log({ eventType: "reasoning", message: "Considering the next step" }),
    })).toBe(false);
    expect(isRunnerTimelineToolCallItem({
      kind: "log",
      log: log({ eventType: "command_execution", message: "npm test" }),
    })).toBe(true);
    expect(isRunnerTimelineToolCallItem({
      kind: "log",
      log: log({ eventType: "mcp_tool_call", metadata: { toolName: "read_file" } }),
    })).toBe(true);
  });
});
