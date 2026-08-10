// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestPlan } from "../domain/index.js";
import { TestRunCreateModal } from "./test-run-create-modal.js";

afterEach(cleanup);

const definition = {
  schemaVersion: "computer_agents_test_plan_v1",
  cases: [{
    id: "ready",
    name: "Ready",
    description: "",
    kind: "contract" as const,
    command: "",
    workingDirectory: "",
    timeoutMs: 30_000,
    retries: 0,
    env: {},
    secretRefs: [],
    request: { target: "control_plane_readiness" },
    assertions: [],
    agentId: "",
    enabled: true,
    tags: ["smoke"],
  }],
  concurrency: 1,
  stopOnFailure: false,
  retryPolicy: { maxAttempts: 1 },
  evidencePolicy: {
    retainLogs: true,
    retainScreenshots: true,
    retainTraces: true,
    retainArtifacts: true,
    redactSecrets: true,
  },
};

const plan = {
  id: "plan-1",
  name: "Readiness",
  projectId: null,
  defaultEnvironmentId: "environment-1",
  publishedVersionId: "version-2",
  definition,
  versions: [{
    id: "version-2",
    version: 2,
    label: "Release candidate",
    snapshot: { definition },
  }],
} as unknown as TestPlan;

describe("TestRunCreateModal", () => {
  it("shows the exact published version and deterministic trust boundary", async () => {
    const onRun = vi.fn().mockResolvedValue({ id: "run-1" });
    render(
      <TestRunCreateModal
        open
        plan={plan}
        environments={[]}
        agents={[]}
        onClose={vi.fn()}
        onRun={onRun}
      />,
    );

    expect(screen.getByText("v2 · Release candidate")).not.toBeNull();
    expect(screen.getByText("Verified worker")).not.toBeNull();
    expect(screen.queryByLabelText("Test run environment")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Run Tests" }));

    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
    expect(onRun).toHaveBeenCalledWith(plan, expect.objectContaining({
      versionId: "version-2",
      environmentId: undefined,
      agentId: undefined,
      triggerType: "manual",
    }));
  });
});
