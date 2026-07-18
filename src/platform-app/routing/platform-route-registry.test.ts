import { describe, expect, it } from "vitest";
import {
  getPlatformRoute,
  getPlatformRoutesForMode,
  matchPlatformLegacyRoute,
  matchPlatformPathname,
  PLATFORM_ROUTE_REGISTRY,
} from "./platform-route-registry.js";

describe("platform route registry", () => {
  it("keeps route identifiers unique", () => {
    expect(new Set(PLATFORM_ROUTE_REGISTRY.map((route) => route.id)).size).toBe(
      PLATFORM_ROUTE_REGISTRY.length,
    );
  });

  it("maps resource routes without relying on list position", () => {
    expect(matchPlatformLegacyRoute({
      page: "resources",
      resourceView: "servers",
      serverKind: "database",
    })?.id).toBe("databases");
    expect(getPlatformRoute("agents").mode).toBe("configure");
  });

  it("provides mode-specific projections", () => {
    expect(getPlatformRoutesForMode("develop").every((route) => route.mode === "develop")).toBe(true);
    expect(getPlatformRoutesForMode("create").some((route) => route.id === "thread")).toBe(true);
  });

  it("matches canonical paths both inside and outside the hosted client base", () => {
    expect(matchPlatformPathname("/configure/computers")?.id).toBe("computers");
    expect(matchPlatformPathname("/platform-client/develop/databases/")?.id).toBe("databases");
    expect(matchPlatformPathname("/configure/notifications")?.id).toBe("notifications");
    expect(getPlatformRoute("develop-home").path).toBe("/develop");
  });

  it("places Notifications directly after Configure Home", () => {
    expect(
      getPlatformRoutesForMode("configure").slice(0, 2).map((route) => route.id),
    ).toEqual(["configure-home", "notifications"]);
  });
});
