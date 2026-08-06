import { describe, expect, it } from "vitest";

import {
  describeRunnerThreadActivityGroup,
  presentRunnerThreadAction,
} from "./action-presentation.js";
import type { RunnerThreadAction } from "./types.js";

function action(
  overrides: Partial<RunnerThreadAction> = {},
): RunnerThreadAction {
  return {
    kind: "action",
    id: "action-1",
    threadId: "thread-1",
    runId: "run-1",
    sequence: 1,
    type: "action_summary",
    title: "Run local commands",
    summary: "run_terminal_command",
    toolName: "run_terminal_command",
    status: "completed",
    createdAt: "2026-08-01T08:00:00.000Z",
    ...overrides,
  };
}

describe("thread action presentation", () => {
  it("uses the working-log fallback instead of a raw tool ID when legacy evidence has no command", () => {
    const presentation = presentRunnerThreadAction(action({
      metadata: {
        permissionActionId: "local_shell",
        permissionActionLabel: "Run local commands",
        command: "unknown",
      },
    }));

    expect(presentation).toMatchObject({
      title: "Ran Bash Command",
      iconKind: "terminal",
      category: "terminal",
    });
  });

  it("grounds web searches and file changes in their action payload", () => {
    expect(presentRunnerThreadAction(action({
      type: "tool_call",
      title: "WebSearch",
      toolName: "WebSearch",
      input: { query: "Thread v2 observer design" },
    }))).toMatchObject({
      title: "Searched the web for “Thread v2 observer design”",
      iconKind: "search",
    });

    expect(presentRunnerThreadAction(action({
      type: "file_change",
      title: "write_file",
      toolName: "write_file",
      output: { filePath: "/workspace/src/thread.ts", type: "create" },
    }))).toMatchObject({
      title: "Created thread.ts",
      iconKind: "file_add",
    });
  });

  it("matches working-log semantics for terminal and native file tools", () => {
    expect(presentRunnerThreadAction(action({
      input: { command: "rg -n 'activityGroupId' src/thread" },
    }))).toMatchObject({
      title: "Searched files",
      iconKind: "search",
      category: "search",
    });

    expect(presentRunnerThreadAction(action({
      title: "Read",
      toolName: "read_file",
      input: { file_path: "/workspace/package.json" },
    }))).toMatchObject({
      title: "Read package.json",
      iconKind: "file",
    });

    expect(presentRunnerThreadAction(action({
      input: { command: "npm run test" },
    }))).toMatchObject({
      title: "Ran tests",
      iconKind: "test",
      category: "test",
    });

    expect(presentRunnerThreadAction(action({
      input: "rg -n 'activityGroupId' src/thread",
    }))).toMatchObject({
      title: "Searched files",
      iconKind: "search",
    });
  });

  it("normalizes native tool separators before selecting web-search presentation", () => {
    expect(presentRunnerThreadAction(action({
      title: "web_search",
      toolName: "web_search",
      input: { query: "Computer Agents Thread v2" },
    }))).toMatchObject({
      title: "Searched the web for “Computer Agents Thread v2”",
      iconKind: "search",
    });
  });

  it("replaces generic observer group copy with a summary of its child actions", () => {
    expect(describeRunnerThreadActivityGroup({
      title: "Working through the task",
      actions: [action({ id: "one" }), action({ id: "two" })],
    })).toBe("Ran Bash Command");

    expect(describeRunnerThreadActivityGroup({
      title: "Running local commands",
      actions: [action({ input: { command: "rg -n 'observer' src" } })],
    })).toBe("Searched files");

    expect(describeRunnerThreadActivityGroup({
      title: "Inspecting the deployment configuration",
      actions: [action()],
    })).toBe("Inspecting the deployment configuration");

    expect(describeRunnerThreadActivityGroup({
      title: "Working through the task",
      status: "sealed",
      category: "implement",
      actions: [],
    })).toBe("Updated workspace files");
  });
});
