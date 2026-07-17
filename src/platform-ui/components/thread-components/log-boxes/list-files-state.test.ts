import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import {
  buildListFilesPreviewAttachment,
  extractListFilesDirectoryPath,
  isListFilesLog,
  parseListFilesOutput,
} from "./list-files-state.js";

describe("list-files log state", () => {
  it("resolves listed paths relative to an explicit working directory", () => {
    expect(
      extractListFilesDirectoryPath("cd /workspace/project && ls -la src # inspect sources"),
    ).toBe("/workspace/project/src");
    expect(extractListFilesDirectoryPath("Finding: **/*.test.ts")).toBe("**/*.test.ts");
  });

  it("normalizes structured list output and preserves metadata", () => {
    expect(
      parseListFilesOutput(
        JSON.stringify({
          files: [
            { path: "src", type: "directory" },
            { path: "src/app.ts", type: "file", size: 2048 },
          ],
        }),
      ),
    ).toEqual([
      {
        name: "src",
        path: "src",
        type: "folder",
        size: "",
        sizeBytes: null,
        isHidden: false,
      },
      {
        name: "app.ts",
        path: "src/app.ts",
        type: "file",
        size: "2.0 KB",
        sizeBytes: 2048,
        isHidden: false,
      },
    ]);
  });

  it("parses long directory listings", () => {
    expect(
      parseListFilesOutput(
        [
          "total 8",
          "drwxr-xr-x 2 user group 4096 Jul 17 12:00 src",
          "-rw-r--r-- 1 user group 1024 Jul 17 12:00 app.ts",
        ].join("\n"),
      ).map(({ name, type, sizeBytes }) => ({
        name,
        type,
        sizeBytes,
      })),
    ).toEqual([
      { name: "src", type: "folder", sizeBytes: 4096 },
      { name: "app.ts", type: "file", sizeBytes: 1024 },
    ]);
  });

  it("does not misclassify file reads as directory listings", () => {
    expect(
      isListFilesLog({
        eventType: "command_execution",
        message: "",
        metadata: {
          command: "cat /workspace/files.txt",
          output: "first.ts\nsecond.ts\nthird.ts",
        },
      } as RunnerLog),
    ).toBe(false);
    expect(
      isListFilesLog({
        eventType: "command_execution",
        message: "",
        metadata: {
          command: "ls /workspace/src",
          output: "first.ts\nsecond.ts",
        },
      } as RunnerLog),
    ).toBe(true);
  });

  it("builds directory preview attachments within the workspace", () => {
    expect(
      buildListFilesPreviewAttachment("src/components", "http://localhost:4177", "env_123"),
    ).toMatchObject({
      filename: "components",
      workspacePath: "/workspace/src/components",
      mimeType: "inode/directory",
      previewKindOverride: "directory",
      isFolder: true,
    });
  });
});
