// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SecurityRunDetail } from "../domain/index.js";
import {
  SECURITY_RUN_HEADER_SECTIONS,
  SecurityRunDetailPage,
} from "./security-run-detail-page.js";

const detail = {
  run: {
    id: "security_run_1",
    repositoryId: "security_repository_1",
    repositoryFullName: "computer-agents/platform",
    triggerType: "manual",
    triggerEventId: null,
    baseSha: null,
    headSha: "a".repeat(40),
    ref: "refs/heads/main",
    status: "succeeded",
    stage: "complete",
    policyVersionId: "security_policy_1",
    threatModelVersionId: "security_threat_model_1",
    promptVersion: "security-narrative-v1",
    modelVersion: "deepseek-v4-flash",
    scannerVersions: {},
    coverage: {},
    summary: {
      findingCount: 1,
      narrative: {
        text: "This internal value must not replace the projected prose.",
      },
    },
    narrativeSummary:
      "The security agent completed the scan and found one workflow-hardening issue.",
    error: null,
    findingCount: 1,
    checkRunUrl: null,
    pullRequestUrl: null,
    queuedAt: "2026-07-27T09:00:00.000Z",
    startedAt: "2026-07-27T09:00:01.000Z",
    completedAt: "2026-07-27T09:00:05.000Z",
    createdAt: "2026-07-27T09:00:00.000Z",
    updatedAt: "2026-07-27T09:00:05.000Z",
  },
  findings: [{
    id: "security_finding_1",
    repositoryId: "security_repository_1",
    repositoryFullName: "computer-agents/platform",
    fingerprint: "fingerprint-workflow-permissions",
    ruleId: "actions/missing-workflow-permissions",
    title: "Workflow permissions are implicit",
    summary: "The workflow does not declare explicit permissions.",
    narrativeSummary:
      "This workflow relies on implicit token permissions, which can grant jobs broader repository access than they require.",
    severity: "medium",
    confidence: 0.98,
    exploitability: "",
    cwe: [],
    cvss: null,
    status: "open",
    firstSeenRunId: "security_run_1",
    lastSeenRunId: "security_run_1",
    assignedToUserId: null,
    resolutionReason: "",
    resolutionExpiresAt: null,
    fixedAt: null,
    metadata: {},
    occurrenceCount: 1,
    createdAt: "2026-07-27T09:00:05.000Z",
    updatedAt: "2026-07-27T09:00:05.000Z",
  }],
  auditEvents: [],
  artifacts: [],
  remediations: [],
} as unknown as SecurityRunDetail;

afterEach(cleanup);

describe("SecurityRunDetailPage narratives", () => {
  it("renders the projected written run summary", () => {
    render(
      <SecurityRunDetailPage
        detail={detail}
        activeTab="overview"
        onRefresh={vi.fn()}
        onCancel={vi.fn()}
        onFixFindings={vi.fn()}
        onOpenPullRequest={vi.fn()}
        onOpenFinding={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "The security agent completed the scan and found one workflow-hardening issue.",
      ),
    ).toBeTruthy();
    expect(
      screen.queryByText("Evidence-grounded Security Analyst assessment"),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Run summary" }).closest(
        ".platform-ui-card",
      ),
    ).toBeNull();
    expect(screen.getByLabelText("Security run summary")).toBeTruthy();
    expect(
      document.querySelectorAll(".platform-analytics__metric"),
    ).toHaveLength(4);
    expect(document.querySelector(".develop-security-metric-grid")).toBeNull();
    expect(document.querySelector(".platform-analytics__chart")).toBeNull();
    expect(screen.getByRole("heading", { name: "Findings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Filter" })).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "Search findings" })).toBeTruthy();
    expect(
      document.querySelector(".platform-data-table.is-minimalistic-ui"),
    ).toBeTruthy();
    expect(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("checkbox", {
        name: "Select Workflow permissions are implicit",
      }),
    ).toBeTruthy();
    expect(
      screen.queryByText(
        "This workflow relies on implicit token permissions, which can grant jobs broader repository access than they require.",
      ),
    ).toBeNull();
    expect(
      screen.queryByText("actions/missing-workflow-permissions"),
    ).toBeNull();
    expect(
      screen.getByText("Workflow permissions are implicit").classList.contains(
        "develop-security-finding-title",
      ),
    ).toBe(true);
  });

  it("exposes findings on the overview instead of a separate tab", () => {
    expect(SECURITY_RUN_HEADER_SECTIONS).toEqual([
      { value: "overview", label: "Overview" },
      { value: "audit", label: "Audit trail" },
      { value: "artifacts", label: "Artifacts" },
    ]);
  });

  it("queues one remediation batch for the run's open findings", () => {
    const onFixFindings = vi.fn();
    render(
      <SecurityRunDetailPage
        detail={detail}
        activeTab="overview"
        onRefresh={vi.fn()}
        onCancel={vi.fn()}
        onFixFindings={onFixFindings}
        onOpenPullRequest={vi.fn()}
        onOpenFinding={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fix findings" }));

    expect(onFixFindings).toHaveBeenCalledTimes(1);
  });

  it("opens the verified GitHub pull request and projects its finding state", () => {
    const onOpenPullRequest = vi.fn();
    const pullRequestUrl =
      "https://github.com/computer-agents/platform/pull/42";
    const detailWithPullRequest = {
      ...detail,
      remediations: [{
        id: "security_remediation_1",
        repositoryId: "security_repository_1",
        findingId: null,
        findingIds: ["security_finding_1"],
        runId: "security_run_1",
        status: "published",
        lifecycle: "pull_request_open",
        patchDigest: "digest",
        validation: { lifecycle: "pull_request_open" },
        approvedByUserId: "user_1",
        approvedAt: "2026-07-27T09:01:00.000Z",
        branchName: "computer-agents/security/test",
        pullRequestId: "42",
        pullRequestUrl,
        workerThreadId: "thread_1",
        sourceSha: "a".repeat(40),
        metadata: {},
        createdAt: "2026-07-27T09:01:00.000Z",
        updatedAt: "2026-07-27T09:02:00.000Z",
      }],
    } as unknown as SecurityRunDetail;
    render(
      <SecurityRunDetailPage
        detail={detailWithPullRequest}
        activeTab="overview"
        onRefresh={vi.fn()}
        onCancel={vi.fn()}
        onFixFindings={vi.fn()}
        onOpenPullRequest={onOpenPullRequest}
        onOpenFinding={vi.fn()}
      />,
    );

    expect(screen.getByText("Fix in PR")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Open pull request" }),
    );
    expect(onOpenPullRequest).toHaveBeenCalledWith(pullRequestUrl);
  });

  it("marks a finding fixed only after post-merge verification", () => {
    const fixedDetail = {
      ...detail,
      remediations: [{
        id: "security_remediation_1",
        repositoryId: "security_repository_1",
        findingId: null,
        findingIds: ["security_finding_1"],
        runId: "security_run_1",
        status: "published",
        lifecycle: "fixed",
        patchDigest: "digest",
        validation: {
          lifecycle: "fixed",
          verificationRunId: "security_run_verification",
        },
        approvedByUserId: "user_1",
        approvedAt: "2026-07-27T09:01:00.000Z",
        branchName: "computer-agents/security/test",
        pullRequestId: "42",
        pullRequestUrl:
          "https://github.com/computer-agents/platform/pull/42",
        workerThreadId: "thread_1",
        sourceSha: "a".repeat(40),
        metadata: {},
        createdAt: "2026-07-27T09:01:00.000Z",
        updatedAt: "2026-07-27T09:05:00.000Z",
      }],
    } as unknown as SecurityRunDetail;
    render(
      <SecurityRunDetailPage
        detail={fixedDetail}
        activeTab="overview"
        onRefresh={vi.fn()}
        onCancel={vi.fn()}
        onFixFindings={vi.fn()}
        onOpenPullRequest={vi.fn()}
        onOpenFinding={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Fixed")).toHaveLength(2);
    expect(
      (screen.getByRole("button", {
        name: "Fix verified",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("distinguishes a GitHub-confirmed deployment from a verified fix", () => {
    const deployedDetail = {
      ...detail,
      remediations: [{
        id: "security_remediation_1",
        repositoryId: "security_repository_1",
        findingId: null,
        findingIds: ["security_finding_1"],
        runId: "security_run_1",
        status: "published",
        lifecycle: "deployed",
        patchDigest: "digest",
        validation: {
          lifecycle: "deployed",
          verificationRunId: "security_run_verification",
          deployment: {
            id: "123",
            state: "success",
            environment: "production",
          },
        },
        approvedByUserId: "user_1",
        approvedAt: "2026-07-27T09:01:00.000Z",
        branchName: "computer-agents/security/test",
        pullRequestId: "42",
        pullRequestUrl:
          "https://github.com/computer-agents/platform/pull/42",
        workerThreadId: "thread_1",
        sourceSha: "a".repeat(40),
        metadata: {},
        createdAt: "2026-07-27T09:01:00.000Z",
        updatedAt: "2026-07-27T09:05:00.000Z",
      }],
    } as unknown as SecurityRunDetail;
    render(
      <SecurityRunDetailPage
        detail={deployedDetail}
        activeTab="overview"
        onRefresh={vi.fn()}
        onCancel={vi.fn()}
        onFixFindings={vi.fn()}
        onOpenPullRequest={vi.fn()}
        onOpenFinding={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Deployed")).toHaveLength(2);
    expect(
      (screen.getByRole("button", {
        name: "Fix deployed",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
