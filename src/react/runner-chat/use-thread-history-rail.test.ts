import { describe, expect, it } from "vitest";
import { getRunnerThreadHistoryTargetScrollTop } from "./use-thread-history-rail.js";

describe("getRunnerThreadHistoryTargetScrollTop", () => {
  it("centers a history anchor in the visible log viewport", () => {
    expect(
      getRunnerThreadHistoryTargetScrollTop({
        anchorHeight: 40,
        anchorTop: 500,
        clientHeight: 400,
        scrollHeight: 2_000,
        scrollTop: 300,
        viewportTop: 100,
      }),
    ).toBe(520);
  });

  it("clamps navigation to the scrollable range", () => {
    expect(
      getRunnerThreadHistoryTargetScrollTop({
        anchorHeight: 20,
        anchorTop: 50,
        clientHeight: 400,
        scrollHeight: 1_000,
        scrollTop: 0,
        viewportTop: 100,
      }),
    ).toBe(0);

    expect(
      getRunnerThreadHistoryTargetScrollTop({
        anchorHeight: 20,
        anchorTop: 1_500,
        clientHeight: 400,
        scrollHeight: 1_000,
        scrollTop: 500,
        viewportTop: 100,
      }),
    ).toBe(600);
  });
});
