// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRunnerAgentSelectionController } from "./use-agent-selection-controller.js";

const agents = [
  { id: "agent-1", name: "Primary", isDefault: true },
  { id: "agent-2", name: "Research", agentType: "team" },
];

describe("useRunnerAgentSelectionController", () => {
  it("keeps a valid local selection and repairs it when agents change", () => {
    const { result, rerender } = renderHook(
      ({ options }) =>
        useRunnerAgentSelectionController({
          activePopup: null,
          agents: options,
        }),
      { initialProps: { options: agents } },
    );

    expect(result.current.selectedAgentId).toBe("agent-1");
    act(() => result.current.setSelectedAgentId("agent-2"));
    expect(result.current.selectedAgentId).toBe("agent-2");

    rerender({ options: [agents[0]] });
    expect(result.current.selectedAgentId).toBe("agent-1");
  });

  it("synchronizes controlled reasoning and initializes popup mode per open", () => {
    const { result, rerender } = renderHook(
      ({ activePopup, reasoning }: { activePopup: string | null; reasoning: "low" | "high" }) =>
        useRunnerAgentSelectionController({
          activePopup,
          agentId: "agent-2",
          agents,
          controlledReasoningEffort: reasoning,
        }),
      { initialProps: { activePopup: null, reasoning: "low" } },
    );

    rerender({ activePopup: "agent", reasoning: "high" });
    expect(result.current.selectedReasoningEffort).toBe("high");
    expect(result.current.agentPopupMode).toBe("teams");
    expect(result.current.initialAgentTopId).toBe("agent-2");
  });
});
