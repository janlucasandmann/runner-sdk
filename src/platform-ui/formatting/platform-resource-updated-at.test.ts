import { describe, expect, it } from "vitest";
import {
  formatPlatformResourceUpdatedAt,
  getPlatformResourceUpdatedTimestamp,
} from "./platform-resource-updated-at.js";

describe("formatPlatformResourceUpdatedAt", () => {
  const now = new Date(2026, 7, 30, 16, 0);

  it("uses only the local clock time for updates from today", () => {
    expect(formatPlatformResourceUpdatedAt(
      new Date(2026, 7, 30, 11, 45),
      { now, locale: "en-US" },
    )).toBe("11:45 AM");
  });

  it("prefixes yesterday while preserving its clock time", () => {
    expect(formatPlatformResourceUpdatedAt(
      new Date(2026, 7, 29, 20, 5),
      { now, locale: "en-US" },
    )).toBe("Yesterday, 8:05 PM");
  });

  it("uses a localized date for older updates and handles invalid values", () => {
    expect(formatPlatformResourceUpdatedAt(
      new Date(2026, 7, 27, 10, 0),
      { now, locale: "en-US" },
    )).toBe("Aug 27, 2026");
    expect(formatPlatformResourceUpdatedAt("not-a-date", { now })).toBe("—");
    expect(getPlatformResourceUpdatedTimestamp("2026-08-30T10:00:00.000Z")).toBe(
      Date.parse("2026-08-30T10:00:00.000Z"),
    );
  });
});
