import { describe, expect, it } from "vitest";
import { isRunnerLogViewportPinnedToBottom } from "./use-log-auto-scroll.js";

describe("isRunnerLogViewportPinnedToBottom", () => {
  it("treats a viewport within the follow threshold as pinned", () => {
    expect(
      isRunnerLogViewportPinnedToBottom({
        clientHeight: 400,
        scrollHeight: 1_000,
        scrollTop: 576,
      }),
    ).toBe(true);
  });

  it("detects when the user has scrolled above the follow threshold", () => {
    expect(
      isRunnerLogViewportPinnedToBottom({
        clientHeight: 400,
        scrollHeight: 1_000,
        scrollTop: 575,
      }),
    ).toBe(false);
  });
});
