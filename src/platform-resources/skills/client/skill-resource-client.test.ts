import { describe, expect, it, vi } from "vitest";

import { createSkillResourceRepository } from "./skill-resource-client.js";

describe("skill resource repository", () => {
  it("unwraps a platform skill collection", async () => {
    const get = vi.fn().mockResolvedValue({
      skills: [{ id: "browser" }],
    });
    const repository = createSkillResourceRepository({ get });

    await expect(repository.list()).resolves.toEqual([{ id: "browser" }]);
    expect(get).toHaveBeenCalledWith("/skills", { signal: undefined });
  });
});
