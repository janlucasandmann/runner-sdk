import { describe, expect, it } from "vitest";

import { normalizeRunnerThreadTimelinePage } from "./normalize.js";
import {
  createInitialRunnerThreadProjection,
  projectRunnerThreadTimelinePage,
} from "./projection.js";

const threadId = "thread_EjIYDUE8xy-zd-k_tZieY";
const runId = "run_ZVp3vxsH_2l2tBYJ66GmP";
const messageId = "msg_mTMHJP4BQyBuA1VXZwwEJ";

function historicalTimelinePage() {
  return normalizeRunnerThreadTimelinePage({
    threadId,
    items: [
      {
        id: "event-message",
        kind: "event",
        runId,
        sequence: 1,
        createdAt: "2026-08-04T08:00:00.000Z",
        payload: {
          type: "thread.message.created",
          producerType: "user",
          producerId: "user-1",
          data: {
            role: "user",
            content: "list all my repos",
            messageId,
            legacyMirrored: true,
          },
        },
      },
      {
        id: "event-action-intent",
        kind: "event",
        runId,
        sequence: 14,
        createdAt: "2026-08-04T08:00:01.000Z",
        payload: {
          type: "thread.runtime.action_intent.proposed",
          producerType: "service",
          producerId: "runtime",
          data: {
            toolName: "mcp__connector_github__get_me",
            connectorAuthorization: {
              connectorId: "github",
              serverName: "connector_github",
            },
          },
        },
      },
    ],
    runs: [
      {
        id: runId,
        kind: "worker",
        status: "completed",
        triggerMessageId: messageId,
        createdAt: "2026-08-04T08:00:00.000Z",
        completedAt: "2026-08-04T08:00:02.000Z",
      },
    ],
  });
}

describe("historical thread connector metadata", () => {
  it("uses a canonical thread-message source id when event payloads omit messageId", () => {
    const sourceMessageId = "msg_project_mention_stable";
    const page = normalizeRunnerThreadTimelinePage({
      threadId,
      items: [1, 2].map((sequence) => ({
        id: `event-message-${sequence}`,
        kind: "event",
        runId,
        sequence,
        createdAt: `2026-08-04T08:00:0${sequence}.000Z`,
        payload: {
          type: "thread.message.created",
          producerType: "user",
          producerId: "user-1",
          sourceType: "thread_message",
          sourceId: sourceMessageId,
          data: {
            role: "user",
            content: "@Spark please help",
          },
        },
      })),
    });
    const projection = projectRunnerThreadTimelinePage(
      createInitialRunnerThreadProjection(threadId),
      page,
    );

    expect(Object.keys(projection.messagesById)).toEqual([sourceMessageId]);
  });

  it("restores a connector chip from structured evidence in the message run", () => {
    const page = historicalTimelinePage();
    const projection = projectRunnerThreadTimelinePage(
      createInitialRunnerThreadProjection(threadId),
      page,
    );

    expect(projection.messagesById[messageId]?.linkedRunIds).toContain(runId);
    expect(projection.messagesById[messageId]?.metadata).toMatchObject({
      runnerConnectorIds: ["github"],
      connectorMetadataSource: "structured_run_evidence",
    });
  });

  it("does not infer connectors from user prose", () => {
    const page = normalizeRunnerThreadTimelinePage({
      threadId,
      items: [
        {
          id: "message-with-provider-name",
          kind: "message",
          runId,
          sequence: 1,
          createdAt: "2026-08-04T08:00:00.000Z",
          payload: {
            role: "user",
            content: "Use GitHub to list all my repos",
            messageId,
          },
        },
      ],
    });
    const projection = projectRunnerThreadTimelinePage(
      createInitialRunnerThreadProjection(threadId),
      page,
    );

    expect(projection.messagesById[messageId]?.metadata?.runnerConnectorIds).toBeUndefined();
  });

  it("does not leak connector evidence between runs", () => {
    const page = historicalTimelinePage();
    const unrelatedMessageId = "message-unrelated";
    page.items.push({
      kind: "message",
      id: unrelatedMessageId,
      threadId,
      sequence: 20,
      authorParticipantId: `${threadId}:participant:human:user-1`,
      content: "A separate request",
      modality: "text",
      linkedRunIds: ["run-unrelated"],
      createdAt: "2026-08-04T08:01:00.000Z",
    });
    const projection = projectRunnerThreadTimelinePage(
      createInitialRunnerThreadProjection(threadId),
      page,
    );

    expect(
      projection.messagesById[unrelatedMessageId]?.metadata?.runnerConnectorIds,
    ).toBeUndefined();
  });

  it("keeps directly persisted message metadata authoritative", () => {
    const page = historicalTimelinePage();
    const message = page.items.find((item) => item.kind === "event" && item.id === "event-message");
    if (message?.kind === "event") {
      message.payload.messageMetadata = { runnerConnectorIds: ["jira"] };
    }
    const projection = projectRunnerThreadTimelinePage(
      createInitialRunnerThreadProjection(threadId),
      page,
    );

    expect(projection.messagesById[messageId]?.metadata?.runnerConnectorIds).toEqual(["jira"]);
  });
});
