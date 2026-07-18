import { describe, expect, it } from "vitest";

import { createPlatformCompatibilityUrl } from "./platform-compatibility-navigation.js";
import { getPlatformRoute } from "./platform-route-registry.js";

describe("platform compatibility navigation", () => {
  it("preserves route diagnostics on every handoff", () => {
    const target = new URL(
      createPlatformCompatibilityUrl({
        compatibilityUrl: "/compat",
        route: getPlatformRoute("agents"),
        action: "rename",
        resourceId: "agent-1",
        origin: "https://platform.example.test",
      }),
    );

    expect(target.pathname).toBe("/compat");
    expect(target.searchParams.get("typedRoute")).toBe("agents");
    expect(target.searchParams.get("typedAction")).toBe("rename");
    expect(target.searchParams.get("typedResourceId")).toBe("agent-1");
  });

  it("translates cross-route thread commands into the supported deep link", () => {
    const target = new URL(
      createPlatformCompatibilityUrl({
        compatibilityUrl: "https://platform.example.test/compat",
        route: getPlatformRoute("voice-agents"),
        action: "open-thread",
        resourceId: "thread_123",
      }),
    );

    expect(target.searchParams.get("threadId")).toBe("thread_123");
  });
});
