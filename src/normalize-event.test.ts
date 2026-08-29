import { describe, expect, it } from "vitest";
import { RunnerEventNormalizer } from "./normalize-event.js";

describe("RunnerEventNormalizer file-write validation", () => {
  it("reclassifies a heredoc comparison false positive as command activity", () => {
    const command = `$ python3 - <<'EOF'
for index, line in enumerate(lines):
    if index > 30: break
EOF`;
    const normalizer = new RunnerEventNormalizer(() => 1_000);

    const result = normalizer.handle({
      type: "response.item.completed",
      item: {
        type: "tool_call",
        metadata: { command },
        tool: {
          type: "file_write",
          file_path: "30:",
          operation_kind: "created",
          output: JSON.stringify({ stdout: "", stderr: "" }),
          exit_code: 0,
        },
      },
    });

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]?.eventType).toBe("command_execution");
    expect(result.logs[0]?.metadata?.command).toBe(command);
    expect(result.logs[0]?.metadata?.filePaths).toBeUndefined();
  });

  it("reclassifies invalid direct file-change items when command context exists", () => {
    const command = "$ python3 - <<'EOF'\nif depth > maxdepth: return\nEOF";
    const normalizer = new RunnerEventNormalizer(() => 1_000);

    const result = normalizer.handle({
      type: "response.item.completed",
      item: {
        type: "file_change",
        metadata: { command },
        changes: [{ path: "maxdepth:", kind: "created" }],
      },
    });

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]?.eventType).toBe("command_execution");
    expect(result.logs[0]?.metadata?.command).toBe(command);
  });

  it("keeps concrete file-write events as file changes", () => {
    const normalizer = new RunnerEventNormalizer(() => 1_000);

    const result = normalizer.handle({
      type: "response.item.completed",
      item: {
        type: "tool_call",
        tool: {
          type: "file_write",
          file_path: "/workspace/notes.md",
          operation_kind: "created",
          command: "printf '# Notes' > /workspace/notes.md",
          output: "",
          exit_code: 0,
        },
      },
    });

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]?.eventType).toBe("file_change");
    expect(result.logs[0]?.metadata?.filePaths).toEqual(["/workspace/notes.md"]);
  });
});
