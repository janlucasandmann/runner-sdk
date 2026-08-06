import { describe, expect, it } from "vitest";

import type { RunnerLog } from "../../types.js";
import {
  getRunnerTurnDurationSeconds,
  getRunnerTurnLiveWorkSummary,
  getRunnerTurnWorkHeadline,
} from "./turn-status-presentation.js";
import type { RunnerTurn } from "./turn-types.js";

function createTurn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn_1",
    prompt: "Do the work",
    logs: [],
    startedAtMs: 1_000,
    status: "running",
    ...overrides,
  };
}

describe("turn status presentation", () => {
  it("uses the live clock only for running turns", () => {
    expect(getRunnerTurnDurationSeconds(createTurn(), 6_100)).toBe(5);
    expect(
      getRunnerTurnDurationSeconds(
        createTurn({
          status: "completed",
          completedAtMs: 4_200,
        }),
        20_000,
      ),
    ).toBe(3);
  });

  it("prefers observer summaries and normalizes them to one line", () => {
    const summary = getRunnerTurnLiveWorkSummary(
      createTurn({
        logs: [
          {
            time: "00:01",
            message: "Ran a command",
            type: "info",
            metadata: {
              observerSummary: "working: validating\nall service contracts",
            } as unknown as RunnerLog["metadata"],
          },
        ],
      }),
    );

    expect(summary).toBe("Validating all service contracts");
  });

  it("does not use assistant or permission messages as fallback status", () => {
    const summary = getRunnerTurnLiveWorkSummary(
      createTurn({
        logs: [
          {
            time: "00:01",
            message: "Allow deployment?",
            type: "info",
            eventType: "permission_request",
          },
          {
            time: "00:02",
            message: "Final answer",
            type: "info",
            eventType: "agent_message",
          },
        ],
      }),
    );

    expect(summary).toBeNull();
  });

  it("uses orchestration-owned working labels but ignores worker command noise", () => {
    const summary = getRunnerTurnLiveWorkSummary(
      createTurn({
        logs: [
          {
            time: "00:01",
            message: "npm test -- --runInBand",
            type: "info",
            eventType: "command_execution",
            metadata: {
              liveSummary: "Running npm test",
              source: "worker",
            } as unknown as RunnerLog["metadata"],
          },
          {
            time: "00:02",
            message: "Projection updated",
            type: "info",
            metadata: {
              workingLabel: "checking the final implementation",
              source: "thread_supervision_observer",
            } as unknown as RunnerLog["metadata"],
          },
        ],
      }),
    );

    expect(summary).toBe("Checking the final implementation");
  });

  it("does not promote action summaries into the live disclosure label", () => {
    expect(
      getRunnerTurnLiveWorkSummary(
        createTurn({
          logs: [
            {
              time: "00:03",
              message: "Executed one hundred low-level actions",
              type: "info",
              eventType: "action_summary",
              isActionSummary: true,
            },
          ],
        }),
      ),
    ).toBeNull();
  });

  it("builds stable active, permission, and completed disclosure headlines", () => {
    expect(getRunnerTurnWorkHeadline(createTurn(), 5_000)).toBe("Working...");
    expect(
      getRunnerTurnWorkHeadline(createTurn(), 5_000, "Working through the current task"),
    ).toBe("Working...");
    expect(
      getRunnerTurnWorkHeadline(
        createTurn(),
        5_000,
        "Reviewing the complete implementation before running tests",
      ),
    ).toBe("Reviewing the complete implementation before running tests");
    expect(
      getRunnerTurnWorkHeadline(
        createTurn({
          logs: [
            {
              time: "00:02",
              message: "Observer update",
              type: "info",
              metadata: {
                observerSummary: "validating the deployment",
              } as unknown as RunnerLog["metadata"],
            },
          ],
        }),
        5_000,
      ),
    ).toBe("Validating the deployment");
    expect(
      getRunnerTurnWorkHeadline(
        createTurn({
          logs: [
            {
              time: "00:02",
              message: "Observer update",
              type: "info",
              metadata: {
                observerSummary: "legacy observer status",
              } as unknown as RunnerLog["metadata"],
            },
          ],
        }),
        5_000,
        "verifying the canonical projection",
      ),
    ).toBe("Verifying the canonical projection");
    expect(getRunnerTurnWorkHeadline(createTurn({ status: "permission_asked" }), 5_000)).toBe(
      "Waiting for permission",
    );
    expect(
      getRunnerTurnWorkHeadline(createTurn({ status: "completed", completedAtMs: 44_000 }), 90_000),
    ).toBe("Worked for 43s");
  });
});
