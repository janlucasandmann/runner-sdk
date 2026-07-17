import { describe, expect, it, vi } from "vitest";

import { createConfigureHomeRepository } from "./configure-home-client.js";

describe("configure home repository", () => {
  it("unwraps notification envelopes through the shared API transport", async () => {
    const get = vi.fn().mockResolvedValue({
      notifications: [{ id: "notification-1" }],
    });
    const repository = createConfigureHomeRepository({ get });

    await expect(repository.listNotifications()).resolves.toEqual([
      { id: "notification-1" },
    ]);
    expect(get).toHaveBeenCalledWith(
      "/notifications/in-app",
      { signal: undefined },
    );
  });
});
