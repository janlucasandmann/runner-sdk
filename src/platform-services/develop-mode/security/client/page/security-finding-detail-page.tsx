import { ExternalLink, FileCode2, GitCommitHorizontal, GitPullRequest, ListTree, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import type { SecurityFindingDetail, SecurityFindingStatus } from "../domain/index.js";
import { formatSecurityTimestamp } from "../domain/index.js";
import { SecurityResourceDetailPage } from "./security-detail-layout.js";
import {
  SecurityFindingStatusLabel,
  SecurityJsonEvidence,
  SecurityPropertyList,
  SecuritySeverityLabel,
} from "./security-presenters.js";

export type SecurityFindingTab =
  "evidence" | "occurrences" | "remediation" | "triage";
export const SECURITY_FINDING_TABS = [
  { id: "evidence", label: "Evidence", icon: FileCode2 },
  { id: "occurrences", label: "Occurrences", icon: ListTree },
  { id: "remediation", label: "Remediation", icon: GitPullRequest },
  { id: "triage", label: "Triage", icon: ShieldAlert },
] as const;
export const SECURITY_FINDING_HEADER_SECTIONS = SECURITY_FINDING_TABS.map(
  ({ id, label }) => ({ value: id, label }),
);

export interface SecurityFindingDetailPageProps {
  detail: SecurityFindingDetail;
  activeTab?: SecurityFindingTab;
  busy?: boolean;
  onOpenRun: (runId: string) => void;
  onTriage: (input: { status: SecurityFindingStatus; reason?: string; expiresAt?: string | null }) => void;
  onTabChange?: (tab: SecurityFindingTab) => void;
}

export function SecurityFindingDetailPage({
  detail,
  activeTab: controlledActiveTab,
  busy = false,
  onOpenRun,
  onTriage,
  onTabChange,
}: SecurityFindingDetailPageProps) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<SecurityFindingTab>("evidence");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const handleTabChange = onTabChange ?? setInternalActiveTab;
  const finding = detail.finding;
  const [status, setStatus] = useState<SecurityFindingStatus>(finding.status);
  const [reason, setReason] = useState(finding.resolutionReason || "");
  const [expiresAt, setExpiresAt] = useState(finding.resolutionExpiresAt?.slice(0, 16) || "");
  useEffect(() => {
    setStatus(finding.status);
    setReason(finding.resolutionReason || "");
    setExpiresAt(finding.resolutionExpiresAt?.slice(0, 16) || "");
  }, [finding]);

  let content = (
    <div className="develop-security-detail-stack">
      <PlatformUiCard as="section" className="develop-security-callout is-danger"><ShieldAlert width={18} height={18} /><div><strong>{finding.title}</strong><span>{finding.summary || "No finding summary was recorded."}</span></div></PlatformUiCard>
      {detail.occurrences.map((occurrence) => (
        <PlatformUiCard key={occurrence.id} as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitCommitHorizontal width={18} height={18} /><div><strong>Evidence at {occurrence.commitSha.slice(0, 12) || "unknown commit"}</strong><PlatformSecondaryButton size="compact" onClick={() => onOpenRun(occurrence.runId)}>Open run</PlatformSecondaryButton></div></div>
          {occurrence.locations.length ? (
            <div className="develop-security-location-list">
              {occurrence.locations.map((location) => <SecurityJsonEvidence key={`${occurrence.id}:${JSON.stringify(location)}`} value={location} />)}
            </div>
          ) : <p className="develop-security-muted">No source locations were retained.</p>}
          <h3>Validation evidence</h3>
          <SecurityJsonEvidence value={occurrence.validation || occurrence.evidence} />
        </PlatformUiCard>
      ))}
    </div>
  );
  if (activeTab === "occurrences") content = (
    <div className="develop-security-artifact-list">
      {detail.occurrences.map((occurrence) => (
        <PlatformUiCard key={occurrence.id} as="article" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitCommitHorizontal width={18} height={18} /><div><strong>{occurrence.commitSha.slice(0, 12) || "Unknown commit"}</strong><span>{formatSecurityTimestamp(occurrence.createdAt)}</span></div></div>
          <SecurityPropertyList items={[{ label: "Run", value: <PlatformSecondaryButton size="compact" onClick={() => onOpenRun(occurrence.runId)}>{occurrence.runId}</PlatformSecondaryButton> }, { label: "Locations", value: occurrence.locations.length }]} />
          <SecurityJsonEvidence value={occurrence.provenance} empty="No scanner provenance was recorded." />
        </PlatformUiCard>
      ))}
    </div>
  );
  if (activeTab === "remediation") content = (
    <div className="develop-security-detail-stack">
      <PlatformUiCard as="section" className="develop-security-callout"><GitPullRequest width={18} height={18} /><div><strong>Approval-gated publication</strong><span>Patch generation is isolated from GitHub publication. Only a validated patch with explicit Ring 3 approval may become a draft pull request; automatic merging is not supported.</span></div></PlatformUiCard>
      {detail.remediations.length ? detail.remediations.map((remediation) => (
        <PlatformUiCard key={remediation.id} as="article" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitPullRequest width={18} height={18} /><div><strong>{remediation.status.replace(/_/g, " ")}</strong><span>{remediation.branchName || "No branch published"}</span></div></div>
          <SecurityPropertyList items={[
            { label: "Patch digest", value: <code>{remediation.patchDigest.slice(0, 24) || "—"}</code> },
            { label: "Approved", value: formatSecurityTimestamp(remediation.approvedAt) },
            { label: "Updated", value: formatSecurityTimestamp(remediation.updatedAt) },
          ]} />
          <SecurityJsonEvidence value={remediation.validation} empty="No patch validation result was recorded." />
          {remediation.pullRequestUrl ? <a className="develop-security-external-link" href={remediation.pullRequestUrl} target="_blank" rel="noreferrer">Open draft pull request <ExternalLink width={13} height={13} /></a> : null}
        </PlatformUiCard>
      )) : <p className="develop-security-muted">No remediation has been generated for this finding.</p>}
    </div>
  );
  if (activeTab === "triage") content = (
    <PlatformUiCard as="section" className="develop-security-content-card">
      <div className="develop-security-card-heading"><ShieldAlert width={18} height={18} /><div><strong>Triage decision</strong><span>Every state transition and reason is written to the audit log.</span></div></div>
      <div className="develop-security-form-grid">
        <div className="develop-security-form-field"><span>Status</span><PlatformSelector value={status} ariaLabel="Finding status" fullWidth options={["open", "accepted", "risk_accepted", "false_positive", "fixed"].map((value) => ({ value, label: value.replace(/_/g, " ") }))} onValueChange={(value) => setStatus(value as SecurityFindingStatus)} /></div>
        {status === "risk_accepted" ? <label><span>Risk acceptance expires</span><input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label> : null}
        <label className="is-wide"><span>Decision reason {status === "risk_accepted" || status === "false_positive" ? "(required)" : ""}</span><textarea rows={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record the evidence and rationale for this decision." /></label>
      </div>
      <div className="develop-security-form-actions"><PlatformPrimaryButton size="small" disabled={busy || ((status === "risk_accepted" || status === "false_positive") && !reason.trim()) || (status === "risk_accepted" && !expiresAt)} onClick={() => onTriage({ status, reason: reason.trim(), expiresAt: status === "risk_accepted" && expiresAt ? new Date(expiresAt).toISOString() : null })}><Save width={14} height={14} /> Save triage decision</PlatformPrimaryButton></div>
    </PlatformUiCard>
  );

  return (
    <SecurityResourceDetailPage<SecurityFindingTab>
      tabs={[]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      ariaLabel={`Security finding ${finding.title}`}
      sidebar={(
        <PlatformUiCard
          as="section"
          variant="sidebar"
          className="playground-project-overview-sidebar-card playground-server-detail-properties-card playground-security-agent-detail-properties-card"
        >
          <SecurityPropertyList variant="sidebar" items={[
            { label: "Severity", value: <SecuritySeverityLabel severity={finding.severity} /> },
            { label: "Status", value: <SecurityFindingStatusLabel status={finding.status} /> },
            { label: "Confidence", value: `${Math.round(finding.confidence * 100)}%` },
            { label: "CVSS", value: finding.cvss ?? "—" },
            { label: "CWE", value: finding.cwe.join(", ") || "—" },
            { label: "Occurrences", value: finding.occurrenceCount },
            { label: "First seen", value: formatSecurityTimestamp(finding.createdAt) },
            { label: "Last seen", value: formatSecurityTimestamp(finding.updatedAt) },
          ]} />
        </PlatformUiCard>
      )}
    >
      {content}
    </SecurityResourceDetailPage>
  );
}
