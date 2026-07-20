import { describe, expect, it, vi } from "vitest";

import { createAgentResourceRepository } from "./agent-resource-client.js";

describe("agent resource repository", () => {
  it("unwraps list responses and encodes delete identifiers", async () => {
    const get = vi.fn().mockResolvedValue({
      payload: {
        resources: [{ agentId: "agent-1" }],
      },
    });
    const remove = vi.fn().mockResolvedValue({ deleted: true });
    const repository = createAgentResourceRepository({
      get,
      delete: remove,
    });

    await expect(repository.list()).resolves.toEqual([{ id: "agent-1", agentId: "agent-1" }]);
    await repository.delete("agent / 1");

    expect(get).toHaveBeenCalledWith("/agents", { signal: undefined });
    expect(remove).toHaveBeenCalledWith("/agents/agent%20%2F%201");
  });

  it("rejects empty delete identifiers before making a request", async () => {
    const remove = vi.fn();
    const repository = createAgentResourceRepository({
      get: vi.fn(),
      delete: remove,
    });

    await expect(repository.delete(" ")).rejects.toThrow("agent id");
    expect(remove).not.toHaveBeenCalled();
  });
});
