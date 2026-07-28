import { Activity, Ban, Boxes, ExternalLink, GitCommitHorizontal, History } from "lucide-react";
import { useMemo, useState } from "react";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import { PlatformDataTable, type PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import type {
  SecurityAuditEvent,
  SecurityFinding,
  SecurityRemediation,
  SecurityRunDetail,
} from "../domain/index.js";
import { formatSecurityAction, formatSecurityTimestamp } from "../domain/index.js";
import {
  SecurityDetailHeaderActionsPortal,
  SecurityResourceDetailPage,
} from "./security-detail-layout.js";
import {
  SecurityFindingStatusLabel,
  SecurityJsonEvidence,
  SecurityPropertyList,
  SecurityRunStatusLabel,
  SecuritySeverityLabel,
} from "./security-presenters.js";

export type SecurityRunTab = "overview" | "audit" | "artifacts";

export const SECURITY_RUN_TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "audit", label: "Audit trail", icon: History },
  { id: "artifacts", label: "Artifacts", icon: Boxes },
] as const;
export const SECURITY_RUN_HEADER_SECTIONS = SECURITY_RUN_TABS.map(
  ({ id, label }) => ({ value: id, label }),
);

const RUN_STAGES = ["ingest", "checkout", "inventory", "scan", "validate", "triage", "remediate", "verify", "publish", "complete"] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export interface SecurityRunDetailPageProps {
  detail: SecurityRunDetail;
  activeTab?: SecurityRunTab;
  busy?: boolean;
  controlsPortalId?: string;
  onRefresh: () => void;
  onCancel: () => void;
  onFixFindings: () => void;
  onOpenPullRequest: (url: string) => void;
  onOpenFinding: (finding: SecurityFinding) => void;
  onTabChange?: (tab: SecurityRunTab) => void;
}

function latestFindingRemediation(
  rows: readonly SecurityRemediation[],
  findingId: string,
): SecurityRemediation | null {
  return rows
    .filter((row) => (
      row.findingId === findingId
      || row.findingIds?.includes(findingId)
    ))
    .sort((left, right) => (
      Date.parse(right.updatedAt || right.createdAt || "")
      - Date.parse(left.updatedAt || left.createdAt || "")
    ))[0] || null;
}

function FindingRemediationStatus({
  finding,
  remediations,
}: {
  finding: SecurityFinding;
  remediations: readonly SecurityRemediation[];
}) {
  const lifecycle = latestFindingRemediation(
    remediations,
    finding.id,
  )?.lifecycle;
  if (["queued", "generating", "agent_running"].includes(lifecycle || "")) {
    return <PlatformLabel variant="blue">Preparing fix</PlatformLabel>;
  }
  if (lifecycle === "pull_request_open") {
    return <PlatformLabel variant="blue">Fix in PR</PlatformLabel>;
  }
  if (["merged", "verifying"].includes(lifecycle || "")) {
    return <PlatformLabel variant="blue">Verifying</PlatformLabel>;
  }
  if (lifecycle === "fixed") {
    return <PlatformLabel variant="green">Fixed</PlatformLabel>;
  }
  if (lifecycle === "deployed") {
    return <PlatformLabel variant="green">Deployed</PlatformLabel>;
  }
  if (lifecycle === "verification_failed") {
    return <PlatformLabel variant="gray">Fix incomplete</PlatformLabel>;
  }
  if (lifecycle === "pull_request_closed") {
    return <PlatformLabel variant="gray">PR closed</PlatformLabel>;
  }
  return <SecurityFindingStatusLabel status={finding.status} />;
}

function RunFindings({
  rows,
  remediations,
  onOpen,
}: {
  rows: readonly SecurityFinding[];
  remediations: readonly SecurityRemediation[];
  onOpen: (finding: SecurityFinding) => void;
}) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const columns = useMemo<PlatformDataTableColumn<SecurityFinding>[]>(() => [
    { id: "title", header: "Finding", accessor: "title", sortable: true, width: "minmax(360px, 2.2fr)", cell: ({ row }) => <span className="develop-security-finding-title">{row.title}</span> },
    { id: "severity", header: "Severity", accessor: "severity", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => <SecuritySeverityLabel severity={row.severity} /> },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "minmax(125px, .65fr)",
      cell: ({ row }) => (
        <FindingRemediationStatus
          finding={row}
          remediations={remediations}
        />
      ),
    },
    { id: "confidence", header: "Confidence", accessor: "confidence", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => `${Math.round(row.confidence * 100)}%` },
  ], [remediations]);
  const filteredRows = useMemo(
    () => rows.filter((row) =>
      (severityFilter === "all" || row.severity === severityFilter)
      && (statusFilter === "all" || row.status === statusFilter)),
    [rows, severityFilter, statusFilter],
  );
  return (
    <PlatformDataTable
      rows={filteredRows}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Run findings"
      selection={{
        enabled: true,
        ariaLabel: (row) => `Select ${row.title}`,
      }}
      toolbar={{
        title: "Findings",
        search: {
          placeholder: "Search findings",
          ariaLabel: "Search findings",
          getSearchText: (row) => [
            row.title,
            row.ruleId,
            row.summary,
            row.narrativeSummary,
            row.severity,
            row.status,
          ].filter(Boolean).join(" "),
        },
        filters: [
          {
            id: "severity",
            label: "Severity",
            value: severityFilter,
            onChange: setSeverityFilter,
            options: [
              { id: "all", label: "All severities" },
              { id: "critical", label: "Critical" },
              { id: "high", label: "High" },
              { id: "medium", label: "Medium" },
              { id: "low", label: "Low" },
              { id: "informational", label: "Informational" },
            ],
          },
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All statuses" },
              { id: "open", label: "Open" },
              { id: "accepted", label: "Accepted" },
              { id: "risk_accepted", label: "Risk accepted" },
              { id: "false_positive", label: "False positive" },
              { id: "fixed", label: "Fixed" },
            ],
          },
        ],
      }}
      onRowActivate={onOpen}
      getRowAriaLabel={(row) => `Open ${row.title}`}
      layout="fill"
      variant="minimalistic-ui"
      emptyState="This run has no recorded findings."
      noResultsState="No findings match this view."
    />
  );
}

function RunAudit({ rows }: { rows: readonly SecurityAuditEvent[] }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityAuditEvent>[]>(() => [
    { id: "event", header: "Event", accessor: "action", sortable: true, width: "minmax(230px, 1.3fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{formatSecurityAction(row.action)}</strong><code>{row.eventHash.slice(0, 16)}</code></div> },
    { id: "actor", header: "Actor", accessor: "actorType", sortable: true, width: "minmax(130px, .65fr)", cell: ({ row }) => <PlatformLabel variant={row.actorType === "agent" ? "blue" : row.actorType === "github" ? "green" : "gray"}>{row.actorType}</PlatformLabel> },
    { id: "time", header: "Recorded", accessor: "createdAt", sortable: true, sortDescFirst: true, width: "minmax(165px, .85fr)", cell: ({ row }) => formatSecurityTimestamp(row.createdAt) },
  ], []);
  return <PlatformDataTable rows={rows} columns={columns} getRowId={(row) => row.id} ariaLabel="Run audit trail" surface="plain" layout="fill" variant="minimalistic-ui" sorting={{ defaultValue: { id: "time", direction: "asc" } }} emptyState="No run audit events were recorded." />;
}

export function SecurityRunDetailPage({
  detail,
  activeTab: controlledActiveTab,
  busy = false,
  controlsPortalId,
  onRefresh,
  onCancel,
  onFixFindings,
  onOpenPullRequest,
  onOpenFinding,
  onTabChange,
}: SecurityRunDetailPageProps) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<SecurityRunTab>("overview");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const handleTabChange = onTabChange ?? setInternalActiveTab;
  const run = detail.run;
  const cancellable = ["queued", "running", "waiting_approval"].includes(run.status);
  const critical = detail.findings.filter((finding) => finding.severity === "critical").length;
  const publication = asRecord(asRecord(run.summary).publication);
  const remediation = asRecord(asRecord(run.summary).remediation);
  const publicationKind = publication.kind === "commit_status" ? "commit status" : "check";
  const publicationError = asRecord(publication.error);
  const remediationReason = String(remediation.reason || "");
  const technicalSummary = { ...asRecord(run.summary) };
  delete technicalSummary.narrative;
  const latestRemediation = [...detail.remediations].sort(
    (left, right) => (
      Date.parse(right.updatedAt || right.createdAt || "")
      - Date.parse(left.updatedAt || left.createdAt || "")
    ),
  )[0] || null;
  const remediationLifecycle = String(
    latestRemediation?.lifecycle
    || latestRemediation?.validation?.lifecycle
    || latestRemediation?.status
    || "",
  );
  const eligibleFindingCount = detail.findings.filter(
    (finding) => ["open", "accepted"].includes(finding.status),
  ).length;
  const runComplete = [
    "succeeded",
    "partial",
    "failed",
    "cancelled",
  ].includes(run.status);
  const remediationRunning = [
    "queued",
    "generating",
    "agent_running",
  ].includes(remediationLifecycle);
  const remediationVerifying = [
    "merged",
    "verifying",
  ].includes(remediationLifecycle);
  const remediationDeployed = remediationLifecycle === "deployed";
  const remediationFixed = remediationLifecycle === "fixed";
  const remediationPullRequestOpen =
    remediationLifecycle === "pull_request_open"
    && Boolean(latestRemediation?.pullRequestUrl);
  const remediationDeployment = asRecord(
    latestRemediation?.validation?.deployment,
  );
  const remediationStatus = remediationRunning
    ? <PlatformLabel variant="blue">Preparing</PlatformLabel>
    : remediationPullRequestOpen
      ? <PlatformLabel variant="blue">Pull request open</PlatformLabel>
      : remediationVerifying
        ? <PlatformLabel variant="blue">Verifying</PlatformLabel>
        : remediationDeployed
          ? <PlatformLabel variant="green">Deployed</PlatformLabel>
          : remediationFixed
            ? <PlatformLabel variant="green">Fixed</PlatformLabel>
            : latestRemediation
              ? <PlatformLabel variant="gray">{formatSecurityAction(remediationLifecycle || latestRemediation.status)}</PlatformLabel>
              : null;
  const remediationButtonLabel = remediationPullRequestOpen
    ? "Open pull request"
    : remediationRunning
      ? "Preparing fixes..."
      : remediationVerifying
        ? "Verifying fix..."
        : remediationDeployed
          ? "Fix deployed"
          : remediationFixed
            ? "Fix verified"
            : eligibleFindingCount
              ? latestRemediation
                ? "Retry fixes"
                : "Fix findings"
              : "No open findings";
  const remediationButtonDisabled = busy
    || remediationRunning
    || remediationVerifying
    || remediationFixed
    || remediationDeployed
    || !runComplete
    || (!remediationPullRequestOpen && eligibleFindingCount === 0);
  let content = (
    <div className="develop-security-detail-stack">
      <PlatformAnalyticsSection
        className="develop-security-run-kpis"
        showChart={false}
        analytics={{
          ariaLabel: "Security run summary",
          metrics: [
            {
              id: "findings",
              label: "Findings",
              value: detail.findings.length,
              color: critical ? "#f53b3a" : "#4da3ff",
            },
            {
              id: "stage",
              label: "Stage",
              value: formatSecurityAction(run.stage),
              color: "#a78bfa",
            },
            {
              id: "artifacts",
              label: "Artifacts",
              value: detail.artifacts.length,
              color: "#7effff",
            },
            {
              id: "remediations",
              label: "Remediations",
              value: detail.remediations.length,
              color: "#85df7b",
            },
          ],
          labels: [],
          series: [],
        }}
      />
      <ol className="develop-security-timeline" aria-label="Security run stages">
        {RUN_STAGES.map((stage) => {
          const currentIndex = RUN_STAGES.indexOf(run.stage);
          const stageIndex = RUN_STAGES.indexOf(stage);
          return <li key={stage} className={`${stageIndex < currentIndex || run.status === "succeeded" ? "is-complete" : ""}${stageIndex === currentIndex && run.status !== "succeeded" ? " is-current" : ""}`}><span /><small>{stage}</small></li>;
        })}
      </ol>
      <section
        className="develop-security-run-narrative-section"
        aria-labelledby="develop-security-run-summary-title"
      >
        <h2 id="develop-security-run-summary-title">Run summary</h2>
        <p className="develop-security-narrative">{run.narrativeSummary || (run.status === "queued" ? "The run is queued for an isolated security worker." : "No written run summary was recorded.")}</p>
      </section>
      <RunFindings
        rows={detail.findings}
        remediations={detail.remediations}
        onOpen={onOpenFinding}
      />
      <div className="develop-security-card-grid">
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><Activity width={18} height={18} /><div><strong>Technical details</strong><span>Coverage, counts, and worker state</span></div></div>
          <SecurityJsonEvidence value={technicalSummary} empty={run.status === "queued" ? "The run is queued for an isolated security worker." : "No structured run details were recorded."} />
        </PlatformUiCard>
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitCommitHorizontal width={18} height={18} /><div><strong>Publication</strong><span>GitHub result and remediation</span></div></div>
          {run.checkRunUrl ? <a className="develop-security-external-link" href={run.checkRunUrl} target="_blank" rel="noreferrer">Open GitHub {publicationKind} <ExternalLink width={13} height={13} /></a> : publication.status === "failed" ? <p>GitHub publication failed: {String(publicationError.message || "The connected identity could not publish this result.")}</p> : <p>No GitHub result has been published.</p>}
          {latestRemediation?.pullRequestUrl || run.pullRequestUrl ? <a className="develop-security-external-link" href={latestRemediation?.pullRequestUrl || run.pullRequestUrl || "#"} target="_blank" rel="noreferrer">Open remediation pull request <ExternalLink width={13} height={13} /></a> : remediationReason === "disabled_by_policy" ? <p>Remediation was skipped because it is disabled by policy.</p> : remediationReason === "no_findings" ? <p>Remediation was skipped because this run produced no findings.</p> : <p>No remediation pull request has been published.</p>}
        </PlatformUiCard>
      </div>
      {run.error ? <PlatformUiCard as="section" className="develop-security-callout is-danger"><SecurityJsonEvidence value={run.error} /></PlatformUiCard> : null}
    </div>
  );
  if (activeTab === "audit") content = <RunAudit rows={detail.auditEvents} />;
  if (activeTab === "artifacts") content = (
    <div className="develop-security-artifact-list">
      {detail.artifacts.length ? detail.artifacts.map((artifact) => (
        <PlatformUiCard key={artifact.id} as="article" className="develop-security-content-card">
          <div className="develop-security-card-heading"><Boxes width={18} height={18} /><div><strong>{String(artifact.kind || "artifact").replace(/_/g, " ")}</strong><span>{artifact.id}</span></div></div>
          <SecurityPropertyList items={[
            { label: "Digest", value: <code>{String(artifact.digest || "").slice(0, 32)}</code> },
            { label: "Classification", value: String(artifact.classification || "confidential") },
            { label: "Media type", value: String(artifact.mediaType || "application/octet-stream") },
            { label: "Created", value: formatSecurityTimestamp(String(artifact.createdAt || "")) },
          ]} />
        </PlatformUiCard>
      )) : <p className="develop-security-muted">No classified artifacts were retained for this run.</p>}
    </div>
  );

  return (
    <>
      <SecurityDetailHeaderActionsPortal portalId={controlsPortalId}>
        <div className="develop-security-inline-actions">
          <PlatformSecondaryButton
            size="small"
            onClick={onRefresh}
            disabled={busy}
          >
            Refresh
          </PlatformSecondaryButton>
          {cancellable ? (
            <PlatformPrimaryButton
              size="small"
              className="is-destructive"
              onClick={onCancel}
              disabled={busy}
            >
              <Ban width={14} height={14} /> Cancel run
            </PlatformPrimaryButton>
          ) : null}
        </div>
      </SecurityDetailHeaderActionsPortal>
      <SecurityResourceDetailPage<SecurityRunTab>
        tabs={[]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ariaLabel={`Security run ${run.id}`}
        sidebar={
          <PlatformUiCard
            as="section"
            variant="sidebar"
            className="playground-project-overview-sidebar-card playground-server-detail-properties-card playground-security-agent-detail-properties-card"
          >
            <SecurityPropertyList
              variant="sidebar"
              items={[
                {
                  label: "Status",
                  value: <SecurityRunStatusLabel status={run.status} />,
                },
                { label: "Stage", value: run.stage },
                {
                  label: "Trigger",
                  value: run.triggerType.replace(/_/g, " "),
                },
                {
                  label: "Commit",
                  value: (
                    <code title={run.headSha || ""}>
                      {run.headSha?.slice(0, 12) || "Pending"}
                    </code>
                  ),
                },
                {
                  label: "Policy",
                  value:
                    run.policyVersionId?.replace("security_policy_", "") || "—",
                },
                {
                  label: "Threat model",
                  value:
                    run.threatModelVersionId?.replace(
                      "security_threat_model_",
                      "",
                    ) || "—",
                },
                {
                  label: "Queued",
                  value: formatSecurityTimestamp(run.queuedAt),
                },
                {
                  label: "Completed",
                  value: formatSecurityTimestamp(run.completedAt),
                },
                ...(remediationStatus ? [{
                  label: "Fix status",
                  value: remediationStatus,
                }] : []),
                ...(remediationDeployment.environment ? [{
                  label: "Deployment",
                  value: String(remediationDeployment.environment),
                }] : []),
              ]}
            />
            <PlatformPrimaryButton
              type="button"
              className="develop-security-repository-run-scan"
              onClick={() => {
                if (
                  remediationPullRequestOpen
                  && latestRemediation?.pullRequestUrl
                ) {
                  onOpenPullRequest(latestRemediation.pullRequestUrl);
                  return;
                }
                onFixFindings();
              }}
              disabled={remediationButtonDisabled}
            >
              {remediationButtonLabel}
            </PlatformPrimaryButton>
          </PlatformUiCard>
        }
      >
        {content}
      </SecurityResourceDetailPage>
    </>
  );
}
