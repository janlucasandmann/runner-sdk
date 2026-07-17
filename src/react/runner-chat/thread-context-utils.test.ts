import { describe, expect, it } from "vitest";
import {
  buildContextIndicatorTitle,
  deriveThreadContextDisplayMetrics,
  formatCompactTokenCount,
  formatThreadContextCommandText,
  getContextCategoryDisplayTokens,
  isThreadContextCommandPrompt,
  parseAutoStageThreadContextCommand,
  parseThreadContextCommand,
  stagedThreadContextCommandOffset,
  stagedThreadContextCommandTone,
  threadContextActionAllowsPrompt,
  threadContextCategoryColor,
  type RunnerChatThreadContext,
  type RunnerChatThreadContextDetails,
} from "./thread-context-utils.js";

const estimate: RunnerChatThreadContext = {
  threadId: "thread_1",
  sessionId: null,
  model: "test-model",
  maxTokens: 100_000,
  usedTokens: 24_000,
  remainingTokens: 76_000,
  remainingRatio: 0.76,
  source: "estimate",
  exact: false,
};

describe("thread context metrics", () => {
  it("uses the explicit free-space category as the canonical remaining capacity", () => {
    const details: RunnerChatThreadContextDetails = {
      ...estimate,
      exact: true,
      categories: [
        { key: "system_prompt", label: "System prompt", tokens: 5_000, ratio: 0.05, kind: "used" },
        { key: "messages", label: "Messages", tokens: 30_000, ratio: 0.3, kind: "used" },
        { key: "free_space", label: "Free space", tokens: 65_000, ratio: 0.65, kind: "free" },
      ],
    };

    expect(deriveThreadContextDisplayMetrics(details)).toEqual({
      usedTokens: 35_000,
      remainingTokens: 65_000,
      remainingRatio: 0.65,
      usedRatio: 0.35,
    });
  });

  it("derives capacity from non-free categories when the backend omits free space", () => {
    const details: RunnerChatThreadContextDetails = {
      ...estimate,
      categories: [
        { key: "system_prompt", label: "System prompt", tokens: 12_000, ratio: 0.12, kind: "used" },
        { key: "messages", label: "Messages", tokens: 18_000, ratio: 0.18, kind: "used" },
      ],
    };

    expect(deriveThreadContextDisplayMetrics(details)).toMatchObject({
      usedTokens: 30_000,
      remainingTokens: 70_000,
      remainingRatio: 0.7,
    });
  });

  it("formats compact counts and the accessible indicator title", () => {
    expect(formatCompactTokenCount(999)).toBe("999");
    expect(formatCompactTokenCount(1_500)).toBe("1.5k");
    expect(formatCompactTokenCount(12_000)).toBe("12k");
    expect(formatCompactTokenCount(1_250_000)).toBe("1.3M");
    expect(buildContextIndicatorTitle(estimate, true, false)).toBe(
      "Conversation context remaining: 76% (estimate) • 76k / 100k tokens",
    );
    expect(buildContextIndicatorTitle(null, true, true)).toBe("Loading conversation context…");
  });

  it("uses derived remaining tokens for the free-space row", () => {
    const metrics = deriveThreadContextDisplayMetrics(estimate);
    expect(getContextCategoryDisplayTokens(
      { key: "free_space", label: "Free space", tokens: 1, ratio: 0, kind: "free" },
      metrics,
    )).toBe(76_000);
  });
});

describe("thread context commands", () => {
  it("parses context actions and their optional prompts", () => {
    expect(parseThreadContextCommand("/context")).toEqual({ action: "context" });
    expect(parseThreadContextCommand("/compact keep decisions")).toEqual({
      action: "compact",
      prompt: "keep decisions",
    });
    expect(parseThreadContextCommand("/clear")).toEqual({ action: "clear" });
    expect(parseThreadContextCommand("/fork explore option b")).toEqual({
      action: "fork",
      prompt: "explore option b",
    });
    expect(parseThreadContextCommand("/btw status?")).toEqual({
      action: "btw",
      prompt: "status?",
    });
    expect(parseThreadContextCommand("compact")).toBeNull();
    expect(parseThreadContextCommand("/unknown")).toBeNull();
  });

  it("auto-stages only prompt-bearing commands", () => {
    expect(parseAutoStageThreadContextCommand("/compact preserve tests")).toEqual({
      action: "compact",
      prompt: "preserve tests",
    });
    expect(parseAutoStageThreadContextCommand("/clear")).toBeNull();
    expect(parseAutoStageThreadContextCommand("/context")).toBeNull();
  });

  it("formats and identifies command prompts", () => {
    expect(formatThreadContextCommandText("compact", " keep tests ")).toBe("/compact keep tests");
    expect(formatThreadContextCommandText("clear", "ignored")).toBe("/clear");
    expect(isThreadContextCommandPrompt("/fork another approach")).toBe(true);
    expect(isThreadContextCommandPrompt("/fork another approach", "fork")).toBe(true);
    expect(isThreadContextCommandPrompt("/fork another approach", "compact")).toBe(false);
    expect(threadContextActionAllowsPrompt("btw")).toBe(true);
    expect(threadContextActionAllowsPrompt("clear")).toBe(false);
  });

  it("maps commands and context categories to presentation policy", () => {
    expect(stagedThreadContextCommandTone("compact")).toBe("compact");
    expect(stagedThreadContextCommandTone("clear")).toBe("neutral");
    expect(stagedThreadContextCommandOffset("compact")).toBe("82px");
    expect(stagedThreadContextCommandOffset(null)).toBe("16px");
    expect(threadContextCategoryColor({
      key: "autocompact_buffer",
      label: "Buffer",
      tokens: 0,
      ratio: 0,
      kind: "buffer",
    })).toBe("#fbbf24");
  });
});
