import { describe, expect, it } from "vitest";
import { isInternalFileChangeLog, isRunnerHydratedNullDevicePath } from "./file-paths.js";

describe("runner hydration file path policy", () => {
  it("recognizes null-device and internal workspace paths", () => {
    expect(isRunnerHydratedNullDevicePath('"/dev/null"')).toBe(true);
    expect(
      isInternalFileChangeLog({
        time: "00:00",
        type: "info",
        eventType: "file_change",
        message: "Updated",
        metadata: {
          filePaths: ["/workspace/.cache/runtime.json", "/workspace/.claude/state.json"],
        },
      }),
    ).toBe(true);
  });

  it("does not hide user workspace changes", () => {
    expect(
      isInternalFileChangeLog({
        time: "00:00",
        type: "info",
        eventType: "file_change",
        message: "Updated",
        metadata: { filePaths: ["/workspace/src/app.ts"] },
      }),
    ).toBe(false);
  });
});
