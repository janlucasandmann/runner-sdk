import { describe, expect, it } from "vitest";
import type { RunnerTurn } from "../turn-types.js";
import { getRunnerThreadReattachmentDecision } from "./use-running-thread-reattachment.js";

function turn(status: RunnerTurn["status"]): RunnerTurn {
  return {
    id: `turn-${status}`,
    prompt: "test",
    logs: [],
    startedAtMs: 1,
    status,
  };
}

describe("getRunnerThreadReattachmentDecision", () => {
  it("hydrates a remotely running thread", () => {
    expect(
      getRunnerThreadReattachmentDecision("running", [], 0),
    ).toMatchObject({
      remoteThreadIsRunning: true,
      shouldHydrateThread: true,
    });
  });

  it("reconciles a local permission state after the backend leaves it", () => {
    expect(
      getRunnerThreadReattachmentDecision(
        "completed",
        [turn("permission_asked")],
        0,
      ),
    ).toMatchObject({
      localHasPendingPermissionTurn: true,
      remoteThreadHasPendingPermission: false,
      shouldHydrateThread: true,
    });
  });

  it("uses a bounded initial grace period for an empty timeline", () => {
    expect(
      getRunnerThreadReattachmentDecision("completed", [], 1)
        .shouldHydrateThread,
    ).toBe(true);
    expect(
      getRunnerThreadReattachmentDecision("completed", [], 0)
        .shouldHydrateThread,
    ).toBe(false);
  });
});
