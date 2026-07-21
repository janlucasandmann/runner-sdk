import { Eye, GitBranch, Github, Play, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { PlatformDataTableAction, PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { ResourceOverviewIdentityCell, ResourceOverviewPage, ResourceOverviewValue } from "../../../../../platform-ui/pages/overview/index.js";
import type {
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubRepository,
  SecurityOverview,
  SecurityRepository,
} from "../domain/index.js";
import { formatSecurityTimestamp } from "../domain/index.js";
import { SecurityMetricGrid, SecurityRunStatusLabel } from "./security-presenters.js";

export interface SecurityOverviewPageProps {
  overview: SecurityOverview | null;
  githubStatus: SecurityGitHubAppStatus | null;
  installations: readonly SecurityGitHubInstallation[];
  githubRepositories: readonly SecurityGitHubRepository[];
  controlsPortalId?: string;
  loading?: boolean;
  error?: string;
  busyId?: string;
  message?: string;
  messageTone?: "success" | "danger";
  onRefresh: () => void;
  onBeginGitHubSetup: () => void;
  onSyncInstallation: (installationId: string) => void;
  onMonitorRepository: (repository: SecurityGitHubRepository) => void;
  onOpenRepository: (repository: SecurityRepository) => void;
  onRunRepository: (repository: SecurityRepository) => void;
}

export function SecurityOverviewPage({
  overview,
  githubStatus,
  installations,
  githubRepositories,
  controlsPortalId,
  loading = false,
  error = "",
  busyId = "",
  message = "",
  messageTone = "success",
  onRefresh,
  onBeginGitHubSetup,
  onSyncInstallation,
  onMonitorRepository,
  onOpenRepository,
  onRunRepository,
}: SecurityOverviewPageProps) {
  const [repositoryPickerOpen, setRepositoryPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const rows = overview?.repositories || [];
  const filteredRows = rows.filter((row) => statusFilter === "all" || row.status === statusFilter);
  const availableRepositories = githubRepositories.filter((repository) => !repository.monitored && !repository.archived && !repository.disabled);
  const metrics = overview?.metrics;
  const columns = useMemo<PlatformDataTableColumn<SecurityRepository>[]>(() => [
    {
      id: "repository",
      header: "Repository",
      accessor: "fullName",
      sortable: true,
      width: "minmax(230px, 1.45fr)",
      cell: ({ row }) => (
        <ResourceOverviewIdentityCell
          title={row.fullName}
          icon={GitBranch}
          iconClassName="is-develop-resource"
        />
      ),
    },
    {
      id: "posture",
      header: "Open findings",
      accessor: (row) => row.findingCounts.open,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(135px, .65fr)",
      cell: ({ row }) => (
        <ResourceOverviewValue>
          <strong>{row.findingCounts.open}</strong>
          {row.findingCounts.critical ? <PlatformLabel variant="red">{row.findingCounts.critical} critical</PlatformLabel> : null}
        </ResourceOverviewValue>
      ),
    },
    {
      id: "lastRun",
      header: "Last run",
      accessor: "lastRunAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(160px, .82fr)",
      cell: ({ row }) => (
        <div className="develop-security-table-stack">
          <span>{formatSecurityTimestamp(row.lastRunAt, "Never")}</span>
          {row.lastRunStatus ? <SecurityRunStatusLabel status={row.lastRunStatus} /> : null}
        </div>
      ),
    },
    {
      id: "triggers",
      header: "Default branch",
      accessor: "defaultBranch",
      width: "minmax(130px, .68fr)",
      hideBelow: 820,
      cell: ({ row }) => <code className="develop-security-inline-code">{row.defaultBranch}</code>,
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "minmax(100px, .5fr)",
      cell: ({ row }) => (
        <PlatformLabel variant={row.status === "active" ? "green" : row.status === "paused" ? "yellow" : "red"}>
          {row.status}
        </PlatformLabel>
      ),
    },
  ], []);

  const getRowActions = (row: SecurityRepository): readonly PlatformDataTableAction<SecurityRepository>[] => [
    { id: "open", label: "Open security workspace", icon: Eye, onSelect: () => onOpenRepository(row) },
    { id: "run", label: "Run exact-commit scan", icon: Play, disabled: row.status !== "active" || Boolean(busyId), onSelect: () => onRunRepository(row) },
  ];

  const setupPanel = repositoryPickerOpen ? (
    <PlatformUiCard as="section" className="develop-security-setup-panel" aria-label="GitHub repositories">
      <div className="develop-security-setup-header">
        <div>
          <span>GitHub App</span>
          <h2>Add repositories</h2>
          <p>Only repositories explicitly selected in the GitHub App installation appear here.</p>
        </div>
        <div className="develop-security-inline-actions">
          {installations.filter((installation) => installation.status === "active").map((installation) => (
            <PlatformSecondaryButton
              key={installation.id}
              size="small"
              disabled={busyId === installation.id}
              onClick={() => onSyncInstallation(installation.id)}
            >
              <RefreshCw width={14} height={14} />
              {installation.accountLogin}
            </PlatformSecondaryButton>
          ))}
          <PlatformSecondaryButton size="small" onClick={onBeginGitHubSetup} disabled={!githubStatus?.configured || Boolean(busyId)}>
            <Github width={14} height={14} /> Manage installation
          </PlatformSecondaryButton>
        </div>
      </div>
      {!githubStatus?.configured ? (
        <PlatformUiCard as="section" className="develop-security-callout is-danger">
          <Github width={18} height={18} />
          <div><strong>GitHub App unavailable</strong><span>The dedicated app credentials and webhook secret must be configured before connecting repositories.</span></div>
        </PlatformUiCard>
      ) : installations.length === 0 ? (
        <PlatformEmptyState icon={Github} title="Connect the Security GitHub App" description="Install the least-privilege GitHub App and select the repositories this organization may monitor." primaryAction={{ label: "Install GitHub App", onClick: onBeginGitHubSetup }} />
      ) : availableRepositories.length === 0 ? (
        <PlatformEmptyState icon={ShieldCheck} title="No repositories to add" description="Every available repository is already monitored, archived, or disabled. Refresh the installation after changing repository access on GitHub." />
      ) : (
        <div className="develop-security-repository-picker">
          {availableRepositories.map((repository) => (
            <PlatformUiCard as="article" key={repository.id}>
              <GitBranch width={17} height={17} strokeWidth={1.8} />
              <div><strong>{repository.fullName}</strong><span>{repository.defaultBranch} · {repository.private ? "private" : "public"}</span></div>
              <PlatformPrimaryButton size="small" onClick={() => onMonitorRepository(repository)} disabled={Boolean(busyId)}>
                {busyId === repository.id ? "Adding…" : "Monitor"}
              </PlatformPrimaryButton>
            </PlatformUiCard>
          ))}
        </div>
      )}
    </PlatformUiCard>
  ) : null;

  return (
    <ResourceOverviewPage<SecurityRepository>
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-develop-security"
      heroContent={(
        <>
          <SecurityMetricGrid metrics={[
            { label: "Monitored repositories", value: metrics?.repositories || 0, detail: `${metrics?.activeRepositories || 0} active` },
            { label: "Open findings", value: metrics?.openFindings || 0, tone: (metrics?.criticalFindings || 0) > 0 ? "danger" : "", detail: `${metrics?.criticalFindings || 0} critical · ${metrics?.highFindings || 0} high` },
            { label: "Completed fixes", value: metrics?.fixedFindings || 0, tone: "success", detail: "Audited finding resolutions" },
            { label: "Security runs", value: metrics?.totalRuns || 0, detail: `${metrics?.activeRuns || 0} active · ${metrics?.failedRuns || 0} failed` },
          ]} />
          <PlatformUiCard as="section" className="develop-security-callout">
            <ShieldCheck width={18} height={18} />
            <div><strong>Advisory mode is the safe default.</strong><span>Scans are pinned to exact commit SHAs. Repository writes remain disabled unless a validated remediation is explicitly approved for a draft pull request.</span></div>
          </PlatformUiCard>
          {message ? <PlatformUiCard as="section" className={`develop-security-callout is-${messageTone}`} role={messageTone === "danger" ? "alert" : "status"}><div><strong>{message}</strong></div></PlatformUiCard> : null}
          {setupPanel}
        </>
      )}
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Monitored security repositories",
        className: "resource-overview-table is-develop-security",
        sorting: { defaultValue: { id: "lastRun", direction: "desc" } },
        onRowActivate: onOpenRepository,
        getRowActions,
        getRowAriaLabel: (row) => `Open security workspace for ${row.fullName}`,
        loading,
        error: error || undefined,
        emptyState: <PlatformEmptyState icon={ShieldCheck} title="No repositories monitored" description="Connect the Security GitHub App, select a repository, and start with the generated advisory-only policy." />,
        noResultsState: "No repositories match this status filter.",
        toolbar: {
          title: "Repositories",
          search: { placeholder: "Search repositories", getSearchText: (row) => row.fullName },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All repositories" },
              { id: "active", label: "Active" },
              { id: "paused", label: "Paused" },
              { id: "disconnected", label: "Disconnected" },
            ],
          }],
          primaryAction: {
            label: repositoryPickerOpen ? "Close repository picker" : rows.length ? "Add repository" : "Connect repository",
            icon: repositoryPickerOpen ? Github : Plus,
            onClick: () => setRepositoryPickerOpen((current) => !current),
          },
          trailing: (
            <PlatformIconButton size="medium" onClick={onRefresh} disabled={loading} aria-label="Refresh security overview">
              <RefreshCw width={15} height={15} />
            </PlatformIconButton>
          ),
        },
      }}
    />
  );
}
