import { describe, expect, it } from "vitest";
import {
  mergeThreadDiffsIntoLogs,
  mergeThreadStepsIntoLogs,
  parseHydratedStepDiffEntries,
  parseThreadSteps,
} from "./step-diffs.js";

describe("runner hydration step diffs", () => {
  it("parses canonical steps and multi-file unified diffs", () => {
    expect(
      parseThreadSteps([
        {
          id: "step-1",
          sequence: 2,
          stepKind: "file_change",
          eventType: "file_change",
          title: "Changed files",
          createdAt: "2026-07-16T10:00:00.000Z",
          metadata: { filePaths: ["src/a.ts"] },
        },
      ]),
    ).toHaveLength(1);

    const entries = parseHydratedStepDiffEntries(
      [
        "diff --git a/src/a.ts b/src/a.ts",
        "--- a/src/a.ts",
        "+++ b/src/a.ts",
        "@@ -1 +1 @@",
        "-old",
        "+new",
        "diff --git a/src/b.ts b/src/b.ts",
        "--- /dev/null",
        "+++ b/src/b.ts",
        "@@ -0,0 +1 @@",
        "+created",
      ].join("\n"),
    );
    expect(entries).toMatchObject([
      { path: "src/a.ts", additions: 1, deletions: 1 },
      { path: "src/b.ts", additions: 1, deletions: 0 },
    ]);
  });

  it("synthesizes missing file logs before the assistant response", () => {
    const logs = mergeThreadStepsIntoLogs(
      [
        {
          time: "00:03",
          type: "info",
          eventType: "agent_message",
          message: "Done",
        },
      ],
      [
        {
          id: "step",
          sequence: 1,
          stepKind: "file_change",
          eventType: "file_change",
          title: "Write",
          createdAt: "2026-07-16T10:00:03.000Z",
          metadata: {
            filePaths: ["src/app.ts"],
            changeKinds: ["created"],
          },
        },
      ],
      [],
      Date.parse("2026-07-16T10:00:00.000Z"),
    );

    expect(logs.map((entry) => entry.eventType)).toEqual([
      "file_change",
      "agent_message",
    ]);
    expect(logs[0]).toMatchObject({
      time: "3s",
      message: "Write: /workspace/src/app.ts",
    });
  });

  it("attaches a fetched diff only to the last matching file log", () => {
    const logs = mergeThreadDiffsIntoLogs(
      [
        {
          time: "00:01",
          type: "info",
          eventType: "file_change",
          message: "Edit",
          metadata: { filePaths: ["/workspace/src/app.ts"] },
        },
        {
          time: "00:02",
          type: "info",
          eventType: "file_change",
          message: "Edit again",
          metadata: { filePaths: ["/workspace/src/app.ts"] },
        },
      ],
      [{ path: "src/app.ts", diff: "@@ -1 +1 @@\n-old\n+new" }],
    );

    expect(logs[0].metadata?.diffs).toBeUndefined();
    expect(logs[1].metadata?.diffs).toBeDefined();
  });
});
