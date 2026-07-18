import { describe, expect, it } from "vitest";

import {
  isPlatformTypedRoute,
  PLATFORM_TYPED_ROUTE_RENDERERS,
  platformTypedRouteUsesCompatibilityHandoff,
} from "./platform-route-outlet.js";

describe("typed platform route renderer registry", () => {
  it("declares migrated resource routes exactly once", () => {
    expect(Object.keys(PLATFORM_TYPED_ROUTE_RENDERERS).sort()).toEqual([
      "agent-runtime",
      "agents",
      "api-keys",
      "apis",
      "authentication",
      "computers",
      "configure-home",
      "databases",
      "develop-home",
      "functions",
      "models",
      "notifications",
      "payments",
      "secrets",
      "skills",
      "voice-agents",
      "web-apps",
    ]);
    expect(isPlatformTypedRoute("agents")).toBe(true);
    expect(isPlatformTypedRoute("thread")).toBe(false);
    expect(platformTypedRouteUsesCompatibilityHandoff("agents")).toBe(true);
    expect(platformTypedRouteUsesCompatibilityHandoff("api-keys")).toBe(false);
    expect(platformTypedRouteUsesCompatibilityHandoff("configure-home")).toBe(false);
  });
});
