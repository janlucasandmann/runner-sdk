import { describe, expect, it } from "vitest";

import {
  createModelsOverviewProjection,
  mergeAgentModelCatalog,
} from "./models-overview-model.js";

describe("models overview model", () => {
  it("merges remote metadata over the managed fallback catalog", () => {
    const models = mergeAgentModelCatalog([{
      id: "claude-opus-4-8",
      label: "Claude Opus 4.8",
      location: "us-east",
      capabilities: ["Reasoning"],
    }]);
    expect(models.find((model) => model.id === "claude-opus-4-8"))
      .toMatchObject({
        contextWindow: "Custom",
        location: "us-east",
        capabilities: ["Reasoning"],
      });
  });

  it("projects filtered, sorted rows with professional detail metadata", () => {
    const projection = createModelsOverviewProjection({
      category: "agent",
      remoteAgentModels: [],
      providerFilter: "anthropic",
      query: "opus",
      sorting: { id: "name", direction: "asc" },
    });

    expect(projection.rows.length).toBeGreaterThan(0);
    expect(projection.rows.every((row) => row.id.startsWith("claude-opus")))
      .toBe(true);
    expect(projection.rows[0].details).toMatchObject({
      categoryLabel: "Agent model",
      canCreateAgent: true,
    });
  });

  it("keeps non-agent catalogs available", () => {
    expect(createModelsOverviewProjection({
      category: "video",
      remoteAgentModels: [],
    }).rows.map((row) => row.id)).toContain("seedance-2.0");
  });
});
