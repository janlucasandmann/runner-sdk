import { describe, expect, it } from "vitest";

import {
  isPlatformTypedRoute,
  platformTypedRouteUsesCompatibilityHandoff,
} from "../routes/platform-route-outlet.js";
import {
  createPlatformRouteMigrationReport,
  getPlatformRouteMigrationStage,
  PLATFORM_ROUTE_CAPABILITY_OWNERSHIP,
} from "./platform-route-capabilities.js";
import { PLATFORM_ROUTE_REGISTRY } from "./platform-route-registry.js";

describe("platform route capability ownership", () => {
  it("covers every registered route exactly once", () => {
    const registeredRouteIds = PLATFORM_ROUTE_REGISTRY.map((route) => route.id).sort();
    const ownedRouteIds = Object.keys(PLATFORM_ROUTE_CAPABILITY_OWNERSHIP).sort();

    expect(ownedRouteIds).toEqual(registeredRouteIds);
  });

  it("keeps typed presentation registration aligned with native ownership", () => {
    for (const route of PLATFORM_ROUTE_REGISTRY) {
      expect(isPlatformTypedRoute(route.id), `${route.id} presentation ownership`).toBe(
        PLATFORM_ROUTE_CAPABILITY_OWNERSHIP[route.id].presentation === "native",
      );
    }
  });

  it("withholds the compatibility command escape hatch from native routes", () => {
    for (const route of PLATFORM_ROUTE_REGISTRY) {
      if (!isPlatformTypedRoute(route.id)) continue;
      expect(
        platformTypedRouteUsesCompatibilityHandoff(route.id),
        `${route.id} compatibility handoff`,
      ).toBe(getPlatformRouteMigrationStage(route.id) !== "native");
    }
  });

  it("ratchets migration forward from the recorded baseline", () => {
    const report = createPlatformRouteMigrationReport();

    expect(report.routeCount).toBe(34);
    expect(report.routesByStage.compatibility.length).toBeLessThanOrEqual(17);
    expect(
      report.routesByStage.hybrid.length + report.routesByStage.native.length,
    ).toBeGreaterThanOrEqual(15);
    expect(report.nativeCapabilityCount).toBeGreaterThanOrEqual(35);
    expect(report.routesByStage.native.length).toBeGreaterThanOrEqual(2);
    expect(getPlatformRouteMigrationStage("api-keys")).toBe("native");
    expect(getPlatformRouteMigrationStage("configure-home")).toBe("native");
    expect(getPlatformRouteMigrationStage("computers")).toBe("hybrid");
    expect(getPlatformRouteMigrationStage("voice-agents")).toBe("hybrid");
    expect(getPlatformRouteMigrationStage("thread")).toBe("compatibility");
  });
});
