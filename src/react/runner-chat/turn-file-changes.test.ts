import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../types.js";
import { collectTurnChangedFiles } from "./turn-file-changes.js";

function fileChangeLog(
  paths: string[],
  kinds: Array<"created" | "modified" | "deleted">,
  diffs: NonNullable<RunnerLog["metadata"]>["diffs"] = {},
): RunnerLog {
  return {
    time: "10:00:00",
    message: "Changed files",
    type: "info",
    eventType: "file_change",
    metadata: {
      filePaths: paths,
      changeKinds: kinds,
      diffs,
    },
  };
}

describe("turn file changes", () => {
  it("keeps the latest change for each normalized path in event order", () => {
    expect(collectTurnChangedFiles([
      fileChangeLog(
        ["/workspace/src/a.ts", "/workspace/src/b.ts"],
        ["created", "modified"],
        {
          "/workspace/src/a.ts": { additions: 4, deletions: 0 },
          "/workspace/src/b.ts": { additions: 2, deletions: 1 },
        },
      ),
      fileChangeLog(
        ["src/a.ts"],
        ["deleted"],
        { "src/a.ts": { additions: 0, deletions: 4 } },
      ),
    ])).toEqual([
      {
        path: "/workspace/src/b.ts",
        kind: "modified",
        additions: 2,
        deletions: 1,
      },
      {
        path: "/workspace/src/a.ts",
        kind: "deleted",
        additions: 0,
        deletions: 4,
      },
    ]);
  });

  it("excludes files reserved for internal thread previews", () => {
    const result = collectTurnChangedFiles([
      fileChangeLog(
        ["/workspace/.cache/private.json", "/workspace/README.md"],
        ["created", "modified"],
      ),
    ]);
    expect(result.map((file) => file.path)).toEqual(["/workspace/README.md"]);
  });
});
