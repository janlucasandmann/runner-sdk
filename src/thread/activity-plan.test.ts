import { describe, expect, it } from "vitest";

import { extractRunnerThreadPlanSteps } from "./activity-plan.js";

describe("extractRunnerThreadPlanSteps", () => {
  it("returns the latest plan with durable first-seen and completion timing", () => {
    const steps = extractRunnerThreadPlanSteps([
      {
        eventType: "todo_list",
        sequence: 10,
        createdAt: "2026-08-05T08:00:00.000Z",
        metadata: {
          agentId: "agent-spark",
          runId: "run-1",
          todos: [
            { id: "inspect", text: "Inspect the repository", status: "in_progress" },
            { id: "verify", text: "Run focused tests", status: "pending" },
          ],
        },
      },
      {
        eventType: "todo_list",
        sequence: 20,
        createdAt: "2026-08-05T08:02:00.000Z",
        metadata: {
          agentId: "agent-spark",
          runId: "run-1",
          todos: [
            { id: "inspect", text: "Inspect the repository", status: "completed" },
            { id: "verify", text: "Run focused tests", status: "in_progress" },
          ],
        },
      },
    ]);

    expect(steps).toEqual([
      expect.objectContaining({
        id: "plan-step:inspect",
        text: "Inspect the repository",
        status: "completed",
        completed: true,
        createdAt: "2026-08-05T08:00:00.000Z",
        completedAt: "2026-08-05T08:02:00.000Z",
        agentId: "agent-spark",
        runId: "run-1",
      }),
      expect.objectContaining({
        id: "plan-step:verify",
        text: "Run focused tests",
        status: "in_progress",
        completed: false,
        createdAt: "2026-08-05T08:00:00.000Z",
        completedAt: null,
      }),
    ]);
  });

  it("treats an explicit empty todo snapshot as no available plan", () => {
    const steps = extractRunnerThreadPlanSteps([
      {
        eventType: "todo_list",
        createdAt: "2026-08-05T08:00:00.000Z",
        metadata: { todos: [{ text: "Inspect the repository", completed: false }] },
      },
      {
        eventType: "todo_list",
        createdAt: "2026-08-05T08:03:00.000Z",
        metadata: { todos: [] },
      },
    ]);

    expect(steps).toEqual([]);
  });

  it("ignores unrelated records that happen to contain an items array", () => {
    expect(
      extractRunnerThreadPlanSteps([
        {
          eventType: "command_execution",
          createdAt: "2026-08-05T08:00:00.000Z",
          metadata: { result: { items: ["not a plan"] } },
        },
      ]),
    ).toEqual([]);
  });

  it("recognizes legacy todo snapshots without an explicit event type", () => {
    const steps = extractRunnerThreadPlanSteps([
      {
        createdAt: "2026-08-05T08:00:02.000Z",
        metadata: {
          todos: [{ text: "Inspect the repository", status: "in_progress" }],
        },
      },
    ]);

    expect(steps).toHaveLength(1);
    expect(steps[0]?.text).toBe("Inspect the repository");
    expect(steps[0]?.status).toBe("in_progress");
  });
});
