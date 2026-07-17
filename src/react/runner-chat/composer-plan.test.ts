import { describe, expect, it } from "vitest";
import {
  getRunnerComposerPlanDisplay,
  normalizeRunnerComposerPlanTier,
} from "./composer-plan.js";

describe("composer plan presentation", () => {
  it("normalizes historical plan aliases", () => {
    expect(normalizeRunnerComposerPlanTier("pro-plan")).toBe("builder");
    expect(normalizeRunnerComposerPlanTier("scale")).toBe("team");
    expect(normalizeRunnerComposerPlanTier("org")).toBe("enterprise");
    expect(normalizeRunnerComposerPlanTier(undefined)).toBe("sandbox");
  });

  it("maps plans to stable user-facing labels", () => {
    expect(getRunnerComposerPlanDisplay("business").label).toBe("Business Plan");
    expect(getRunnerComposerPlanDisplay("sandbox").label).toBe(
      "Upgrade to Builder",
    );
  });
});
