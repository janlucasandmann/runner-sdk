import { describe, expect, it } from "vitest";
import { createInitialRunnerThreadProjection } from "./projection.js";
import {
  isRunnerPublicConversationRun,
  resolveRunnerPublicThreadParticipant,
} from "./public-presentation.js";
import type { RunnerThreadRun } from "./types.js";

describe("public thread presentation", () => {
  it("presents communicator and observer participants as the selected agent", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    projection.participantsById.worker = {
      id: "worker",
      kind: "worker",
      displayName: "Spark",
      avatarUrl: "/spark.webp",
    };
    projection.participantsById.communicator = {
      id: "communicator",
      kind: "communicator",
      displayName: "Communicator",
    };

    const participant = resolveRunnerPublicThreadParticipant(
      projection,
      projection.participantsById.communicator,
      "Spark",
    );

    expect(participant).toMatchObject({
      kind: "worker",
      displayName: "Spark",
      avatarUrl: "/spark.webp",
    });
    expect(JSON.stringify(participant)).not.toMatch(/communicator|observer/i);
  });

  it("keeps observer runs out of the public conversation timeline", () => {
    const baseRun: RunnerThreadRun = {
      kind: "run",
      id: "run-1",
      threadId: "thread-1",
      sequence: 1,
      runKind: "observer",
      status: "completed",
      origin: { kind: "system" },
      createdAt: "2030-01-01T00:00:00.000Z",
    };

    expect(isRunnerPublicConversationRun(baseRun)).toBe(false);
    expect(isRunnerPublicConversationRun({ ...baseRun, runKind: "communicator" })).toBe(true);
    expect(isRunnerPublicConversationRun({ ...baseRun, runKind: "worker" })).toBe(true);
  });
});
