// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createInitialRunnerThreadProjection } from "../../thread/projection.js";
import type { RunnerThreadRun } from "../../thread/types.js";
import { RunnerCanonicalThreadSurface } from "./canonical-thread-surface.js";

function projectionWithRun() {
  const projection = createInitialRunnerThreadProjection("thread-screen");
  projection.participantsById.agent = {
    id: "agent",
    kind: "worker",
    displayName: "Spark",
  };
  const run: RunnerThreadRun = {
    kind: "run",
    id: "run-1",
    threadId: projection.threadId,
    sequence: 1,
    runKind: "worker",
    status: "completed",
    actorParticipantId: "agent",
    origin: { kind: "message", label: "User request" },
    projection: {
      runId: "run-1",
      threadId: projection.threadId,
      sequence: 1,
      status: "completed",
      summary: "Implemented and verified the requested change.",
      counters: { actionCount: 3 },
      updatedAt: "2030-07-25T08:01:00.000Z",
    },
    createdAt: "2030-07-25T08:00:00.000Z",
    startedAt: "2030-07-25T08:00:01.000Z",
    completedAt: "2030-07-25T08:01:00.000Z",
    updatedAt: "2030-07-25T08:01:00.000Z",
  };
  projection.runsById[run.id] = run;
  projection.timeline.push({
    kind: "run",
    id: run.id,
    sequence: run.sequence,
    createdAt: run.createdAt,
  });
  return projection;
}

describe("RunnerCanonicalThreadSurface", () => {
  it("renders normal activity logs and keeps execution details closed by default", () => {
    render(
      <RunnerCanonicalThreadSurface
        connected
        hasContent
        loading={false}
        projection={projectionWithRun()}
        reconnecting={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Worked for 59s" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Open execution details/i })).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Execution details" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Worked for 59s" }));
    expect(screen.getByText("Completed without tool activity")).toBeTruthy();
  });

  it("exposes execution details only through the controlled app-header workbench", async () => {
    const onExecutionWorkbenchOpenChange = vi.fn();
    const onExecutionWorkbenchAvailabilityChange = vi.fn();
    const projection = projectionWithRun();
    const { rerender } = render(
      <RunnerCanonicalThreadSurface
        connected
        executionWorkbenchOpen={false}
        hasContent
        loading={false}
        onExecutionWorkbenchAvailabilityChange={onExecutionWorkbenchAvailabilityChange}
        onExecutionWorkbenchOpenChange={onExecutionWorkbenchOpenChange}
        projection={projection}
        reconnecting={false}
      />,
    );

    expect(onExecutionWorkbenchAvailabilityChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("complementary", { name: "Execution details" })).toBeNull();

    rerender(
      <RunnerCanonicalThreadSurface
        connected
        executionWorkbenchOpen
        hasContent
        loading={false}
        onExecutionWorkbenchAvailabilityChange={onExecutionWorkbenchAvailabilityChange}
        onExecutionWorkbenchOpenChange={onExecutionWorkbenchOpenChange}
        projection={projection}
        reconnecting={false}
      />,
    );

    expect(await screen.findByRole("complementary", { name: "Execution details" })).toBeTruthy();
    expect(screen.getByText("No tool activity was recorded for this run.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close execution details" }));
    expect(onExecutionWorkbenchOpenChange).toHaveBeenCalledWith(false);
  });
});
