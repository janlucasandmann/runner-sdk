import {
  Activity,
  BookOpenCheck,
  Clock3,
  History,
  Pause,
  Play,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { type PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";
import type {
  DevelopResourceIdentity,
  DevelopResourceIdentityInput,
} from "../../../shared/client/domain/index.js";
import type {
  SecurityAuditEvent,
  SecurityFinding,
  SecurityRepositoryDetail,
  SecurityRun,
  SecurityScanPolicy,
  SecurityTeamRoleId,
  SecurityTeamRolePermissionSets,
  SecurityThreatModel,
  SecurityWorkspaceTeam,
} from "../domain/index.js";
import {
  formatSecurityAction,
  formatSecurityTimestamp,
} from "../domain/index.js";
import {
  SecurityFindingStatusLabel,
  SecurityMetricGrid,
  SecurityRunStatusLabel,
  SecuritySeverityLabel,
} from "./security-presenters.js";
import { SecurityResourceDetailPage } from "./security-detail-layout.js";
import { SecurityRepositoryAccessSettings } from "./security-repository-access-settings.js";
import { SecurityRepositorySidebar } from "./security-repository-sidebar.js";
import type { PlatformSystemAccessPrincipalId } from "../../../../../platform-resources/access-control/index.js";

export type SecurityRepositoryTab =
  "runs-findings" | "threat-model" | "policy" | "audit" | "settings";

export interface SecurityRepositoryDetailPageProps {
  detail: SecurityRepositoryDetail;
  busy?: boolean;
  viewerIdentity?: DevelopResourceIdentityInput;
  onLoadOwnerCandidates?: () => Promise<readonly unknown[]>;
  onOwnerChange?: (owner: DevelopResourceIdentity) => void | Promise<unknown>;
  onOpenRun: (run: SecurityRun) => void;
  onOpenFinding: (finding: SecurityFinding) => void;
  onSavePolicy: (policy: SecurityScanPolicy) => void;
  onSaveThreatModel: (threatModel: SecurityThreatModel) => void;
  onSaveSystemPrincipalPermissionSet: (
    principalId: PlatformSystemAccessPrincipalId,
    permissionSet: PlatformPermissionSet,
  ) => void;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamsRequiresPlan?: boolean;
  onWorkspaceTeamsRequest?: () => void;
  onAddTeamAccess: (
    team: SecurityWorkspaceTeam,
    rolePermissionSets: SecurityTeamRolePermissionSets,
  ) => void;
  onRemoveTeamAccess: (teams: readonly SecurityWorkspaceTeam[]) => void;
  onSaveTeamRolePermissionSet: (
    team: SecurityWorkspaceTeam,
    roleId: SecurityTeamRoleId,
    permissionSet: PlatformPermissionSet,
  ) => void;
  onSetStatus: (status: "active" | "paused") => void;
  onDelete: () => void;
}

const TABS = [
  { id: "runs-findings", label: "Runs & findings", icon: Activity },
  { id: "threat-model", label: "Threat model", icon: BookOpenCheck },
  { id: "policy", label: "Triggers & policy", icon: Clock3 },
  { id: "audit", label: "Audit", icon: History },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

function splitLines(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinLines(value: readonly string[]): string {
  return value.join("\n");
}

function FindingsTable({
  findings,
  onOpen,
}: {
  findings: readonly SecurityFinding[];
  onOpen: (finding: SecurityFinding) => void;
}) {
  const columns = useMemo<PlatformDataTableColumn<SecurityFinding>[]>(
    () => [
      {
        id: "finding",
        header: "Finding",
        accessor: "title",
        sortable: true,
        width: "minmax(260px, 1.6fr)",
        cell: ({ row }) => (
          <div className="develop-security-table-stack">
            <strong>{row.title}</strong>
            <span>{row.ruleId || row.fingerprint.slice(0, 12)}</span>
          </div>
        ),
      },
      {
        id: "severity",
        header: "Severity",
        accessor: "severity",
        sortable: true,
        width: "minmax(100px, .55fr)",
        cell: ({ row }) => <SecuritySeverityLabel severity={row.severity} />,
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(120px, .65fr)",
        cell: ({ row }) => <SecurityFindingStatusLabel status={row.status} />,
      },
      {
        id: "confidence",
        header: "Confidence",
        accessor: "confidence",
        sortable: true,
        width: "minmax(105px, .55fr)",
        cell: ({ row }) => `${Math.round(row.confidence * 100)}%`,
      },
      {
        id: "seen",
        header: "Last seen",
        accessor: "updatedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(150px, .75fr)",
        hideBelow: 800,
        cell: ({ row }) => formatSecurityTimestamp(row.updatedAt),
      },
    ],
    [],
  );
  return (
    <PlatformDataTable
      rows={findings}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Security findings"
      onRowActivate={onOpen}
      getRowAriaLabel={(row) => `Open ${row.title}`}
      surface="plain"
      layout="fill"
      variant="minimalistic-ui"
      toolbar={{
        title: "Findings",
        search: {
          placeholder: "Search findings",
          getSearchText: (row) =>
            `${row.title} ${row.summary} ${row.ruleId} ${row.cwe.join(" ")}`,
        },
      }}
      emptyState="No findings have been recorded for this repository."
    />
  );
}

function RunsTable({
  runs,
  onOpen,
}: {
  runs: readonly SecurityRun[];
  onOpen: (run: SecurityRun) => void;
}) {
  const columns = useMemo<PlatformDataTableColumn<SecurityRun>[]>(
    () => [
      {
        id: "run",
        header: "Run",
        accessor: "id",
        width: "minmax(190px, 1fr)",
        cell: ({ row }) => (
          <div className="develop-security-table-stack">
            <strong>{row.triggerType.replace(/_/g, " ")}</strong>
            <code>{row.headSha?.slice(0, 12) || "SHA pending"}</code>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(125px, .65fr)",
        cell: ({ row }) => <SecurityRunStatusLabel status={row.status} />,
      },
      {
        id: "stage",
        header: "Stage",
        accessor: "stage",
        sortable: true,
        width: "minmax(105px, .55fr)",
        cell: ({ row }) => row.stage,
      },
      {
        id: "findings",
        header: "Findings",
        accessor: "findingCount",
        sortable: true,
        width: "minmax(90px, .45fr)",
      },
      {
        id: "queued",
        header: "Queued",
        accessor: "queuedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(155px, .8fr)",
        cell: ({ row }) => formatSecurityTimestamp(row.queuedAt),
      },
    ],
    [],
  );
  return (
    <PlatformDataTable
      rows={runs}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Security runs"
      onRowActivate={onOpen}
      getRowAriaLabel={(row) => `Open run ${row.id}`}
      surface="plain"
      layout="fill"
      variant="minimalistic-ui"
      sorting={{ defaultValue: { id: "queued", direction: "desc" } }}
      toolbar={{
        title: "Runs",
        search: {
          placeholder: "Search SHA, trigger, or status",
          getSearchText: (row) =>
            `${row.id} ${row.headSha || ""} ${row.triggerType} ${row.status}`,
        },
      }}
      emptyState="No security runs have been queued yet."
    />
  );
}

function RunsAndFindings({
  detail,
  onOpenRun,
  onOpenFinding,
}: {
  detail: SecurityRepositoryDetail;
  onOpenRun: (run: SecurityRun) => void;
  onOpenFinding: (finding: SecurityFinding) => void;
}) {
  const openFindings = detail.repository.findingCounts.open;
  const criticalFindings = detail.repository.findingCounts.critical;
  const highFindings = detail.repository.findingCounts.high;
  const completedFixes = detail.findings.filter(
    (finding) => finding.status === "fixed",
  ).length;
  const activeRuns = detail.runs.filter((run) =>
    ["queued", "running", "waiting_approval"].includes(run.status),
  ).length;
  const failedRuns = detail.runs.filter(
    (run) => run.status === "failed",
  ).length;

  return (
    <div className="develop-security-detail-stack develop-security-runs-findings">
      <SecurityMetricGrid
        metrics={[
          {
            label: "Open findings",
            value: openFindings,
            tone: criticalFindings ? "danger" : "",
            detail: `${criticalFindings} critical · ${highFindings} high`,
          },
          {
            label: "Critical findings",
            value: criticalFindings,
            tone: criticalFindings ? "danger" : "",
            detail: `${highFindings} high-severity findings`,
          },
          {
            label: "Completed fixes",
            value: completedFixes,
            tone: completedFixes ? "success" : "",
            detail: "Resolved retained findings",
          },
          {
            label: "Security runs",
            value: detail.runs.length,
            detail: `${activeRuns} active · ${failedRuns} failed`,
          },
        ]}
      />
      <RunsTable runs={detail.runs} onOpen={onOpenRun} />
      <FindingsTable findings={detail.findings} onOpen={onOpenFinding} />
    </div>
  );
}

function AuditTable({ events }: { events: readonly SecurityAuditEvent[] }) {
  const columns = useMemo<PlatformDataTableColumn<SecurityAuditEvent>[]>(
    () => [
      {
        id: "event",
        header: "Event",
        accessor: "action",
        sortable: true,
        width: "minmax(240px, 1.4fr)",
        cell: ({ row }) => (
          <div className="develop-security-table-stack">
            <strong>{formatSecurityAction(row.action)}</strong>
            <code>{row.eventHash.slice(0, 16)}</code>
          </div>
        ),
      },
      {
        id: "actor",
        header: "Actor",
        accessor: "actorType",
        sortable: true,
        width: "minmax(140px, .7fr)",
        cell: ({ row }) => (
          <div className="develop-security-table-stack">
            <span>{row.actorType}</span>
            <code>{row.actorId.slice(0, 16) || "system"}</code>
          </div>
        ),
      },
      {
        id: "target",
        header: "Target",
        accessor: "targetType",
        width: "minmax(160px, .85fr)",
        hideBelow: 780,
        cell: ({ row }) => (
          <div className="develop-security-table-stack">
            <span>{row.targetType.replace(/_/g, " ")}</span>
            <code>{row.targetId.slice(0, 16)}</code>
          </div>
        ),
      },
      {
        id: "created",
        header: "Recorded",
        accessor: "createdAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(165px, .85fr)",
        cell: ({ row }) => formatSecurityTimestamp(row.createdAt),
      },
    ],
    [],
  );
  return (
    <PlatformDataTable
      rows={events}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Security audit events"
      surface="plain"
      layout="fill"
      variant="minimalistic-ui"
      sorting={{ defaultValue: { id: "created", direction: "desc" } }}
      toolbar={{
        title: "Append-only audit log",
        search: {
          placeholder: "Search audit events",
          getSearchText: (row) =>
            `${row.action} ${row.actorType} ${row.actorId} ${row.targetType} ${row.targetId}`,
        },
      }}
      emptyState="No audit events have been recorded."
    />
  );
}

function PolicyEditor({
  value,
  busy,
  onSave,
}: {
  value: SecurityScanPolicy;
  busy: boolean;
  onSave: (value: SecurityScanPolicy) => void;
}) {
  const draft = value;
  return (
    <PlatformSettingsSectionList>
      <PlatformSettingsSection
        title="Trigger policy"
        description="GitHub events and schedules only enqueue a scan after the event is authenticated and matched to this versioned policy."
        icon={<Clock3 width={18} height={18} />}
      >
        <div className="develop-security-form-grid">
          <label>
            <span>Default branch</span>
            <input
              value={draft.defaultBranch}
              disabled={busy}
              onChange={(event) =>
                onSave({ ...draft, defaultBranch: event.target.value })
              }
            />
          </label>
          <div className="develop-security-form-field">
            <span>Scan mode</span>
            <PlatformSelector
              value={draft.scanMode}
              ariaLabel="Scan mode"
              fullWidth
              disabled={busy}
              options={[
                { value: "incremental", label: "Incremental" },
                { value: "full", label: "Full repository" },
              ]}
              onValueChange={(value) =>
                onSave({
                  ...draft,
                  scanMode: value as SecurityScanPolicy["scanMode"],
                })
              }
            />
          </div>
          <div className="develop-security-form-field is-checkbox">
            <PlatformCheckbox
              aria-label="Scan pull requests"
              checked={draft.pullRequests.enabled}
              disabled={busy}
              onClick={() =>
                onSave({
                  ...draft,
                  pullRequests: {
                    ...draft.pullRequests,
                    enabled: !draft.pullRequests.enabled,
                  },
                })
              }
            />
            <span>Scan pull requests</span>
          </div>
          <div className="develop-security-form-field is-checkbox">
            <PlatformCheckbox
              aria-label="Scan branch pushes"
              checked={draft.push.enabled}
              disabled={busy}
              onClick={() =>
                onSave({
                  ...draft,
                  push: { ...draft.push, enabled: !draft.push.enabled },
                })
              }
            />
            <span>Scan branch pushes</span>
          </div>
          <div className="develop-security-form-field is-checkbox">
            <PlatformCheckbox
              aria-label="Enable scheduled scans"
              checked={draft.schedule.enabled}
              disabled={busy}
              onClick={() =>
                onSave({
                  ...draft,
                  schedule: {
                    ...draft.schedule,
                    enabled: !draft.schedule.enabled,
                  },
                })
              }
            />
            <span>Enable scheduled scans</span>
          </div>
          <label>
            <span>Schedule (cron)</span>
            <input
              value={draft.schedule.cron}
              disabled={busy || !draft.schedule.enabled}
              onChange={(event) =>
                onSave({
                  ...draft,
                  schedule: { ...draft.schedule, cron: event.target.value },
                })
              }
            />
          </label>
          <label>
            <span>Schedule timezone</span>
            <input
              value={draft.schedule.timezone}
              disabled={busy || !draft.schedule.enabled}
              onChange={(event) =>
                onSave({
                  ...draft,
                  schedule: { ...draft.schedule, timezone: event.target.value },
                })
              }
            />
          </label>
          <label className="is-wide">
            <span>Scanners (one per line)</span>
            <textarea
              rows={4}
              value={joinLines(draft.scanners)}
              disabled={busy}
              onChange={(event) =>
                onSave({ ...draft, scanners: splitLines(event.target.value) })
              }
            />
          </label>
          <div className="develop-security-form-field">
            <span>Remediation mode</span>
            <PlatformSelector
              value={draft.remediation.mode}
              ariaLabel="Remediation mode"
              fullWidth
              disabled={busy}
              options={[
                { value: "disabled", label: "Disabled" },
                { value: "approval_required", label: "Approval required" },
              ]}
              onValueChange={(value) =>
                onSave({
                  ...draft,
                  remediation: {
                    ...draft.remediation,
                    mode: value as SecurityScanPolicy["remediation"]["mode"],
                  },
                })
              }
            />
          </div>
          <div className="develop-security-form-field">
            <span>Minimum fix severity</span>
            <PlatformSelector
              value={draft.remediation.minimumSeverity}
              ariaLabel="Minimum fix severity"
              fullWidth
              disabled={busy}
              options={[
                "critical",
                "high",
                "medium",
                "low",
                "informational",
              ].map((severity) => ({
                value: severity,
                label: severity,
              }))}
              onValueChange={(value) =>
                onSave({
                  ...draft,
                  remediation: {
                    ...draft.remediation,
                    minimumSeverity:
                      value as SecurityScanPolicy["remediation"]["minimumSeverity"],
                  },
                })
              }
            />
          </div>
        </div>
        <PlatformUiCard as="section" className="develop-security-callout">
          <ShieldCheck width={18} height={18} />
          <div>
            <strong>Non-overridable publication guardrails</strong>
            <span>
              Fixes remain draft pull requests, workflow-file changes are
              blocked, and no policy can authorize automatic merging.
            </span>
          </div>
        </PlatformUiCard>
      </PlatformSettingsSection>
    </PlatformSettingsSectionList>
  );
}

function ThreatModelEditor({
  value,
  busy,
  onSave,
}: {
  value: SecurityThreatModel;
  busy: boolean;
  onSave: (value: SecurityThreatModel) => void;
}) {
  const draft = value;
  const listField = (
    label: string,
    key: keyof Pick<
      SecurityThreatModel,
      | "entryPoints"
      | "untrustedInputs"
      | "trustBoundaries"
      | "sensitiveDataPaths"
      | "privilegedActions"
      | "priorityAreas"
    >,
  ) => (
    <label>
      <span>{label}</span>
      <textarea
        rows={4}
        value={joinLines(draft[key])}
        disabled={busy}
        onChange={(event) =>
          onSave({ ...draft, [key]: splitLines(event.target.value) })
        }
      />
    </label>
  );
  return (
    <PlatformSettingsSection
      title="Repository threat model"
      description="Version the application context the security agent uses to prioritize exploitability and validation."
      icon={<BookOpenCheck width={18} height={18} />}
    >
      <div className="develop-security-form-grid">
        <label className="is-wide">
          <span>System summary</span>
          <textarea
            rows={5}
            value={draft.summary}
            disabled={busy}
            onChange={(event) =>
              onSave({ ...draft, summary: event.target.value })
            }
          />
        </label>
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

export function SecurityRepositoryDetailPage({
  detail,
  busy = false,
  viewerIdentity = {},
  onLoadOwnerCandidates,
  onOwnerChange,
  onOpenRun,
  onOpenFinding,
  onSavePolicy,
  onSaveThreatModel,
  onSaveSystemPrincipalPermissionSet,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamsRequiresPlan = false,
  onWorkspaceTeamsRequest,
  onAddTeamAccess,
  onRemoveTeamAccess,
  onSaveTeamRolePermissionSet,
  onSetStatus,
  onDelete,
}: SecurityRepositoryDetailPageProps) {
  const [activeTab, setActiveTab] =
    useState<SecurityRepositoryTab>("runs-findings");
  const repository = detail.repository;
  let content = (
    <RunsAndFindings
      detail={detail}
      onOpenRun={onOpenRun}
      onOpenFinding={onOpenFinding}
    />
  );
  if (activeTab === "audit")
    content = <AuditTable events={detail.auditEvents} />;
  if (activeTab === "policy" && detail.policy)
    content = (
      <PolicyEditor
        value={detail.policy.value}
        busy={busy}
        onSave={onSavePolicy}
      />
    );
  if (activeTab === "threat-model" && detail.threatModel)
    content = (
      <ThreatModelEditor
        value={detail.threatModel.value}
        busy={busy}
        onSave={onSaveThreatModel}
      />
    );
  if (activeTab === "settings")
    content = (
      <SecurityRepositoryAccessSettings
        repository={repository}
        workspaceTeams={workspaceTeams}
        workspaceTeamsLoading={workspaceTeamsLoading}
        workspaceTeamsRequiresPlan={workspaceTeamsRequiresPlan}
        busy={busy}
        onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
        onSaveSystemPrincipalPermissionSet={onSaveSystemPrincipalPermissionSet}
        onAddTeamAccess={onAddTeamAccess}
        onRemoveTeamAccess={onRemoveTeamAccess}
        onSaveTeamRolePermissionSet={onSaveTeamRolePermissionSet}
      >
        <PlatformSettingsSectionList>
          <PlatformSettingsSection
            title="Monitoring state"
            description="Pause event and schedule intake without deleting retained security evidence."
            icon={
              repository.status === "active" ? (
                <Pause width={18} height={18} />
              ) : (
                <Play width={18} height={18} />
              )
            }
            actions={
              <PlatformSecondaryButton
                size="small"
                disabled={busy || repository.status === "disconnected"}
                onClick={() =>
                  onSetStatus(
                    repository.status === "active" ? "paused" : "active",
                  )
                }
              >
                {repository.status === "active"
                  ? "Pause monitoring"
                  : "Resume monitoring"}
              </PlatformSecondaryButton>
            }
          >
            <p className="develop-security-muted">
              Current state: <strong>{repository.status}</strong>. Suspending or
              removing the GitHub connection forces the repository into
              disconnected state.
            </p>
          </PlatformSettingsSection>
          <PlatformSettingsSection
            title="Delete security repository"
            description="Deletes policies, threat models, runs, findings, artifacts, and repository audit references. The GitHub connection is retained."
            icon={<Trash2 width={18} height={18} />}
            actions={
              <PlatformPrimaryButton
                size="small"
                className="is-destructive"
                disabled={busy}
                onClick={onDelete}
              >
                <Trash2 width={14} height={14} /> Delete
              </PlatformPrimaryButton>
            }
          >
            <p className="develop-security-muted">
              This operation cannot be undone from the platform.
            </p>
          </PlatformSettingsSection>
        </PlatformSettingsSectionList>
      </SecurityRepositoryAccessSettings>
    );

  return (
    <SecurityResourceDetailPage<SecurityRepositoryTab>
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      ariaLabel={`Security details for ${repository.fullName}`}
      sidebarAriaLabel="Repository details and safety boundaries"
      sidebarClassName="playground-ticket-detail-sidebar"
      sidebar={
        <SecurityRepositorySidebar
          detail={detail}
          busy={busy}
          viewerIdentity={viewerIdentity}
          onLoadOwnerCandidates={onLoadOwnerCandidates}
          onOwnerChange={onOwnerChange}
        />
      }
    >
      {content}
    </SecurityResourceDetailPage>
  );
}
