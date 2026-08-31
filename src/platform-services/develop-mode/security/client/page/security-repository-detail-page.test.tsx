// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SecurityFinding,
  SecurityRepositoryDetail,
  SecurityRun,
} from "../domain/index.js";
import { SecurityRepositoryDetailPage } from "./security-repository-detail-page.js";

vi.mock("chart.js/auto", () => ({
  default: class ChartMock {
    destroy() {}
  },
}));

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

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-26T12:00:00.000Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SecurityRepositoryDetailPage", () => {
  it("uses the canonical Settings page while preserving repository-specific controls", () => {
    const { container } = render(
      <SecurityRepositoryDetailPage
        detail={detail}
        activeTab="settings"
        viewerIdentity={{ name: "Ada Lovelace", email: "ada@acme.test" }}
        onLoadOwnerCandidates={vi.fn().mockResolvedValue([])}
        onOwnerChange={vi.fn()}
        onOpenRun={vi.fn()}
        onOpenFinding={vi.fn()}
        onSavePolicy={vi.fn()}
        onSaveThreatModel={vi.fn()}
        onSaveSystemPrincipalPermissionSet={vi.fn()}
        onAddTeamAccess={vi.fn()}
        onRemoveTeamAccess={vi.fn()}
        onSaveTeamRolePermissionSet={vi.fn()}
        onRunScan={vi.fn()}
        onSetStatus={vi.fn()}
      />,
    );

    expect(container.querySelector("[data-platform-resource-settings-page='true']")).not.toBeNull();
    expect(screen.getByDisplayValue("acme/api")).not.toBeNull();
    expect(screen.getByText("Default branch")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Monitoring state" })).not.toBeNull();
    expect(screen.getByRole("table", { name: "Security Agents access" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Run Scan" })).not.toBeNull();
  });

  it("uses centralized empty states for every activity table view", () => {
    const emptyDetail: SecurityRepositoryDetail = {
      ...detail,
      repository: {
        ...detail.repository,
        findingCounts: { open: 0, critical: 0, high: 0 },
      },
      runs: [],
      findings: [],
      auditEvents: [],
    };

    render(
      <SecurityRepositoryDetailPage
        detail={emptyDetail}
        onOpenRun={vi.fn()}
        onOpenFinding={vi.fn()}
        onSavePolicy={vi.fn()}
        onSaveThreatModel={vi.fn()}
        onSaveSystemPrincipalPermissionSet={vi.fn()}
        onAddTeamAccess={vi.fn()}
        onRemoveTeamAccess={vi.fn()}
        onSaveTeamRolePermissionSet={vi.fn()}
        onSetStatus={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No security runs yet").closest(".platform-empty-state"),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Findings" }));
    expect(
      screen.getByText("No findings yet").closest(".platform-empty-state"),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Audit Log" }));
    expect(
      screen.getByText("No audit events yet").closest(".platform-empty-state"),
    ).not.toBeNull();
  });

  it("starts Runs with centralized analytics and one tabbed activity table", () => {
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
      />,
    );

    const summary = screen.getByRole("region", {
      name: "Security agent activity",
    });
    expect(summary.parentElement?.firstElementChild).toBe(summary);
    expect(summary.getAttribute("data-platform-analytics-variant")).toBe(
      "default",
    );
    expect(
      summary.querySelectorAll(".platform-analytics__metric"),
    ).toHaveLength(5);

    const openCard = within(summary)
      .getByText("Open Findings")
      .closest(".platform-analytics__metric");
    const criticalCard = within(summary)
      .getByText("Critical Findings")
      .closest(".platform-analytics__metric");
    const fixesCard = within(summary)
      .getByText("Completed Fixes")
      .closest(".platform-analytics__metric");
    const runsCard = within(summary)
      .getByText("Security Runs")
      .closest(".platform-analytics__metric");
    const findingsCard = within(summary)
      .getByText("Findings")
      .closest(".platform-analytics__metric");

    expect(openCard?.textContent).toContain("3");
    expect(criticalCard?.textContent).toContain("1");
    expect(fixesCard?.textContent).toContain("2");
    expect(runsCard?.textContent).toContain("3");
    expect(findingsCard?.textContent).toContain("0");
    expect(
      summary.classList.contains("playground-server-detail-analytics"),
    ).toBe(true);
    expect(container.querySelector(".develop-security-metric-grid")).toBeNull();

    expect(screen.getByRole("table", { name: "Security runs" })).not.toBeNull();
    expect(
      screen.queryByRole("table", { name: "Security findings" }),
    ).toBeNull();
    expect(
      screen.queryByRole("table", { name: "Security audit events" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Findings" }));
    expect(
      screen.getByRole("table", { name: "Security findings" }),
    ).not.toBeNull();
    expect(screen.queryByRole("table", { name: "Security runs" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Audit Log" }));
    expect(
      screen.getByRole("table", { name: "Security audit events" }),
    ).not.toBeNull();
    expect(
      screen.queryByRole("table", { name: "Security findings" }),
    ).toBeNull();
  });
});
