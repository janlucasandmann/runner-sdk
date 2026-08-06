import { describe, expect, it } from "vitest";
import {
  isComputeTokenBudgetErrorMessage,
  mergeConversationMessageRunMetadataFromLogs,
  normalizeRunnerConversationMessage,
  sanitizeRunnerMessage,
  sortRunnerConversationMessagesChronologically,
} from "./conversation-messages.js";

describe("runner conversation messages", () => {
  it("normalizes provider failures without exposing runtime internals", () => {
    expect(
      sanitizeRunnerMessage(
        "Claw worker exited with code 137 while processing the request"
      )
    ).toContain("agent stopped unexpectedly");
    expect(
      sanitizeRunnerMessage(
        'API failed after 3 attempts: Cloudflare API returned 503 {"code":3045}'
      )
    ).toContain("model provider is temporarily unavailable");
  });

  it("normalizes canonical message fields and usage metadata", () => {
    expect(
      normalizeRunnerConversationMessage({
        message_id: "message",
        author_role: "ASSISTANT",
        content: [{ text: "Done" }],
        model_id: "gpt-5",
        cost_usd: 0.25,
        usage: { input_tokens: 100, output_tokens: 20 },
      })
    ).toMatchObject({
      id: "message",
      role: "assistant",
      content: "Done",
      inputTokens: 100,
      outputTokens: 20,
      logMetadata: {
        model: "gpt-5",
        computeTokens: 25,
      },
    });
  });

  it("hydrates persisted user-message presentation metadata aliases", () => {
    expect(
      normalizeRunnerConversationMessage({
        message_id: "message-user",
        role: "user",
        content: "Create the issue",
        message_metadata: {
          runnerConnectorIds: ["atlassian"],
        },
      })
    ).toMatchObject({
      id: "message-user",
      role: "user",
      logMetadata: {
        runnerConnectorIds: ["atlassian"],
      },
    });
  });

  it("sorts timestamped messages and enriches assistant metadata from logs", () => {
    const sorted = sortRunnerConversationMessagesChronologically([
      {
        role: "assistant",
        content: "Done",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      {
        role: "user",
        content: "Start",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    const enriched = mergeConversationMessageRunMetadataFromLogs(sorted, [
      {
        time: "00:00",
        type: "info",
        eventType: "agent_message",
        message: "Done",
        metadata: { durationMs: 500, outputTokens: 8 },
      },
    ]);

    expect(enriched.map((message) => message.role)).toEqual([
      "user",
      "assistant",
    ]);
    expect(enriched[1]).toMatchObject({
      durationMs: 500,
      outputTokens: 8,
    });
  });

  it("recognizes legacy budget errors", () => {
    expect(
      isComputeTokenBudgetErrorMessage(
        "Insufficient compute tokens balance; upgrade your quota"
      )
    ).toBe(true);
  });
});
