// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  getPlatformClientRoutePath,
  navigatePlatformClient,
} from "./platform-browser-navigation.js";

describe("platform browser navigation", () => {
  it("builds hosted client paths from the canonical route registry", () => {
    expect(getPlatformClientRoutePath("computers")).toBe(
      "/platform-client/configure/computers",
    );
    expect(getPlatformClientRoutePath("develop-home")).toBe(
      "/platform-client/develop",
    );
  });

  it("updates history without reloading the document", () => {
    navigatePlatformClient("databases");
    expect(window.location.pathname).toBe(
      "/platform-client/develop/databases",
    );
  });
});
