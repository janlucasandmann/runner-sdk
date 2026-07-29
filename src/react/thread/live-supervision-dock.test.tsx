import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  normalizeRunnerThreadPermissionRequest,
  normalizeRunnerThreadRun,
} from "../../thread/normalize.js";
import { createInitialRunnerThreadProjection } from "../../thread/projection.js";
import { RunnerThreadLiveSupervisionDock } from "./live-supervision-dock.js";

describe("RunnerThreadLiveSupervisionDock", () => {
  it("never renders transient active-run status labels", () => {
    const projection = createInitialRunnerThreadProjection("thread_1");
    const run = normalizeRunnerThreadRun({
      id: "run_1",
      threadId: projection.threadId,
      status: "running",
      currentSummary: "Orchestrator is connecting",
      createdAt: "2030-07-29T08:00:00.000Z",
    });
    projection.runsById[run.id] = run;

    const html = renderToStaticMarkup(<RunnerThreadLiveSupervisionDock projection={projection} />);

    expect(html).toBe("");
    expect(html).not.toContain("Orchestrator is connecting");
    expect(html).not.toContain("Working...");
  });

  it("keeps pending permission requests visible", () => {
    const projection = createInitialRunnerThreadProjection("thread_1");
    const request = normalizeRunnerThreadPermissionRequest({
      id: "permission_1",
      threadId: projection.threadId,
      runId: "run_1",
      status: "pending",
      actionLabel: "Deploy service",
      permissionRing: 2,
      requestedAt: "2030-07-29T08:00:00.000Z",
    });
    projection.permissionsById[request.id] = request;

    const html = renderToStaticMarkup(<RunnerThreadLiveSupervisionDock projection={projection} />);

    expect(html).toContain("Action required");
    expect(html).toContain("Deploy service");
  });
});
