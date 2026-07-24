// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  SecurityFinding,
  SecurityRepositoryDetail,
  SecurityRun,
} from "../domain/index.js";
import { SecurityRepositoryDetailPage } from "./security-repository-detail-page.js";

function createRun(id: string, status: SecurityRun["status"]): SecurityRun {
  return {
    id,
    repositoryId: "security_repository_1",
    repositoryFullName: "acme/api",
    triggerType: "manual",
    triggerEventId: null,
    baseSha: null,
    headSha: "0123456789abcdef",
    ref: "refs/heads/main",
    status,
    stage: status === "running" ? "scan" : "complete",
    policyVersionId: "policy_1",
    threatModelVersionId: "threat_model_1",
    promptVersion: "security-v1",
    modelVersion: "model-v1",
    scannerVersions: null,
    coverage: null,
    summary: null,
    error: null,
    findingCount: 0,
    checkRunUrl: null,
    pullRequestUrl: null,
    queuedAt: "2026-07-23T08:00:00.000Z",
    startedAt: null,
    completedAt: null,
    createdAt: "2026-07-23T08:00:00.000Z",
    updatedAt: "2026-07-23T08:00:00.000Z",
  };
}

function createFinding(
  id: string,
  status: SecurityFinding["status"],
  severity: SecurityFinding["severity"],
): SecurityFinding {
  return {
    id,
    repositoryId: "security_repository_1",
    repositoryFullName: "acme/api",
    fingerprint: `fingerprint_${id}`,
    ruleId: `rule_${id}`,
    title: `Finding ${id}`,
    summary: "Security finding summary",
    severity,
    confidence: 0.96,
    exploitability: "high",
    cwe: ["CWE-79"],
    cvss: 8.1,
    status,
    firstSeenRunId: "run_1",
    lastSeenRunId: "run_1",
    assignedToUserId: null,
    resolutionReason: "",
    resolutionExpiresAt: null,
    fixedAt: status === "fixed" ? "2026-07-23T09:00:00.000Z" : null,
    metadata: null,
    occurrenceCount: 1,
    createdAt: "2026-07-23T08:00:00.000Z",
    updatedAt: "2026-07-23T09:00:00.000Z",
  };
}

const detail: SecurityRepositoryDetail = {
  repository: {
    id: "security_repository_1",
    githubRepositoryId: "github_repository_1",
    githubInstallationId: "github_installation_1",
    githubNumericRepositoryId: "101",
    githubNumericInstallationId: "201",
    fullName: "acme/api",
    defaultBranch: "main",
    private: true,
    archived: false,
    status: "active",
    currentPolicyVersionId: null,
    currentThreatModelVersionId: null,
    permissionSet: null,
    lastRunId: "run_3",
    lastRunAt: "2026-07-23T09:00:00.000Z",
    nextScanAt: null,
    metadata: {
      creator: { name: "Ada Lovelace", email: "ada@acme.test" },
      owner: { name: "Ada Lovelace", email: "ada@acme.test" },
    },
    findingCounts: { open: 3, critical: 1, high: 1 },
    lastRunStatus: "succeeded",
    lastRunStage: "complete",
    createdAt: "2026-07-23T08:00:00.000Z",
    updatedAt: "2026-07-23T09:00:00.000Z",
  },
  policy: null,
  threatModel: null,
  runs: [
    createRun("run_1", "running"),
    createRun("run_2", "failed"),
    createRun("run_3", "succeeded"),
  ],
  findings: [
    createFinding("finding_1", "open", "critical"),
    createFinding("finding_2", "fixed", "medium"),
    createFinding("finding_3", "fixed", "low"),
  ],
  auditEvents: [],
};

afterEach(cleanup);

describe("SecurityRepositoryDetailPage", () => {
  it("starts Runs & findings with centralized KPI cards", () => {
    const { container } = render(
      <SecurityRepositoryDetailPage
        detail={detail}
        onOpenRun={vi.fn()}
        onOpenFinding={vi.fn()}
        onSavePolicy={vi.fn()}
        onSaveThreatModel={vi.fn()}
        onSaveSystemPrincipalPermissionSet={vi.fn()}
        onAddTeamAccess={vi.fn()}
        onRemoveTeamAccess={vi.fn()}
        onSaveTeamRolePermissionSet={vi.fn()}
        onSetStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const summary = screen.getByRole("region", {
      name: "Security posture summary",
    });
    expect(summary.parentElement?.firstElementChild).toBe(summary);
    expect(
      summary.querySelectorAll("[data-platform-ui-card-variant='default']"),
    ).toHaveLength(4);

    const openCard = within(summary)
      .getByText("Open findings")
      .closest("[data-platform-ui-card-variant='default']");
    const criticalCard = within(summary)
      .getByText("Critical findings")
      .closest("[data-platform-ui-card-variant='default']");
    const fixesCard = within(summary)
      .getByText("Completed fixes")
      .closest("[data-platform-ui-card-variant='default']");
    const runsCard = within(summary)
      .getByText("Security runs")
      .closest("[data-platform-ui-card-variant='default']");

    expect(openCard?.textContent).toContain("3");
    expect(openCard?.textContent).toContain("1 critical · 1 high");
    expect(criticalCard?.textContent).toContain("1");
    expect(fixesCard?.textContent).toContain("2");
    expect(runsCard?.textContent).toContain("3");
    expect(runsCard?.textContent).toContain("1 active · 1 failed");
    expect(container.querySelector(".develop-security-metric-grid")).toBe(
      summary,
    );
  });
});
