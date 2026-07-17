import { describe, expect, it, vi } from "vitest";

import { createModelCatalogRepository } from "./model-catalog-repository.js";

describe("model catalog repository", () => {
  it("unwraps the managed model catalog through the platform API", async () => {
    const get = vi.fn().mockResolvedValue({
      models: [{ id: "claude-opus-4-8" }],
    });
    const repository = createModelCatalogRepository({ get });

    await expect(repository.listAgentModels()).resolves.toEqual([
      { id: "claude-opus-4-8" },
    ]);
    expect(get).toHaveBeenCalledWith("/agents/models", {
      signal: undefined,
    });
  });
});
