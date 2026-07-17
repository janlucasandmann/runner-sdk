import { describe, expect, it } from "vitest";

import {
  parseStructuredCommandExecutionOutput,
  resolveCommandOutputText,
} from "./structured-command-output.js";

describe("structured command output", () => {
  it("reads direct and nested envelopes", () => {
    expect(
      parseStructuredCommandExecutionOutput({
        result: {
          stdout: "done",
          stderr: "",
          returnCodeInterpretation: "success",
        },
      }),
    ).toMatchObject({
      stdout: "done",
      stderr: "",
      returnCodeInterpretation: "success",
    });
  });

  it("decodes escaped fallback fields in malformed envelopes", () => {
    expect(
      parseStructuredCommandExecutionOutput(
        '{"stdout":"first\\nsecond","stderr":"","interrupted":false',
      ),
    ).toMatchObject({
      stdout: "first\nsecond",
      stderr: "",
      interrupted: false,
    });
  });

  it("projects stdout and stderr into display text", () => {
    expect(
      resolveCommandOutputText({
        stdout: "out",
        stderr: "warning",
      }),
    ).toBe("out\nwarning");
    expect(resolveCommandOutputText({ stdout: "out" }, "stdout")).toBe("out");
  });
});
