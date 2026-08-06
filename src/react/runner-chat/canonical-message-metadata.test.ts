import { describe, expect, it } from "vitest";

import {
  createInitialRunnerThreadProjection,
  reduceRunnerThreadEvent,
} from "../../thread/projection.js";
import type { RunnerTurn } from "./turn-types.js";
import {
  buildRunnerTurnMessageMetadataIndex,
  buildRunnerTurnRunIdIndex,
  buildRunnerTurnWorkingLabelIndex,
} from "./canonical-message-metadata.js";

function legacyTurn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn-1",
    sourceMessageId: "message-1",
    prompt: "list all my repos",
    logs: [],
    startedAtMs: Date.parse("2026-08-04T08:00:00.000Z"),
    status: "completed",
    ...overrides,
  };
}

function projectionWithRecoveredConnector() {
  const projection = createInitialRunnerThreadProjection("thread-1");
  projection.participantsById.user = {
    id: "user",
    kind: "human",
    displayName: "You",
  };
  projection.messagesById["message-1"] = {
    kind: "message",
    id: "message-1",
    threadId: "thread-1",
    sequence: 1,
    authorParticipantId: "user",
    content: "list all my repos",
    modality: "text",
    metadata: {
      runnerConnectorIds: ["github"],
      connectorMetadataSource: "structured_run_evidence",
    },
    createdAt: "2026-08-04T08:00:00.000Z",
  };
  return projection;
}

describe("legacy turn canonical message metadata bridge", () => {
  it("restores connector metadata by persisted source message id", () => {
    const index = buildRunnerTurnMessageMetadataIndex(
      [legacyTurn()],
      projectionWithRecoveredConnector(),
    );

    expect(index.get("turn-1")).toMatchObject({
      runnerConnectorIds: ["github"],
      connectorMetadataSource: "structured_run_evidence",
    });
  });

  it("falls back to matching historical content and timestamp", () => {
    const index = buildRunnerTurnMessageMetadataIndex(
      [legacyTurn({ id: "legacy-turn", sourceMessageId: null })],
      projectionWithRecoveredConnector(),
    );

    expect(index.get("legacy-turn")?.runnerConnectorIds).toEqual(["github"]);
  });

  it("keeps directly persisted legacy metadata authoritative", () => {
    const index = buildRunnerTurnMessageMetadataIndex(
      [legacyTurn({ messageMetadata: { runnerConnectorIds: ["jira"] } })],
      projectionWithRecoveredConnector(),
    );

    expect(index.has("turn-1")).toBe(false);
  });

  it("recovers from structured tool logs when the source message is outside the page", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    const index = buildRunnerTurnMessageMetadataIndex(
      [legacyTurn({
        sourceMessageId: "message-outside-page",
        logs: [{
          time: "2026-08-04T08:00:01.000Z",
          type: "info",
          eventType: "mcp_tool_call",
          message: "Calling a connector",
          metadata: { toolName: "mcp__connector_github__search_repositories" },
        }],
      })],
      projection,
    );

    expect(index.get("turn-1")).toMatchObject({
      runnerConnectorIds: ["github"],
      connectorMetadataSource: "structured_turn_evidence",
    });
  });

  it("does not bridge metadata to an unrelated turn", () => {
    const index = buildRunnerTurnMessageMetadataIndex(
      [legacyTurn({ id: "other-turn", sourceMessageId: "message-2", prompt: "another task" })],
      projectionWithRecoveredConnector(),
    );

    expect(index.size).toBe(0);
  });
});

describe("legacy turn canonical run bridge", () => {
  it("maps a persisted message link to its worker run and observer working label", () => {
    const initial = projectionWithRecoveredConnector();
    initial.messagesById["message-1"] = {
      ...initial.messagesById["message-1"],
      linkedRunIds: ["run-1"],
    };
    initial.runsById["run-1"] = {
      kind: "run",
      id: "run-1",
      threadId: initial.threadId,
      sequence: 2,
      runKind: "worker",
      status: "running",
      sourceMessageId: "message-1",
      origin: { kind: "message", id: "message-1", sourceMessageId: "message-1" },
      createdAt: "2026-08-04T08:00:01.000Z",
    };
    const projection = reduceRunnerThreadEvent(initial, {
      kind: "event",
      id: "event-working-label",
      threadId: initial.threadId,
      runId: "run-1",
      sequence: 3,
      type: "thread.run.projection.updated",
      producer: { type: "observer", id: "thread-supervision-observer" },
      payloadVersion: 1,
      payload: {
        workingLabel: "Checking the deployment and validating service health.",
        currentSummary: "Worker command output that must not become the label.",
      },
      occurredAt: "2026-08-04T08:00:02.000Z",
      createdAt: "2026-08-04T08:00:02.000Z",
    });
    const turn = legacyTurn({ status: "running" });

    expect(buildRunnerTurnRunIdIndex([turn], projection).get(turn.id)).toBe("run-1");
    expect(buildRunnerTurnWorkingLabelIndex([turn], projection).get(turn.id)).toBe(
      "Checking the deployment and validating service health",
    );
  });
});
