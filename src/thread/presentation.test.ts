import { describe, expect, it } from "vitest";
import { createInitialRunnerThreadProjection } from "./projection.js";
import {
  buildRunnerThreadRunReceiptViewModel,
  buildRunnerThreadScreenViewModel,
} from "./presentation.js";
import type { RunnerThreadActivityGroup, RunnerThreadRun } from "./types.js";

function run(overrides: Partial<RunnerThreadRun> = {}): RunnerThreadRun {
  return {
    kind: "run",
    id: "run-1",
    threadId: "thread-1",
    sequence: 1,
    runKind: "worker",
    status: "running",
    actorParticipantId: "participant-agent",
    origin: { kind: "message", label: "User request" },
    createdAt: "2030-07-25T08:00:00.000Z",
    startedAt: "2030-07-25T08:00:01.000Z",
    updatedAt: "2030-07-25T08:00:11.000Z",
    ...overrides,
  };
}

function group(overrides: Partial<RunnerThreadActivityGroup> = {}): RunnerThreadActivityGroup {
  return {
    kind: "activity_group",
    id: "group-1",
    threadId: "thread-1",
    runId: "run-1",
    sequence: 2,
    version: 1,
    status: "open",
    title: "Implementing the requested change",
    liveSummary: "Updating the requested interface and validating the result.",
    actionIds: [],
    startSequence: 2,
    createdAt: "2030-07-25T08:00:02.000Z",
    ...overrides,
  };
}

describe("thread screen presentation", () => {
  it("maps waiting permission to an active approval receipt", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    projection.participantsById["participant-agent"] = {
      id: "participant-agent",
      kind: "worker",
      displayName: "Spark",
    };
    const waitingRun = run({ status: "waiting_permission" });
    projection.runsById[waitingRun.id] = waitingRun;

    const receipt = buildRunnerThreadRunReceiptViewModel(projection, waitingRun);

    expect(receipt.active).toBe(true);
    expect(receipt.phase).toBe("waiting_permission");
    expect(receipt.phaseLabel).toBe("Approval needed");
    expect(receipt.actor?.displayName).toBe("Spark");
  });

  it("uses observer summaries and never falls back to raw worker progress", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    const activeRun = run({
      currentSummary: "Raw low-level worker progress must stay out of chat.",
      title: "Worker run",
    });
    const observerGroup = group();
    projection.runsById[activeRun.id] = activeRun;
    projection.activityGroupsById[observerGroup.id] = observerGroup;

    const receipt = buildRunnerThreadRunReceiptViewModel(projection, activeRun);

    expect(receipt.summary).toBe(observerGroup.liveSummary);
    expect(receipt.summary).not.toContain("Raw low-level worker progress");
  });

  it("selects the latest active run and aggregates only root group metrics", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    const completedRun = run({ id: "run-complete", sequence: 1, status: "completed" });
    const activeRun = run({ id: "run-active", sequence: 2 });
    projection.runsById = {
      [completedRun.id]: completedRun,
      [activeRun.id]: activeRun,
    };
    projection.activityGroupsById = {
      root: group({
        id: "root",
        runId: activeRun.id,
        metrics: { inputTokens: 120, outputTokens: 30, costUsd: 0.04 },
      }),
      child: group({
        id: "child",
        runId: activeRun.id,
        parentGroupId: "root",
        metrics: { inputTokens: 120, outputTokens: 30, costUsd: 0.04 },
      }),
    };

    const screen = buildRunnerThreadScreenViewModel(projection);
    const activeReceipt = screen.receipts.find((receipt) => receipt.id === activeRun.id);

    expect(screen.defaultRunId).toBe(activeRun.id);
    expect(screen.activeRunIds).toEqual([activeRun.id]);
    expect(activeReceipt?.metrics.inputTokens).toBe(120);
    expect(activeReceipt?.metrics.outputTokens).toBe(30);
    expect(activeReceipt?.metrics.costUsd).toBe(0.04);
  });
});
