import { describe, expect, it, vi } from "vitest";

import { createApiKeyRepository } from "./api-key-repository.js";

describe("API key repository", () => {
  it("uses the normalized platform API boundary", async () => {
    const get = vi.fn()
      .mockResolvedValueOnce({ keys: [{ id: "key_1" }] })
      .mockResolvedValueOnce({ key: "secret" })
      .mockResolvedValueOnce({ analytics: { period: "month" } });
    const post = vi.fn()
      .mockResolvedValueOnce({ id: "key_2", key: "created" })
      .mockResolvedValueOnce({});
    const repository = createApiKeyRepository({ get, post });

    await expect(repository.list()).resolves.toEqual([{ id: "key_1" }]);
    await expect(repository.create({
      name: "Automation",
      permissions: ["threads:read"],
    })).resolves.toMatchObject({ id: "key_2", key: "created" });
    await expect(repository.reveal("key_2")).resolves.toBe("secret");
    await expect(repository.revoke("key_2")).resolves.toBeUndefined();
    await repository.readAnalytics("month");

    expect(get).toHaveBeenNthCalledWith(1, "/api-keys", {
      signal: undefined,
    });
    expect(post).toHaveBeenNthCalledWith(1, "/api-keys", {
      name: "Automation",
      permissions: ["threads:read"],
    });
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/api-keys/key_2/reveal",
      { signal: undefined },
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/api-keys/key_2/revoke",
      {},
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/api-keys/analytics/overview",
      { query: { period: "month" }, signal: undefined },
    );
  });
});
