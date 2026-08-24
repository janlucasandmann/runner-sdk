// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  MetronomeConditionResult,
  buildMetronomeConditionResultPresentation,
} from "./metronome-condition-result.js";

afterEach(cleanup);

describe("MetronomeConditionResult", () => {
  it("shows every path and highlights only the selected path", () => {
    const { container } = render(
      <MetronomeConditionResult
        conditionLabel="Focus · Issues"
        options={[
          { id: "enabled", label: "Enabled", selected: true },
          { id: "else", label: "Default" },
        ]}
      />,
    );

    expect(screen.getByText("Focus · Issues")).toBeTruthy();
    expect(screen.getByText("Enabled")).toBeTruthy();
    expect(screen.getByText("Default")).toBeTruthy();
    expect(container.querySelectorAll(".playground-metronome-condition-result__option.is-selected")).toHaveLength(1);
    expect(container.querySelectorAll(".playground-metronome-condition-result__branch-line")).toHaveLength(3);
    expect(container.querySelectorAll(".playground-metronome-condition-result__branch-line.is-selected")).toHaveLength(1);
    expect(container.querySelectorAll("marker")).toHaveLength(2);
    expect(container.querySelector(".playground-metronome-condition-result__connector svg")?.getAttribute("viewBox")).toBe("0 0 40 88");
    expect(container.querySelector(".playground-metronome-condition-result__branch-line")?.getAttribute("d")).toContain(" C ");
    expect(container.querySelector(".playground-metronome-condition-result__branch-line")?.getAttribute("marker-end")).toContain("condition-arrow");
    const selectedOption = screen.getByText("Enabled").closest(".playground-metronome-condition-result__option");
    expect(selectedOption?.getAttribute("aria-current")).toBe("step");
    expect(container.querySelector(".playground-metronome-condition-result__selected-icon")).toBeNull();
    expect(container.textContent).not.toContain("edgeId");
    expect(container.querySelector("pre")).toBeNull();
  });

  it("builds the presentation from the workflow node rather than downstream nodes", () => {
    const presentation = buildMetronomeConditionResultPresentation(
      {
        kind: "condition",
        branchId: "else",
        branchLabel: "Default",
        selectedEdgeId: "edge-condition-end",
      },
      {
        id: "condition-knowledge",
        data: {
          kind: "condition",
          label: "Focus · Knowledge",
          config: {
            conditionType: "json",
            conditions: [
              { id: "enabled", label: "Enabled", rule: "input.focus.knowledge" },
              { id: "else", label: "Else" },
            ],
          },
        },
      },
    );

    expect(presentation.conditionLabel).toBe("Focus · Knowledge");
    expect(presentation.options).toEqual([
      { id: "enabled", label: "Enabled", selected: false },
      { id: "else", label: "Default", selected: true },
    ]);
  });
});
