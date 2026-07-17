import { describe, expect, it } from "vitest";

import {
  isPlatformTypedRoute,
  PLATFORM_TYPED_ROUTE_RENDERERS,
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
      "payments",
      "secrets",
      "skills",
      "web-apps",
    ]);
    expect(isPlatformTypedRoute("agents")).toBe(true);
    expect(isPlatformTypedRoute("thread")).toBe(false);
  });
});
