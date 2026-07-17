import { describe, expect, it } from "vitest";

import type { RunnerLog } from "../../../../types.js";
import {
  getDeepResearchLogState,
  hasActiveDeepResearchLogGroup,
  hasDeepResearchOutput,
  isDeepResearchCommand,
  parseDeepResearchOutput,
} from "./deep-research-state.js";

function deepResearchLog(
  event: string,
  details: Record<string, unknown> = {},
): RunnerLog {
  return {
    eventType: "deep_research",
    message: event,
    metadata: {
      deepResearch: {
        event,
        ...details,
      },
    },
  } as RunnerLog;
}

describe("deep research log state", () => {
  it("recognizes supported launch paths", () => {
    expect(
      isDeepResearchCommand(
        'python /workspace/.scripts/deep-research.py "market map"',
      ),
    ).toBe(true);
    expect(isDeepResearchCommand("python ordinary.py")).toBe(false);
  });

  it("parses line-delimited completion output", () => {
    const parsed = parseDeepResearchOutput([
      '{"event":"start","topic":"market map"}',
      '{"event":"complete","report_file":"/workspace/report.md","sources_count":4}',
    ].join("\n"));
    expect(parsed.status).toBe("complete");
    expect(parsed.topic).toBe("market map");
    expect(parsed.reportFile).toBe("/workspace/report.md");
    expect(parsed.sourcesCount).toBe(4);
    expect(hasDeepResearchOutput(JSON.stringify({ stdout: [
      '{"event":"thinking","summary":"Checking sources"}',
    ].join("\n") }))).toBe(true);
  });

  it("deduplicates streaming thoughts and marks active groups", () => {
    const logs = [
      deepResearchLog("thinking", {
        thinkingSummary: "Checking sources",
      }),
      deepResearchLog("thinking", {
        thinkingSummary: "Checking sources",
      }),
    ];
    const state = getDeepResearchLogState({ logs });
    expect(state.parsed.thinkingSummaries).toEqual(["Checking sources"]);
    expect(state.isLoading).toBe(true);
    expect(hasActiveDeepResearchLogGroup(logs)).toBe(true);
  });

  it("settles completed and failed streams", () => {
    expect(
      getDeepResearchLogState({
        logs: [
          deepResearchLog("complete", {
            reportFile: "/workspace/report.md",
          }),
        ],
      }).isComplete,
    ).toBe(true);
    expect(
      getDeepResearchLogState({
        logs: [
          deepResearchLog("error", {
            errorMessage: "upstream failed",
          }),
        ],
      }).isError,
    ).toBe(true);
  });
});
