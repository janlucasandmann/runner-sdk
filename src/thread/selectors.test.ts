import { describe, expect, it } from "vitest";
import { normalizeRunnerThreadActivityGroup } from "./normalize.js";
import {
  createInitialRunnerThreadProjection,
  reduceRunnerThreadEvent,
} from "./projection.js";
import {
  selectRunnerThreadActivityGroups,
  selectRunnerThreadRunWorkingLabel,
} from "./selectors.js";

describe("thread activity-group source selection", () => {
  it("uses grounded Chronicle groups when fallback and grounded projections coexist", () => {
    const projection = createInitialRunnerThreadProjection("thread-grounded");
    const fallback = normalizeRunnerThreadActivityGroup({
      id: "legacy:group:run-1:root",
      threadId: projection.threadId,
      runId: "run-1",
      status: "active",
      title: "Worker run",
      startSequence: 1,
      observerStatus: "fallback",
      metadata: { deterministicFallback: true },
    });
    const groundedRoot = normalizeRunnerThreadActivityGroup({
      id: "chronicle:group:run-1:root",
      threadId: projection.threadId,
      runId: "run-1",
      status: "active",
      title: "Worker run",
      startSequence: 1,
      observerStatus: "grounded",
      metadata: { deterministicChronicle: true },
    });
    const groundedPhase = normalizeRunnerThreadActivityGroup({
      id: "chronicle:group:run-1:phase:1",
      threadId: projection.threadId,
      runId: "run-1",
      parentGroupId: groundedRoot.id,
      status: "active",
      title: "Implementing changes",
      startSequence: 2,
      highestRing: 2,
      observerStatus: "grounded",
      metadata: { deterministicChronicle: true },
    });
    projection.activityGroupsById = {
      [fallback.id]: fallback,
      [groundedRoot.id]: groundedRoot,
      [groundedPhase.id]: groundedPhase,
    };

    expect(selectRunnerThreadActivityGroups(projection, {
      runId: "run-1",
    }).map((group) => group.id)).toEqual([
      groundedRoot.id,
      groundedPhase.id,
    ]);
    expect(selectRunnerThreadActivityGroups(projection, {
      runId: "run-1",
      parentGroupId: groundedRoot.id,
    }).map((group) => group.id)).toEqual([groundedPhase.id]);
  });

  it("uses the explicit observer working label without consulting worker summaries", () => {
    const initial = createInitialRunnerThreadProjection("thread-label");
    const projection = reduceRunnerThreadEvent(initial, {
      kind: "event",
      id: "event-live-projection",
      threadId: initial.threadId,
      runId: "run-1",
      sequence: 10,
      type: "thread.run.projection.updated",
      producer: { type: "observer", id: "thread-supervision-chronicle-live-v1" },
      payloadVersion: 1,
      payload: {
        workingLabel: "Running checks and verifying the work.",
        currentSummary: "Worker-authored low-level detail that must be ignored.",
      },
      occurredAt: "2030-07-25T08:00:00.000Z",
      createdAt: "2030-07-25T08:00:00.000Z",
    });

    expect(selectRunnerThreadRunWorkingLabel(projection, "run-1")).toBe(
      "Running checks and verifying the work.",
    );
  });
});
