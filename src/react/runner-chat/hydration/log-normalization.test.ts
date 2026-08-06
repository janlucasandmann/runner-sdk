import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../types.js";
import {
  coalesceRunnerStreamingLogs,
  dedupeAdjacentRunnerLogs,
  isDuplicateAssistantSummaryTimelineLog,
  normalizeHydratedLog,
  runnerLogSignature,
  shouldDisplayTimelineLog,
} from "./log-normalization.js";

function log(overrides: Partial<RunnerLog> = {}): RunnerLog {
  return {
    time: "00:00",
    type: "info",
    message: "Working",
    ...overrides,
  };
}

describe("runner hydration log normalization", () => {
  const subagentActor = (invocationId: string) => ({
    kind: "subagent" as const,
    agentId: "agent",
    agentName: "Worker",
    teamAgentId: "team-agent",
    teamAgentName: "Worker",
    claudeAgentName: "worker",
    subagentType: "general-purpose",
    invocationId,
  });

  it("normalizes legacy event, timestamp, duration, and reasoning fields", () => {
    const normalized = normalizeHydratedLog({
      time: "00:00",
      type: "info",
      message: "Thinking",
      event_type: "reasoning",
      created_at: "2026-07-16T10:00:00.000Z",
      is_reasoning: true,
      metadata: { duration_ms: 250 },
    } as RunnerLog);

    expect(normalized).toMatchObject({
      eventType: "reasoning",
      createdAt: "2026-07-16T10:00:00.000Z",
      isReasoning: true,
      metadata: { durationMs: 250 },
    });
  });

  it("keeps materially different shell executions while collapsing richer media updates", () => {
    const shellLogs = dedupeAdjacentRunnerLogs([
      log({
        eventType: "command_execution",
        message: "bash",
        metadata: { command: "bash", output: "first" },
      }),
      log({
        eventType: "command_execution",
        message: "bash",
        metadata: { command: "bash", output: "second" },
      }),
    ]);
    expect(shellLogs).toHaveLength(2);

    const imageLogs = dedupeAdjacentRunnerLogs([
      log({
        eventType: "command_execution",
        message: "Generating",
        metadata: { command: 'generate-image.py "a blue bird"' },
      }),
      log({
        eventType: "command_execution",
        message: "Generated",
        metadata: {
          command: 'generate-image.py "a blue bird"',
          savedImagePath: "bird.png",
          status: "completed",
        },
      }),
    ]);
    expect(imageLogs).toHaveLength(1);
    expect(imageLogs[0].metadata?.savedImagePath).toBe("bird.png");
  });

  it("filters implementation noise but preserves actionable timeline logs", () => {
    expect(
      shouldDisplayTimelineLog(
        log({
          eventType: "file_change",
          message: "Updated internal state",
          metadata: { filePaths: ["/workspace/.claude/state.json"] },
        }),
      ),
    ).toBe(false);
    expect(shouldDisplayTimelineLog(log({ message: "Thinking..." }))).toBe(false);
    expect(
      shouldDisplayTimelineLog(
        log({
          eventType: "command_execution",
          message: "SendUserMessage",
          metadata: { command: "SendUserMessage" },
        }),
      ),
    ).toBe(false);
    expect(
      shouldDisplayTimelineLog(
        log({
          eventType: "command_execution",
          message: "npm test",
          metadata: { command: "npm test" },
        }),
      ),
    ).toBe(true);
  });

  it("keeps subagent reasoning signatures distinct and recognizes duplicate summaries", () => {
    const first = log({
      eventType: "reasoning",
      message: "Inspecting",
      metadata: {
        actor: subagentActor("invocation-a"),
      },
    });
    const second = log({
      eventType: "reasoning",
      message: "Inspecting",
      metadata: {
        actor: subagentActor("invocation-b"),
      },
    });
    expect(runnerLogSignature(first)).not.toBe(runnerLogSignature(second));
    expect(
      isDuplicateAssistantSummaryTimelineLog(
        log({ eventType: "reasoning", message: "Run summary: Finished the migration" }),
        log({ eventType: "agent_message", message: "Finished the migration" }),
      ),
    ).toBe(true);
  });

  it("coalesces provider token fragments without merging executable actions", () => {
    const normalized = dedupeAdjacentRunnerLogs([
      log({
        eventType: "reasoning",
        message: "Inspecting",
        metadata: { source: "provider_reasoning", runId: "run-1" },
      }),
      log({
        eventType: "reasoning",
        message: "the",
        metadata: { source: "provider_reasoning", runId: "run-1" },
      }),
      log({
        eventType: "reasoning",
        message: "repository",
        metadata: { source: "provider_reasoning", runId: "run-1" },
      }),
      log({
        eventType: "command_execution",
        message: "npm test",
        metadata: { command: "npm test", runId: "run-1" },
      }),
      log({
        eventType: "reasoning",
        message: "Tests",
        metadata: { source: "assistant_text", runId: "run-1" },
      }),
      log({
        eventType: "reasoning",
        message: "passed",
        metadata: { source: "assistant_text", runId: "run-1" },
      }),
      log({
        eventType: "reasoning",
        message: ".",
        metadata: { source: "assistant_text", runId: "run-1" },
      }),
    ]);

    expect(normalized).toHaveLength(3);
    expect(normalized[0].message).toBe("Inspecting the repository");
    expect(normalized[0].metadata).toMatchObject({
      streamCoalesced: true,
      fragmentCount: 3,
    });
    expect(normalized[1].metadata?.command).toBe("npm test");
    expect(normalized[2].message).toBe("Tests passed.");
  });

  it("keeps distinct subagent streams separate", () => {
    const normalized = coalesceRunnerStreamingLogs([
      log({
        eventType: "reasoning",
        message: "First",
        metadata: {
          source: "provider_reasoning",
          actor: subagentActor("invocation-a"),
        },
      }),
      log({
        eventType: "reasoning",
        message: "Second",
        metadata: {
          source: "provider_reasoning",
          actor: subagentActor("invocation-b"),
        },
      }),
    ]);

    expect(normalized).toHaveLength(2);
  });
});
