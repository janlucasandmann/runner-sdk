import { describe, expect, it } from "vitest";
import { isPlausibleRunnerFileChangePath } from "./file-change-path.js";

describe("runner file-change paths", () => {
  it("accepts concrete workspace and bare file paths", () => {
    expect(isPlausibleRunnerFileChangePath("/workspace/src/app.ts")).toBe(true);
    expect(isPlausibleRunnerFileChangePath("README.md")).toBe(true);
    expect(isPlausibleRunnerFileChangePath("Dockerfile")).toBe(true);
  });

  it("rejects redirect-parser artifacts and non-file targets", () => {
    for (const value of ["30:", "maxdepth:", "2:", "2", "/", "/dev/null"]) {
      expect(isPlausibleRunnerFileChangePath(value)).toBe(false);
    }
  });
});
