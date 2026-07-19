// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformVersionLabel,
  formatPlatformVersionLabel,
  formatPlatformVersionTitle,
  normalizePlatformVersionNumber,
} from "./platform-version-label.js";

afterEach(cleanup);

describe("PlatformVersionLabel", () => {
  it("normalizes and formats canonical zero-based labels", () => {
    expect(normalizePlatformVersionNumber(0)).toBe(0);
    expect(normalizePlatformVersionNumber("v12")).toBe(12);
    expect(normalizePlatformVersionNumber("Version 3")).toBe(3);
    expect(formatPlatformVersionLabel(0)).toBe("v0");
    expect(formatPlatformVersionTitle(1, "First production candidate")).toBe(
      "v1 | First production candidate",
    );
  });

  it("renders an optional qualifier in a clickable label", () => {
    render(
      <PlatformVersionLabel version={2} qualifier="Latest" aria-label="Open version history" />,
    );

    const label = screen.getByRole("button", { name: "Open version history" });
    expect(label.classList.contains("platform-version-label")).toBe(true);
    expect(label.dataset.platformVersion).toBe("2");
    expect(screen.getByText("v2")).not.toBeNull();
    expect(screen.getByText("Latest")).not.toBeNull();
  });
});
