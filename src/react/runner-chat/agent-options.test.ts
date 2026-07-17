import { describe, expect, it } from "vitest";
import {
  buildRunnerAgentGuardrailsHiddenPrompt,
  buildRunnerExecutionPromptWithHiddenContext,
  extractRunnerVisibleContentFromHiddenExecutionPrompt,
  getRunnerAgentOptionProviderType,
  getRunnerPreferredDefaultAgentOption,
  isRunnerTeamAgentOption,
  normalizeRunnerReasoningEffort,
  type RunnerChatOption,
} from "./agent-options.js";

describe("runner agent options", () => {
  it("selects a stable default and recognizes team records", () => {
    const team = {
      id: "team",
      name: "Team",
      metadata: { kind: "team", team: { members: [] } },
    };
    const assistant = { id: "agent_assistant", name: "Assistant" };

    expect(isRunnerTeamAgentOption(team)).toBe(true);
    expect(getRunnerPreferredDefaultAgentOption([team, assistant])).toBe(
      assistant
    );
  });

  it("infers model providers from agent metadata", () => {
    expect(
      getRunnerAgentOptionProviderType({
        id: "agent",
        name: "Agent",
        metadata: { modelId: "claude-sonnet-4-5" },
      } as RunnerChatOption & { metadata: Record<string, unknown> })
    ).toBe("anthropic");
  });

  it("builds hidden guardrails while preserving the visible prompt", () => {
    const hidden = buildRunnerAgentGuardrailsHiddenPrompt({
      id: "agent",
      name: "Agent",
      metadata: {
        promptAdaptations: [{ content: "Never disclose internal IDs." }],
      },
    } as RunnerChatOption & { metadata: Record<string, unknown> });
    const executionPrompt = buildRunnerExecutionPromptWithHiddenContext(
      [hidden],
      "Summarize the run"
    );

    expect(hidden).toContain("Never disclose internal IDs.");
    expect(extractRunnerVisibleContentFromHiddenExecutionPrompt(executionPrompt))
      .toBe("Summarize the run");
  });

  it("normalizes legacy reasoning effort aliases", () => {
    expect(normalizeRunnerReasoningEffort("extra_high")).toBe("high");
    expect(normalizeRunnerReasoningEffort("unknown")).toBe("low");
  });
});
