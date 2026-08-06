import { describe, expect, it } from "vitest";
import {
  fromTestAssertionDrafts,
  toTestAssertionDrafts,
} from "./test-assertion-builder.js";

describe("TestAssertionBuilder", () => {
  it("round-trips shorthand assertions into the canonical operator shape", () => {
    const drafts = toTestAssertionDrafts([
      { path: "status", equals: "ready" },
      { path: "database", operator: "exists" },
    ]);
    expect(drafts[0]).toMatchObject({ operator: "equals", expected: "ready" });
    expect(fromTestAssertionDrafts(drafts)).toEqual([
      { path: "status", operator: "equals", expected: "ready" },
      { path: "database", operator: "exists" },
    ]);
  });
});

