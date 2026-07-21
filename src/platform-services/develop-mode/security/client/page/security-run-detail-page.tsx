import { Activity, Ban, Boxes, ExternalLink, FileSearch, GitCommitHorizontal, GitPullRequest, History, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PlatformDataTable, type PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { SecurityAuditEvent, SecurityFinding, SecurityRunDetail } from "../domain/index.js";
import { formatSecurityAction, formatSecurityTimestamp } from "../domain/index.js";
import {
  SecurityBackHeader,
  SecurityFindingStatusLabel,
  SecurityJsonEvidence,
  SecurityMetricGrid,
  SecurityPropertyList,
  SecurityRunStatusLabel,
  SecuritySeverityLabel,
} from "./security-presenters.js";

type SecurityRunTab = "overview" | "findings" | "audit" | "artifacts";

const RUN_TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "findings", label: "Findings", icon: FileSearch },
  { id: "audit", label: "Audit trail", icon: History },
  { id: "artifacts", label: "Artifacts", icon: Boxes },
] as const;

const RUN_STAGES = ["ingest", "checkout", "inventory", "scan", "validate", "triage", "remediate", "verify", "publish", "complete"] as const;

export interface SecurityRunDetailPageProps {
  detail: SecurityRunDetail;
  busy?: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onCancel: () => void;
  onOpenFinding: (finding: SecurityFinding) => void;
}

function RunFindings({ rows, onOpen }: { rows: readonly SecurityFinding[]; onOpen: (finding: SecurityFinding) => void }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityFinding>[]>(() => [
    { id: "title", header: "Finding", accessor: "title", sortable: true, width: "minmax(270px, 1.6fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{row.title}</strong><span>{row.ruleId || row.fingerprint.slice(0, 14)}</span></div> },
    { id: "severity", header: "Severity", accessor: "severity", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => <SecuritySeverityLabel severity={row.severity} /> },
    { id: "status", header: "Status", accessor: "status", sortable: true, width: "minmax(125px, .65fr)", cell: ({ row }) => <SecurityFindingStatusLabel status={row.status} /> },
    { id: "confidence", header: "Confidence", accessor: "confidence", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => `${Math.round(row.confidence * 100)}%` },
  ], []);
  return <PlatformDataTable rows={rows} columns={columns} getRowId={(row) => row.id} ariaLabel="Run findings" onRowActivate={onOpen} getRowAriaLabel={(row) => `Open ${row.title}`} surface="plain" layout="fill" variant="minimalistic-ui" emptyState="This run has no recorded findings." />;
}

function RunAudit({ rows }: { rows: readonly SecurityAuditEvent[] }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityAuditEvent>[]>(() => [
    { id: "event", header: "Event", accessor: "action", sortable: true, width: "minmax(230px, 1.3fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{formatSecurityAction(row.action)}</strong><code>{row.eventHash.slice(0, 16)}</code></div> },
    { id: "actor", header: "Actor", accessor: "actorType", sortable: true, width: "minmax(130px, .65fr)", cell: ({ row }) => <PlatformLabel variant={row.actorType === "agent" ? "blue" : row.actorType === "github" ? "green" : "gray"}>{row.actorType}</PlatformLabel> },
    { id: "time", header: "Recorded", accessor: "createdAt", sortable: true, sortDescFirst: true, width: "minmax(165px, .85fr)", cell: ({ row }) => formatSecurityTimestamp(row.createdAt) },
  ], []);
  return <PlatformDataTable rows={rows} columns={columns} getRowId={(row) => row.id} ariaLabel="Run audit trail" surface="plain" layout="fill" variant="minimalistic-ui" sorting={{ defaultValue: { id: "time", direction: "asc" } }} emptyState="No run audit events were recorded." />;
}

export function SecurityRunDetailPage({ detail, busy = false, onBack, onRefresh, onCancel, onOpenFinding }: SecurityRunDetailPageProps) {
  const [activeTab, setActiveTab] = useState<SecurityRunTab>("overview");
  const run = detail.run;
  const cancellable = ["queued", "running", "waiting_approval"].includes(run.status);
  const critical = detail.findings.filter((finding) => finding.severity === "critical").length;
  const high = detail.findings.filter((finding) => finding.severity === "high").length;
  let content = (
    <div className="develop-security-detail-stack">
      <SecurityMetricGrid metrics={[
        { label: "Findings", value: detail.findings.length, tone: critical ? "danger" : "", detail: `${critical} critical · ${high} high` },
        { label: "Stage", value: run.stage, detail: run.status.replace(/_/g, " ") },
        { label: "Artifacts", value: detail.artifacts.length, detail: "Digest-addressed evidence" },
        { label: "Remediations", value: detail.remediations.length, detail: run.pullRequestUrl ? "Draft pull request published" : "No GitHub publication" },
      ]} />
      <ol className="develop-security-timeline" aria-label="Security run stages">
        {RUN_STAGES.map((stage) => {
          const currentIndex = RUN_STAGES.indexOf(run.stage);
          const stageIndex = RUN_STAGES.indexOf(stage);
          return <li key={stage} className={`${stageIndex < currentIndex || run.status === "succeeded" ? "is-complete" : ""}${stageIndex === currentIndex && run.status !== "succeeded" ? " is-current" : ""}`}><span /><small>{stage}</small></li>;
        })}
      </ol>
      <div className="develop-security-card-grid">
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><ShieldCheck width={18} height={18} /><div><strong>Run summary</strong><span>Worker-produced structured result</span></div></div>
          <SecurityJsonEvidence value={run.summary} empty={run.status === "queued" ? "The run is queued for an isolated security worker." : "No structured run summary was recorded."} />
        </PlatformUiCard>
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitPullRequest width={18} height={18} /><div><strong>Publication</strong><span>GitHub check and pull request</span></div></div>
          {run.checkRunUrl ? <a className="develop-security-external-link" href={run.checkRunUrl} target="_blank" rel="noreferrer">Open GitHub check <ExternalLink width={13} height={13} /></a> : <p>No GitHub check has been published.</p>}
          {run.pullRequestUrl ? <a className="develop-security-external-link" href={run.pullRequestUrl} target="_blank" rel="noreferrer">Open draft pull request <ExternalLink width={13} height={13} /></a> : <p>No remediation pull request has been published.</p>}
        </PlatformUiCard>
      </div>
      {run.error ? <PlatformUiCard as="section" className="develop-security-callout is-danger"><SecurityJsonEvidence value={run.error} /></PlatformUiCard> : null}
    </div>
  );
  if (activeTab === "findings") content = <RunFindings rows={detail.findings} onOpen={onOpenFinding} />;
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
    <ResourceDetailPage<SecurityRunTab>
      header={<SecurityBackHeader eyebrow="Security run" title={run.repositoryFullName || run.id} description={<span><GitCommitHorizontal width={13} height={13} /> <code>{run.headSha || "commit pending"}</code></span>} onBack={onBack} />}
      headerActions={<div className="develop-security-inline-actions"><PlatformSecondaryButton size="small" onClick={onRefresh} disabled={busy}>Refresh</PlatformSecondaryButton>{cancellable ? <PlatformPrimaryButton size="small" className="is-destructive" onClick={onCancel} disabled={busy}><Ban width={14} height={14} /> Cancel run</PlatformPrimaryButton> : null}</div>}
      tabs={RUN_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      ariaLabel={`Security run ${run.id}`}
      className="develop-security-resource-detail"
      contentClassName="develop-security-detail-content"
      sidebarClassName="develop-security-detail-sidebar"
      sidebar={(
        <PlatformUiCard as="section" variant="sidebar" cardTitle="Run properties">
          <SecurityPropertyList items={[
            { label: "Status", value: <SecurityRunStatusLabel status={run.status} /> },
            { label: "Stage", value: run.stage },
            { label: "Trigger", value: run.triggerType.replace(/_/g, " ") },
            { label: "Commit", value: <code title={run.headSha || ""}>{run.headSha?.slice(0, 12) || "Pending"}</code> },
            { label: "Policy", value: run.policyVersionId?.replace("security_policy_", "") || "—" },
            { label: "Threat model", value: run.threatModelVersionId?.replace("security_threat_model_", "") || "—" },
            { label: "Queued", value: formatSecurityTimestamp(run.queuedAt) },
            { label: "Completed", value: formatSecurityTimestamp(run.completedAt) },
          ]} />
        </PlatformUiCard>
      )}
    >
      {content}
    </ResourceDetailPage>
  );
}
