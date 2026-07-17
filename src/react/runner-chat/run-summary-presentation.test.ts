import { describe, expect, it } from "vitest";
import {
  getRunnerComputerDisplayLabel,
  getRunnerSummaryResourceChipVerb,
  getRunnerSummaryResourceSubtitle,
} from "./run-summary-presentation.js";

describe("run summary presentation", () => {
  it("uses a stable computer label without duplicating the suffix", () => {
    expect(getRunnerComputerDisplayLabel("Default")).toBe("Default Computer");
    expect(getRunnerComputerDisplayLabel("Desktop Computer")).toBe(
      "Desktop Computer",
    );
  });

  it("projects resource metadata and mutation verbs", () => {
    expect(getRunnerSummaryResourceSubtitle({
      id: "agent_1",
      name: "Reviewer",
      resourceType: "agent",
      mutationVerb: "created",
      model: "GPT-5",
      isDefault: true,
    })).toBe("GPT-5 · Default");
    expect(getRunnerSummaryResourceChipVerb({
      id: "agent_1",
      name: "Reviewer",
      resourceType: "agent",
      mutationVerb: "updated",
    })).toBe("Updated");
  });
});
