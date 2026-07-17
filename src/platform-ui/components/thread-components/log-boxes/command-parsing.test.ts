import { describe, expect, it } from "vitest";

import {
  detectCodeLanguage,
  extractHeadTailReadPath,
  extractQuotedArgument,
  extractReadFilePath,
  formatShellCommandForDisplay,
  parseRunnerHelpCommandDetails,
  parseShellCommandSegments,
  renderShellTokenizedHtml,
  stripShellInlineComments,
  tokenizeShellLikeArguments,
} from "./command-parsing.js";

describe("runner log command parsing", () => {
  it("unwraps shell launch commands", () => {
    expect(formatShellCommandForDisplay('bash -lc "npm test"')).toBe("npm test");
  });

  it("recognizes help requests and names script resources", () => {
    expect(parseRunnerHelpCommandDetails("python /workspace/task_manager.py --help")).toEqual({
      resourceName: "Task Manager",
      normalizedCommand: "python /workspace/task_manager.py --help",
    });
  });

  it("parses heredoc command sections", () => {
    expect(parseShellCommandSegments("python <<'PY'\nprint('ok')\nPY")).toEqual({
      header: "$ python <<'PY'",
      body: "print('ok')",
      footer: "PY",
    });
  });

  it("tokenizes quoted shell arguments", () => {
    expect(tokenizeShellLikeArguments('--name "hello world" plain')).toEqual([
      "--name",
      "hello world",
      "plain",
    ]);
    expect(extractQuotedArgument('--query "hello world"', "--query")).toBe("hello world");
  });

  it("extracts read targets and strips only unquoted shell comments", () => {
    expect(extractHeadTailReadPath("head -n 20 '/workspace/app.ts'")).toBe("/workspace/app.ts");
    expect(extractReadFilePath("sed -n '2,8p' /workspace/app.ts")).toBe("/workspace/app.ts");
    expect(stripShellInlineComments('ls "/workspace/#fixtures" # inspect')).toBe(
      'ls "/workspace/#fixtures"',
    );
  });

  it("detects source languages and escapes highlighted shell output", () => {
    expect(detectCodeLanguage("const value = 1;", "index.ts")).toBe("typescript");
    expect(renderShellTokenizedHtml("echo '<unsafe>'")).toContain("&lt;unsafe&gt;");
  });
});
