// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestPlan, TestRun } from "../domain/index.js";
import { TestRunDetailPage } from "./test-run-detail-page.js";

vi.mock("chart.js/auto", () => ({
  default: class ChartMock {
    destroy() {}
  },
}));

afterEach(cleanup);

const plan: TestPlan = {
  id: "plan-1",
  projectId: "project-1",
  name: "Release readiness",
  description: "Checks whether the release is ready.",
  targetType: "project",
  targetId: "project-1",
  defaultEnvironmentId: "environment-1",
  definition: {
    schemaVersion: "1",
    cases: [],
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
  },
  caseCount: 2,
  planFingerprint: "plan-fingerprint",
  publishedVersionId: "version-3",
  metadata: null,
  createdAt: "2026-08-09T08:00:00.000Z",
  updatedAt: "2026-08-09T08:00:00.000Z",
  versions: [{
    id: "version-3",
    testPlanId: "plan-1",
    version: 3,
    label: "Version 3",
    description: "Current release checks",
    status: "published",
    snapshot: {},
    metadata: null,
    publishedAt: "2026-08-09T08:00:00.000Z",
    createdAt: "2026-08-09T08:00:00.000Z",
    updatedAt: "2026-08-09T08:00:00.000Z",
  }],
};

const run: TestRun = {
  id: "run-1",
  testPlanId: "plan-1",
  versionId: "version-3",
  projectId: "project-1",
  taskId: null,
  releaseId: null,
  environmentId: "environment-1",
  agentId: "agent-1",
  triggerType: "manual",
  commitSha: "abc123",
  status: "failed",
  totalCount: 2,
  passedCount: 1,
  failedCount: 1,
  skippedCount: 0,
  errorCount: 0,
  durationMs: 2_500,
  evidence: {
    fingerprint: "run-fingerprint",
    planFingerprint: "plan-fingerprint",
    generatedAt: "2026-08-09T08:01:03.000Z",
    provenance: {
      source: "execution_worker",
      trustLevel: "verified_worker",
      verificationStatus: "verified",
      attestation: { attestationId: "attestation-1" },
    },
  },
  metadata: { executorThreadId: "thread-1" },
  execution: {
    owner: "worker-1",
    attempt: 1,
    leaseExpiresAt: null,
    heartbeatAt: null,
  },
  createdAt: "2026-08-09T08:01:00.000Z",
  updatedAt: "2026-08-09T08:01:03.000Z",
  startedAt: "2026-08-09T08:01:00.000Z",
  completedAt: "2026-08-09T08:01:03.000Z",
  results: [
    {
      id: "result-1",
      testRunId: "run-1",
      caseId: "case-1",
      name: "Build succeeds",
      kind: "command",
      status: "passed",
      attempt: 1,
      durationMs: 1_000,
      exitCode: 0,
      summary: "Build completed successfully.",
      diagnostics: {},
      evidence: { command: "npm run build", stdout: "done" },
      startedAt: "2026-08-09T08:01:00.000Z",
      completedAt: "2026-08-09T08:01:01.000Z",
      createdAt: "2026-08-09T08:01:00.000Z",
      updatedAt: "2026-08-09T08:01:01.000Z",
    },
    {
      id: "result-2",
      testRunId: "run-1",
      caseId: "case-2",
      name: "Smoke test passes",
      kind: "command",
      status: "failed",
      attempt: 2,
      durationMs: 1_500,
      exitCode: 1,
      summary: "The smoke test returned exit code 1.",
      diagnostics: { reason: "assertion_failed" },
      evidence: { command: "npm run smoke", stderr: "failed" },
      startedAt: "2026-08-09T08:01:01.000Z",
      completedAt: "2026-08-09T08:01:03.000Z",
      createdAt: "2026-08-09T08:01:01.000Z",
      updatedAt: "2026-08-09T08:01:03.000Z",
    },
  ],
  artifacts: [],
};

describe("TestRunDetailPage", () => {
  it("leads with run analytics and keeps implementation evidence secondary", () => {
    const onOpenTechnicalDetails = vi.fn();
    const { container } = render(
      <TestRunDetailPage
        run={run}
        plan={plan}
        environments={[{ id: "environment-1", name: "Staging" }]}
        onRefresh={vi.fn()}
        onRunAgain={vi.fn()}
        onOpenTechnicalDetails={onOpenTechnicalDetails}
      />,
    );

    expect(screen.queryByText("Run summary")).toBeNull();
    expect(container.querySelector('section[aria-label="Test run analytics"]')).not.toBeNull();
    expect(container.querySelectorAll(".platform-analytics__metric")).toHaveLength(4);
    expect(container.querySelector(".platform-analytics__chart")).not.toBeNull();

    const resultsTable = screen.getByRole("table", { name: "Test case results" });
    expect(within(resultsTable).getByText("Case")).not.toBeNull();
    expect(within(resultsTable).getByText("Status")).not.toBeNull();
    expect(within(resultsTable).queryByText("Summary")).toBeNull();
    expect(within(resultsTable).getByText("Build completed successfully.")).not.toBeNull();
    expect(within(resultsTable).queryByText("Build completed successfully.")
      ?.closest(".tests-run-case-output__copy")
      ?.querySelector("svg")).toBeNull();
    expect(within(resultsTable).queryByText("Exit code")).toBeNull();
    expect(within(resultsTable).queryByText("Attempt")).toBeNull();
    expect(screen.getByRole("searchbox", { name: "Search case results" })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Case output" })).toBeNull();

    expect(screen.getByRole("searchbox", { name: "Search artifacts" })).not.toBeNull();
    expect(screen.queryByText("Files, screenshots, traces, and reports retained by this run.")).toBeNull();

    fireEvent.click(within(resultsTable).getByRole("button", {
      name: "Open actions for Build succeeds, Passed",
    }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Expand" }));
    expect(within(resultsTable).getByText("Attempt")).not.toBeNull();
    expect(within(resultsTable).getByText("Exit code")).not.toBeNull();
    expect(within(resultsTable).getByText("Standard output")).not.toBeNull();
    expect(within(resultsTable).getByText("done")).not.toBeNull();

    expect(screen.getByRole("heading", { name: "Run evidence" })).not.toBeNull();
    expect(screen.getByText("Worker verified")).not.toBeNull();
    expect(screen.getByText("v3")).not.toBeNull();
    const detailsSidebar = container.querySelector<HTMLElement>(
      '[data-platform-detail-sidebar="true"]',
    );
    expect(detailsSidebar).not.toBeNull();
    expect(detailsSidebar?.querySelector(".platform-resource-detail-sidebar")).not.toBeNull();
    expect(within(detailsSidebar as HTMLElement).queryByText("Project")).toBeNull();
    expect(within(detailsSidebar as HTMLElement).queryByText("Executor")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Test run actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Technical details" }));
    expect(onOpenTechnicalDetails).toHaveBeenCalledTimes(1);
  });
});
