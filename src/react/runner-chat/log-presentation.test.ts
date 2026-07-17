import { describe, expect, it } from "vitest";
import type { RunnerLog } from "../../types.js";
import {
  getRunnerLogRangeDurationLabel,
  getRunnerLogRelativeSeconds,
  isBtwTurnPrompt,
  runnerExecutionStatusTone,
  toRunnerLogDurationLabel,
} from "./log-presentation.js";

function log(time: string, durationMs?: number): RunnerLog {
  return {
    time,
    message: "Working",
    type: "info",
    metadata: durationMs === undefined ? undefined : { durationMs },
  };
}

describe("runner log presentation", () => {
  it("projects status tones without inventing a cancellation error", () => {
    expect(runnerExecutionStatusTone("success")).toBe("success");
    expect(runnerExecutionStatusTone("failed")).toBe("error");
    expect(runnerExecutionStatusTone("cancelled")).toBe("neutral");
  });

  it("derives relative and range durations from clock timestamps", () => {
    expect(getRunnerLogRelativeSeconds(log("00:05"))).toBe(5);
    expect(getRunnerLogRangeDurationLabel(log("00:02"), log("00:07"), 0))
      .toBe("5s");
    expect(toRunnerLogDurationLabel(log("", 2_500))).toBe("3s");
  });

  it("recognizes BTW turns case-insensitively", () => {
    expect(isBtwTurnPrompt(" /BTW status?")).toBe(true);
    expect(isBtwTurnPrompt("status?")).toBe(false);
  });
});
