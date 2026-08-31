import { describe, expect, it } from "vitest";

import {
  filterRunnerWorkflowTriggerOptions,
  normalizeRunnerWorkflowTriggerOptions,
} from "./composer-workflows.js";

describe("composer workflow triggers", () => {
  it("normalizes commands and keeps only one workflow per command", () => {
    expect(normalizeRunnerWorkflowTriggerOptions([
      { id: "met_1", name: "Campaign", command: "campaign" },
      { id: "met_2", name: "Duplicate", command: "@CAMPAIGN" },
      { id: "met_3", name: "Empty", command: "@" },
    ])).toEqual([
      {
        id: "met_1",
        workflowId: "met_1",
        name: "Campaign",
        command: "@campaign",
        description: "",
      },
    ]);
  });

  it("filters by workflow name, command, and description", () => {
    const options = normalizeRunnerWorkflowTriggerOptions([
      { id: "met_1", name: "Campaign Review", command: "@campaign", description: "Review launch assets" },
      { id: "met_2", name: "Daily Brief", command: "@brief", description: "Morning summary" },
    ]);

    expect(filterRunnerWorkflowTriggerOptions(options, "launch")).toHaveLength(1);
    expect(filterRunnerWorkflowTriggerOptions(options, "brief")[0]?.id).toBe("met_2");
  });

  it("keeps multiple commands from one workflow independently selectable", () => {
    const options = normalizeRunnerWorkflowTriggerOptions([
      { id: "met_1:trigger-a", workflowId: "met_1", name: "Campaign", command: "@launch" },
      { id: "met_1:trigger-b", workflowId: "met_1", name: "Campaign", command: "@report" },
    ]);

    expect(options.map((option) => option.id)).toEqual([
      "met_1:trigger-a",
      "met_1:trigger-b",
    ]);
    expect(options.every((option) => option.workflowId === "met_1")).toBe(true);
  });
});
