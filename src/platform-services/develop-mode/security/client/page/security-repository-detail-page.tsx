import {
  Activity,
  BookOpenCheck,
  Clock3,
  FileSearch,
  GitPullRequest,
  History,
  KeyRound,
  ListChecks,
  Pause,
  Play,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlatformDataTable, type PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformSettingsSection, PlatformSettingsSectionList } from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import { ResourceOverviewIdentityCell } from "../../../../../platform-ui/pages/overview/index.js";
import {
  PlatformPermissionsPage,
  createPlatformDefaultPermissionSet,
  normalizePlatformPermissionSet,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
  type PlatformPermissionSet,
} from "../../../../../platform-ui/pages/permissions/index.js";
import type {
  SecurityAuditEvent,
  SecurityFinding,
  SecurityRepositoryDetail,
  SecurityRun,
  SecurityScanPolicy,
  SecurityThreatModel,
} from "../domain/index.js";
import { formatSecurityAction, formatSecurityTimestamp } from "../domain/index.js";
import {
  getDevelopResourceCreatorIdentity,
  getDevelopResourceOwnerIdentity,
} from "../../../shared/client/domain/index.js";
import {
  SecurityBackHeader,
  SecurityFindingStatusLabel,
  SecurityMetricGrid,
  SecurityPropertyList,
  SecurityRunStatusLabel,
  SecuritySeverityLabel,
} from "./security-presenters.js";

export type SecurityRepositoryTab = "overview" | "findings" | "runs" | "threat-model" | "policy" | "audit" | "permissions" | "settings";

export interface SecurityRepositoryDetailPageProps {
  detail: SecurityRepositoryDetail;
  loading?: boolean;
  busy?: boolean;
  message?: string;
  onBack: () => void;
  onRefresh: () => void;
  onRun: () => void;
  onOpenRun: (run: SecurityRun) => void;
  onOpenFinding: (finding: SecurityFinding) => void;
  onSavePolicy: (policy: SecurityScanPolicy) => void;
  onSaveThreatModel: (threatModel: SecurityThreatModel) => void;
  onSavePermissionSet: (permissionSet: PlatformPermissionSet) => void;
  onSetStatus: (status: "active" | "paused") => void;
  onDelete: () => void;
}

const TABS = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "findings", label: "Findings", icon: ShieldAlert },
  { id: "runs", label: "Runs", icon: Activity },
  { id: "threat-model", label: "Threat model", icon: BookOpenCheck },
  { id: "policy", label: "Triggers & policy", icon: Clock3 },
  { id: "audit", label: "Audit", icon: History },
  { id: "permissions", label: "Permissions", icon: KeyRound },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

function splitLines(value: string): string[] {
  return value.split(/\n|,/).map((part) => part.trim()).filter(Boolean);
}

function joinLines(value: readonly string[]): string {
  return value.join("\n");
}

function RepositoryOverview({ detail }: { detail: SecurityRepositoryDetail }) {
  const repository = detail.repository;
  const activeRuns = detail.runs.filter((run) => ["queued", "running", "waiting_approval"].includes(run.status)).length;
  const fixedFindings = detail.findings.filter((finding) => finding.status === "fixed").length;
  return (
    <div className="develop-security-detail-stack">
      <SecurityMetricGrid metrics={[
        { label: "Open findings", value: repository.findingCounts.open, tone: repository.findingCounts.critical ? "danger" : "", detail: `${repository.findingCounts.critical} critical · ${repository.findingCounts.high} high` },
        { label: "Security runs", value: detail.runs.length, detail: `${activeRuns} currently active` },
        { label: "Fixed findings", value: fixedFindings, tone: "success", detail: "Across retained history" },
        { label: "Policy version", value: detail.policy ? `v${detail.policy.version}` : "—", detail: detail.policy?.changeSummary || "No active policy" },
      ]} />
      <PlatformUiCard as="section" className="develop-security-callout">
        <ShieldCheck width={18} height={18} />
        <div>
          <strong>Exact-commit, evidence-first analysis</strong>
          <span>Each run records its Git SHA, policy version, threat-model version, scanner provenance, findings, and audit trail. Repository publication remains separately permissioned.</span>
        </div>
      </PlatformUiCard>
      <div className="develop-security-card-grid">
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><FileSearch width={18} height={18} /><div><strong>Analysis coverage</strong><span>Configured scanners</span></div></div>
          <div className="develop-security-chip-list">
            {(detail.policy?.value.scanners || []).map((scanner) => <PlatformLabel key={scanner} variant="blue">{scanner}</PlatformLabel>)}
          </div>
        </PlatformUiCard>
        <PlatformUiCard as="section" className="develop-security-content-card">
          <div className="develop-security-card-heading"><GitPullRequest width={18} height={18} /><div><strong>Remediation policy</strong><span>Publication boundary</span></div></div>
          <p>{detail.policy?.value.remediation.mode === "approval_required" ? "Validated fixes require explicit approval and can only open draft pull requests." : "Automatic remediation and GitHub writes are disabled."}</p>
        </PlatformUiCard>
      </div>
    </div>
  );
}

function FindingsTable({ findings, onOpen }: { findings: readonly SecurityFinding[]; onOpen: (finding: SecurityFinding) => void }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityFinding>[]>(() => [
    { id: "finding", header: "Finding", accessor: "title", sortable: true, width: "minmax(260px, 1.6fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{row.title}</strong><span>{row.ruleId || row.fingerprint.slice(0, 12)}</span></div> },
    { id: "severity", header: "Severity", accessor: "severity", sortable: true, width: "minmax(100px, .55fr)", cell: ({ row }) => <SecuritySeverityLabel severity={row.severity} /> },
    { id: "status", header: "Status", accessor: "status", sortable: true, width: "minmax(120px, .65fr)", cell: ({ row }) => <SecurityFindingStatusLabel status={row.status} /> },
    { id: "confidence", header: "Confidence", accessor: "confidence", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => `${Math.round(row.confidence * 100)}%` },
    { id: "seen", header: "Last seen", accessor: "updatedAt", sortable: true, sortDescFirst: true, width: "minmax(150px, .75fr)", hideBelow: 800, cell: ({ row }) => formatSecurityTimestamp(row.updatedAt) },
  ], []);
  return <PlatformDataTable rows={findings} columns={columns} getRowId={(row) => row.id} ariaLabel="Security findings" onRowActivate={onOpen} getRowAriaLabel={(row) => `Open ${row.title}`} surface="plain" layout="fill" variant="minimalistic-ui" toolbar={{ title: "Findings", search: { placeholder: "Search findings", getSearchText: (row) => `${row.title} ${row.summary} ${row.ruleId} ${row.cwe.join(" ")}` } }} emptyState="No findings have been recorded for this repository." />;
}

function RunsTable({ runs, onOpen }: { runs: readonly SecurityRun[]; onOpen: (run: SecurityRun) => void }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityRun>[]>(() => [
    { id: "run", header: "Run", accessor: "id", width: "minmax(190px, 1fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{row.triggerType.replace(/_/g, " ")}</strong><code>{row.headSha?.slice(0, 12) || "SHA pending"}</code></div> },
    { id: "status", header: "Status", accessor: "status", sortable: true, width: "minmax(125px, .65fr)", cell: ({ row }) => <SecurityRunStatusLabel status={row.status} /> },
    { id: "stage", header: "Stage", accessor: "stage", sortable: true, width: "minmax(105px, .55fr)", cell: ({ row }) => row.stage },
    { id: "findings", header: "Findings", accessor: "findingCount", sortable: true, width: "minmax(90px, .45fr)" },
    { id: "queued", header: "Queued", accessor: "queuedAt", sortable: true, sortDescFirst: true, width: "minmax(155px, .8fr)", cell: ({ row }) => formatSecurityTimestamp(row.queuedAt) },
  ], []);
  return <PlatformDataTable rows={runs} columns={columns} getRowId={(row) => row.id} ariaLabel="Security runs" onRowActivate={onOpen} getRowAriaLabel={(row) => `Open run ${row.id}`} surface="plain" layout="fill" variant="minimalistic-ui" sorting={{ defaultValue: { id: "queued", direction: "desc" } }} toolbar={{ title: "Runs", search: { placeholder: "Search SHA, trigger, or status", getSearchText: (row) => `${row.id} ${row.headSha || ""} ${row.triggerType} ${row.status}` } }} emptyState="No security runs have been queued yet." />;
}

function AuditTable({ events }: { events: readonly SecurityAuditEvent[] }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityAuditEvent>[]>(() => [
    { id: "event", header: "Event", accessor: "action", sortable: true, width: "minmax(240px, 1.4fr)", cell: ({ row }) => <div className="develop-security-table-stack"><strong>{formatSecurityAction(row.action)}</strong><code>{row.eventHash.slice(0, 16)}</code></div> },
    { id: "actor", header: "Actor", accessor: "actorType", sortable: true, width: "minmax(140px, .7fr)", cell: ({ row }) => <div className="develop-security-table-stack"><span>{row.actorType}</span><code>{row.actorId.slice(0, 16) || "system"}</code></div> },
    { id: "target", header: "Target", accessor: "targetType", width: "minmax(160px, .85fr)", hideBelow: 780, cell: ({ row }) => <div className="develop-security-table-stack"><span>{row.targetType.replace(/_/g, " ")}</span><code>{row.targetId.slice(0, 16)}</code></div> },
    { id: "created", header: "Recorded", accessor: "createdAt", sortable: true, sortDescFirst: true, width: "minmax(165px, .85fr)", cell: ({ row }) => formatSecurityTimestamp(row.createdAt) },
  ], []);
  return <PlatformDataTable rows={events} columns={columns} getRowId={(row) => row.id} ariaLabel="Security audit events" surface="plain" layout="fill" variant="minimalistic-ui" sorting={{ defaultValue: { id: "created", direction: "desc" } }} toolbar={{ title: "Append-only audit log", search: { placeholder: "Search audit events", getSearchText: (row) => `${row.action} ${row.actorType} ${row.actorId} ${row.targetType} ${row.targetId}` } }} emptyState="No audit events have been recorded." />;
}

function PolicyEditor({ value, busy, onSave }: { value: SecurityScanPolicy; busy: boolean; onSave: (value: SecurityScanPolicy) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <PlatformSettingsSectionList>
      <PlatformSettingsSection title="Trigger policy" description="GitHub events and schedules only enqueue a scan after the event is authenticated and matched to this versioned policy." icon={<Clock3 width={18} height={18} />} actions={<PlatformPrimaryButton size="small" disabled={busy} onClick={() => onSave(draft)}><Save width={14} height={14} /> Save policy</PlatformPrimaryButton>}>
        <div className="develop-security-form-grid">
          <label><span>Default branch</span><input value={draft.defaultBranch} onChange={(event) => setDraft({ ...draft, defaultBranch: event.target.value })} /></label>
          <div className="develop-security-form-field"><span>Scan mode</span><PlatformSelector value={draft.scanMode} ariaLabel="Scan mode" fullWidth options={[{ value: "incremental", label: "Incremental" }, { value: "full", label: "Full repository" }]} onValueChange={(value) => setDraft({ ...draft, scanMode: value as SecurityScanPolicy["scanMode"] })} /></div>
          <div className="develop-security-form-field is-checkbox"><PlatformCheckbox aria-label="Scan pull requests" checked={draft.pullRequests.enabled} onClick={() => setDraft({ ...draft, pullRequests: { ...draft.pullRequests, enabled: !draft.pullRequests.enabled } })} /><span>Scan pull requests</span></div>
          <div className="develop-security-form-field is-checkbox"><PlatformCheckbox aria-label="Scan branch pushes" checked={draft.push.enabled} onClick={() => setDraft({ ...draft, push: { ...draft.push, enabled: !draft.push.enabled } })} /><span>Scan branch pushes</span></div>
          <div className="develop-security-form-field is-checkbox"><PlatformCheckbox aria-label="Enable scheduled scans" checked={draft.schedule.enabled} onClick={() => setDraft({ ...draft, schedule: { ...draft.schedule, enabled: !draft.schedule.enabled } })} /><span>Enable scheduled scans</span></div>
          <label><span>Schedule (cron)</span><input value={draft.schedule.cron} disabled={!draft.schedule.enabled} onChange={(event) => setDraft({ ...draft, schedule: { ...draft.schedule, cron: event.target.value } })} /></label>
          <label><span>Schedule timezone</span><input value={draft.schedule.timezone} disabled={!draft.schedule.enabled} onChange={(event) => setDraft({ ...draft, schedule: { ...draft.schedule, timezone: event.target.value } })} /></label>
          <label className="is-wide"><span>Scanners (one per line)</span><textarea rows={4} value={joinLines(draft.scanners)} onChange={(event) => setDraft({ ...draft, scanners: splitLines(event.target.value) })} /></label>
          <div className="develop-security-form-field"><span>Remediation mode</span><PlatformSelector value={draft.remediation.mode} ariaLabel="Remediation mode" fullWidth options={[{ value: "disabled", label: "Disabled" }, { value: "approval_required", label: "Approval required" }]} onValueChange={(value) => setDraft({ ...draft, remediation: { ...draft.remediation, mode: value as SecurityScanPolicy["remediation"]["mode"] } })} /></div>
          <div className="develop-security-form-field"><span>Minimum fix severity</span><PlatformSelector value={draft.remediation.minimumSeverity} ariaLabel="Minimum fix severity" fullWidth options={["critical", "high", "medium", "low", "informational"].map((severity) => ({ value: severity, label: severity }))} onValueChange={(value) => setDraft({ ...draft, remediation: { ...draft.remediation, minimumSeverity: value as SecurityScanPolicy["remediation"]["minimumSeverity"] } })} /></div>
        </div>
        <PlatformUiCard as="section" className="develop-security-callout"><ShieldCheck width={18} height={18} /><div><strong>Non-overridable publication guardrails</strong><span>Fixes remain draft pull requests, workflow-file changes are blocked, and no policy can authorize automatic merging.</span></div></PlatformUiCard>
      </PlatformSettingsSection>
    </PlatformSettingsSectionList>
  );
}

function ThreatModelEditor({ value, busy, onSave }: { value: SecurityThreatModel; busy: boolean; onSave: (value: SecurityThreatModel) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const listField = (label: string, key: keyof Pick<SecurityThreatModel, "entryPoints" | "untrustedInputs" | "trustBoundaries" | "sensitiveDataPaths" | "privilegedActions" | "priorityAreas">) => (
    <label><span>{label}</span><textarea rows={4} value={joinLines(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: splitLines(event.target.value) })} /></label>
  );
  return (
    <PlatformSettingsSection title="Repository threat model" description="Version the application context the security agent uses to prioritize exploitability and validation." icon={<BookOpenCheck width={18} height={18} />} actions={<PlatformPrimaryButton size="small" disabled={busy} onClick={() => onSave(draft)}><Save width={14} height={14} /> Save threat model</PlatformPrimaryButton>}>
      <div className="develop-security-form-grid">
        <label className="is-wide"><span>System summary</span><textarea rows={5} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
        {listField("Entry points", "entryPoints")}
        {listField("Untrusted inputs", "untrustedInputs")}
        {listField("Trust boundaries", "trustBoundaries")}
        {listField("Sensitive data paths", "sensitiveDataPaths")}
        {listField("Privileged actions", "privilegedActions")}
        {listField("Priority areas", "priorityAreas")}
      </div>
    </PlatformSettingsSection>
  );
}

function PermissionsEditor({ value, busy, onSave }: { value: PlatformPermissionSet | null; busy: boolean; onSave: (value: PlatformPermissionSet) => void }) {
  const [draft, setDraft] = useState(() => normalizePlatformPermissionSet(value || createPlatformDefaultPermissionSet("security_repository"), "security_repository"));
  useEffect(() => setDraft(normalizePlatformPermissionSet(value || createPlatformDefaultPermissionSet("security_repository"), "security_repository")), [value]);
  return (
    <PlatformSettingsSection title="Repository security permissions" description="Use the shared three-ring model to separate posture visibility, security operations, and externally visible or irreversible decisions." icon={<KeyRound width={18} height={18} />} actions={<PlatformPrimaryButton size="small" disabled={busy} onClick={() => onSave(draft)}><Save width={14} height={14} /> Save permissions</PlatformPrimaryButton>} bodyPresentation="flush">
      <PlatformPermissionsPage
        permissionSet={draft}
        subjectType="security_repository"
        onRingAccessChange={(ringId, access) => setDraft((current) => updatePlatformPermissionRingAccess(current, ringId, access, "security_repository"))}
        onActionRingChange={(actionId, ringId) => setDraft((current) => updatePlatformPermissionActionRing(current, actionId, ringId, "security_repository"))}
        onActionAccessChange={(actionId, access) => setDraft((current) => updatePlatformPermissionActionAccess(current, actionId, access, "security_repository"))}
      />
    </PlatformSettingsSection>
  );
}

export function SecurityRepositoryDetailPage({
  detail,
  loading = false,
  busy = false,
  message = "",
  onBack,
  onRefresh,
  onRun,
  onOpenRun,
  onOpenFinding,
  onSavePolicy,
  onSaveThreatModel,
  onSavePermissionSet,
  onSetStatus,
  onDelete,
}: SecurityRepositoryDetailPageProps) {
  const [activeTab, setActiveTab] = useState<SecurityRepositoryTab>("overview");
  const repository = detail.repository;
  const creator = getDevelopResourceCreatorIdentity(repository);
  const owner = getDevelopResourceOwnerIdentity(repository);
  let content = <RepositoryOverview detail={detail} />;
  if (activeTab === "findings") content = <FindingsTable findings={detail.findings} onOpen={onOpenFinding} />;
  if (activeTab === "runs") content = <RunsTable runs={detail.runs} onOpen={onOpenRun} />;
  if (activeTab === "audit") content = <AuditTable events={detail.auditEvents} />;
  if (activeTab === "policy" && detail.policy) content = <PolicyEditor value={detail.policy.value} busy={busy} onSave={onSavePolicy} />;
  if (activeTab === "threat-model" && detail.threatModel) content = <ThreatModelEditor value={detail.threatModel.value} busy={busy} onSave={onSaveThreatModel} />;
  if (activeTab === "permissions") content = <PermissionsEditor value={repository.permissionSet} busy={busy} onSave={onSavePermissionSet} />;
  if (activeTab === "settings") content = (
    <PlatformSettingsSectionList>
      <PlatformSettingsSection title="Monitoring state" description="Pause event and schedule intake without deleting retained security evidence." icon={repository.status === "active" ? <Pause width={18} height={18} /> : <Play width={18} height={18} />} actions={<PlatformSecondaryButton size="small" disabled={busy || repository.status === "disconnected"} onClick={() => onSetStatus(repository.status === "active" ? "paused" : "active")}>{repository.status === "active" ? "Pause monitoring" : "Resume monitoring"}</PlatformSecondaryButton>}><p className="develop-security-muted">Current state: <strong>{repository.status}</strong>. GitHub App suspension or removal forces the repository into disconnected state.</p></PlatformSettingsSection>
      <PlatformSettingsSection title="Delete security repository" description="Deletes policies, threat models, runs, findings, artifacts, and repository audit references. The GitHub App installation is retained." icon={<Trash2 width={18} height={18} />} actions={<PlatformPrimaryButton size="small" className="is-destructive" disabled={busy} onClick={onDelete}><Trash2 width={14} height={14} /> Delete</PlatformPrimaryButton>}><p className="develop-security-muted">This operation cannot be undone from the platform.</p></PlatformSettingsSection>
    </PlatformSettingsSectionList>
  );

  return (
    <ResourceDetailPage<SecurityRepositoryTab>
      header={<SecurityBackHeader eyebrow="Repository security" title={repository.fullName} description={`Monitoring ${repository.defaultBranch} through the dedicated GitHub App`} onBack={onBack} />}
      headerActions={<div className="develop-security-inline-actions"><PlatformSecondaryButton size="small" onClick={onRefresh} disabled={loading || busy}>Refresh</PlatformSecondaryButton><PlatformPrimaryButton size="small" onClick={onRun} disabled={busy || repository.status !== "active"}><Play width={14} height={14} /> Run scan</PlatformPrimaryButton></div>}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      ariaLabel={`Security details for ${repository.fullName}`}
      className="develop-security-resource-detail"
      contentClassName="develop-security-detail-content"
      sidebarClassName="develop-security-detail-sidebar"
      sidebar={(
        <>
          <PlatformUiCard as="section" variant="sidebar" cardTitle="Properties">
            <SecurityPropertyList items={[
              { label: "Status", value: <PlatformLabel variant={repository.status === "active" ? "green" : repository.status === "paused" ? "yellow" : "red"}>{repository.status}</PlatformLabel> },
              { label: "Creator", value: <ResourceOverviewIdentityCell title={creator.name || creator.email || "Unknown"} imageUrl={creator.avatarUrl} fallback={(creator.name || creator.email || "?").slice(0, 1).toUpperCase()} size="compact" /> },
              { label: "Owner", value: <ResourceOverviewIdentityCell title={owner.name || owner.email || "Unknown"} imageUrl={owner.avatarUrl} fallback={(owner.name || owner.email || "?").slice(0, 1).toUpperCase()} size="compact" /> },
              { label: "Visibility", value: repository.private ? "Private" : "Public" },
              { label: "Default branch", value: <code>{repository.defaultBranch}</code> },
              { label: "Last scan", value: formatSecurityTimestamp(repository.lastRunAt, "Never") },
              { label: "Next scheduled scan", value: formatSecurityTimestamp(repository.nextScanAt, "Disabled") },
              { label: "Policy", value: detail.policy ? `Version ${detail.policy.version}` : "Missing" },
              { label: "Threat model", value: detail.threatModel ? `Version ${detail.threatModel.version}` : "Missing" },
            ]} />
          </PlatformUiCard>
          <PlatformUiCard as="section" variant="sidebar" cardTitle="Safety boundary">
            <div className="develop-security-sidebar-copy"><ListChecks width={16} height={16} /><span>Exact SHA checkout</span></div>
            <div className="develop-security-sidebar-copy"><ShieldCheck width={16} height={16} /><span>Disposable worker boundary</span></div>
            <div className="develop-security-sidebar-copy"><GitPullRequest width={16} height={16} /><span>Draft PR after approval</span></div>
          </PlatformUiCard>
        </>
      )}
    >
      {message ? <PlatformUiCard as="section" className="develop-security-callout is-success" role="status"><div><strong>{message}</strong></div></PlatformUiCard> : null}
      {content}
    </ResourceDetailPage>
  );
}
