import { describe, expect, it } from "vitest";

import {
  isRunnerThreadGenericActivityGroupLabel,
  normalizeRunnerThreadWorkingLabel,
} from "./working-label.js";

describe("runner thread working labels", () => {
  it("accepts concise action-grounded labels", () => {
    expect(normalizeRunnerThreadWorkingLabel("searching workspace code.")).toBe(
      "Searching workspace code",
    );
    expect(normalizeRunnerThreadWorkingLabel("Creating a GitHub issue")).toBe(
      "Creating a GitHub issue",
    );
  });

  it("rejects vague labels while accepting an informative observer sentence", () => {
    expect(normalizeRunnerThreadWorkingLabel("Working through the current task")).toBeNull();
    expect(normalizeRunnerThreadWorkingLabel("Implementing changes in the workspace")).toBeNull();
    expect(
      normalizeRunnerThreadWorkingLabel("Reviewing the complete implementation before running tests"),
    ).toBe("Reviewing the complete implementation before running tests");
  });

  it("rejects observer labels that are too long for a one-line working status", () => {
    expect(normalizeRunnerThreadWorkingLabel(
      "Reviewing every implementation detail across the workspace while validating all tests and deployment contracts before preparing the final production release notes for the operator",
    )).toBeNull();
  });

  it("shares generic group detection with activity presentation", () => {
    expect(isRunnerThreadGenericActivityGroupLabel("Working through the task")).toBe(true);
    expect(isRunnerThreadGenericActivityGroupLabel("Inspecting authentication flow")).toBe(false);
  });
});
