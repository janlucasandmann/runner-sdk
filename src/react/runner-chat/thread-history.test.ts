import { describe, expect, it } from "vitest";
import {
  buildRunnerThreadHistoryItems,
  buildRunnerThreadHistoryPreviewText,
} from "./thread-history.js";
import type { RunnerTurn } from "./turn-types.js";

function turn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn-1",
    prompt: "Please inspect the failing build",
    logs: [
      {
        time: "00:01",
        type: "info",
        eventType: "agent_message",
        message: "The build is healthy again.",
      },
    ],
    startedAtMs: 1,
    status: "completed",
    ...overrides,
  };
}

describe("buildRunnerThreadHistoryItems", () => {
  it("builds user and assistant anchors for a regular turn", () => {
    expect(
      buildRunnerThreadHistoryItems({
        displayedAgentLabel: "Forge",
        missionControlPreview: null,
        taskPreview: null,
        turns: [turn()],
      }),
    ).toEqual([
      {
        id: "turn-1:user",
        turnId: "turn-1",
        role: "user",
        label: "Me",
        preview: "Please inspect the failing build",
      },
      {
        id: "turn-1:assistant",
        turnId: "turn-1",
        role: "assistant",
        label: "Forge",
        preview: "The build is healthy again.",
      },
    ]);
  });

  it("uses task identity for the initial prompt preview", () => {
    const items = buildRunnerThreadHistoryItems({
      displayedAgentLabel: "Forge",
      missionControlPreview: null,
      taskPreview: {
        taskId: "task-1",
        projectId: "project-1",
        ticketNumber: "ENG-42",
        title: "Repair deployment",
      },
      turns: [turn({ isInitialTurn: true })],
    });

    expect(items[0]?.preview).toBe("ENG-42 Repair deployment");
  });

  it("uses the action summary for synthetic context turns", () => {
    const items = buildRunnerThreadHistoryItems({
      displayedAgentLabel: "Forge",
      missionControlPreview: null,
      taskPreview: null,
      turns: [
        turn({
          presentation: "context-action-notice",
          logs: [
            {
              time: "00:01",
              type: "info",
              eventType: "action_summary",
              message: "Compacted the thread context.",
            },
          ],
        }),
      ],
    });

    expect(items.at(-1)?.preview).toBe("Compacted the thread context.");
  });
});

describe("buildRunnerThreadHistoryPreviewText", () => {
  it("normalizes markup whitespace and truncates long previews", () => {
    expect(
      buildRunnerThreadHistoryPreviewText(
        "A   deliberately long history message that exceeds the compact preview allowance.",
      ),
    ).toBe("A deliberately long history message that exceeds t…");
  });
});
