// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialRunnerThreadProjection } from "../../thread/projection.js";
import type { RunnerThreadAction, RunnerThreadRun } from "../../thread/types.js";
import { RunnerCanonicalThreadSurface } from "./canonical-thread-surface.js";

const canvasContext = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  clip: vi.fn(),
  createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fill: vi.fn(),
  rect: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
  it("renders persisted connector mentions on canonical user messages", () => {
    const projection = projectionWithRun();
    projection.participantsById.user = {
      id: "user",
      kind: "human",
      displayName: "You",
    };
    projection.messagesById["message-1"] = {
      kind: "message",
      id: "message-1",
      threadId: projection.threadId,
      sequence: 0,
      authorParticipantId: "user",
      content: "Review the repository.",
      modality: "text",
      metadata: { runnerConnectorIds: ["connector_github"] },
      createdAt: "2030-07-25T07:59:00.000Z",
    };
    projection.timeline.unshift({
      kind: "message",
      id: "message-1",
      sequence: 0,
      createdAt: "2030-07-25T07:59:00.000Z",
    });

    render(
      <RunnerCanonicalThreadSurface
        availableConnectorOptions={[
          {
            id: "github",
            name: "GitHub",
            description: "Repositories and pull requests",
          },
        ]}
        connected
        hasContent
        loading={false}
        projection={projection}
        reconnecting={false}
      />,
    );

    expect(screen.getByRole("group", { name: "Message connectors" })).toBeTruthy();
    expect(screen.getByText("GitHub")).toBeTruthy();
    expect(screen.getByText("Review the repository.")).toBeTruthy();
  });

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
    const connectorAction: RunnerThreadAction = {
      kind: "action",
      id: "action-1",
      threadId: projection.threadId,
      runId: "run-1",
      sequence: 2,
      type: "tool_call",
      title: "Searched GitHub",
      status: "completed",
      toolName: "mcp__connector_github__search_repositories",
      metadata: { connectorId: "github" },
      createdAt: "2030-07-25T08:00:10.000Z",
    };
    projection.actionsById[connectorAction.id] = connectorAction;
    projection.runsById["run-1"].highestPermissionRing = 2;
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
        availableConnectorOptions={[
          {
            id: "github",
            name: "GitHub",
            description: "Repositories and pull requests",
          },
        ]}
        connected
        executionWorkbenchOpen
        hasContent
        loading={false}
        onExecutionWorkbenchAvailabilityChange={onExecutionWorkbenchAvailabilityChange}
        onExecutionWorkbenchOpenChange={onExecutionWorkbenchOpenChange}
        projection={projection}
        reconnecting={false}
        taskList={{
          status: "loaded",
          items: [{ id: "todo-1", text: "Review the implementation", completed: true }],
        }}
      />,
    );

    expect(await screen.findByRole("complementary", { name: "Execution details" })).toBeTruthy();
    expect(screen.getByText("Task List")).toBeTruthy();
    expect(screen.queryByText(/1 of 1 completed/i)).toBeNull();
    expect(
      document.querySelector(
        ".platform-thread-workbench__summary-item.is-complete .hugeicons-circle-check",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Review the implementation")).toBeTruthy();
    expect(screen.getByText("Connectors")).toBeTruthy();
    expect(screen.getByText("GitHub")).toBeTruthy();
    expect(document.querySelector(".platform-permission-mini-ring-icon.is-ring-2")).toBeTruthy();
    expect(screen.queryByText("Changes")).toBeNull();
    expect(screen.queryByText("Resources")).toBeNull();

    rerender(
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
    expect(screen.queryByRole("complementary", { name: "Execution details" })).toBeNull();
  });

  it("keeps a published task list available before an execution receipt exists", async () => {
    const onExecutionWorkbenchAvailabilityChange = vi.fn();

    render(
      <RunnerCanonicalThreadSurface
        connected
        executionWorkbenchOpen
        hasContent={false}
        loading={false}
        onExecutionWorkbenchAvailabilityChange={onExecutionWorkbenchAvailabilityChange}
        projection={createInitialRunnerThreadProjection("task-list-only")}
        reconnecting={false}
        taskList={{
          status: "loaded",
          items: [{ id: "todo-1", text: "Prepare the release", completed: false }],
        }}
      />,
    );

    expect(onExecutionWorkbenchAvailabilityChange).toHaveBeenCalledWith(true);
    expect(await screen.findByRole("complementary", { name: "Execution details" })).toBeTruthy();
    expect(screen.getByText("Prepare the release")).toBeTruthy();
  });
});
