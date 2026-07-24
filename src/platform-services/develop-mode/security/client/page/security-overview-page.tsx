import { ChartNoAxesColumnIncreasing, Eye, Github, Play, ShieldCheck } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import {
  getPlatformPluginConnectionIdentity,
  type PlatformGitHubRepositoryBranch,
  type PlatformPluginConnectionStatus,
} from "../../../../../platform-resources/plugins/connections/index.js";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformDataTable } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSearch } from "../../../../../platform-ui/components/ui/search/index.js";
import {
  PlatformButtonSelector,
  PlatformSelector,
} from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  type PlatformHomeFeatureCard,
  PlatformHomeFeatureGrid,
} from "../../../../../platform-ui/pages/home/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import type {
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubRepository,
  SecurityOverview,
  SecurityRepository,
} from "../domain/index.js";
import { formatSecurityTimestamp } from "../domain/index.js";
import { SecurityRunStatusLabel } from "./security-presenters.js";

export type SecurityRepositoryManagementChange =
  | {
      kind: "monitor";
      repository: SecurityGitHubRepository;
      branch: string;
    }
  | {
      kind: "unmonitor";
      repository: SecurityGitHubRepository;
      securityRepositoryId: string;
    }
  | {
      kind: "update_branch";
      repository: SecurityGitHubRepository;
      securityRepositoryId: string;
      branch: string;
    };

export interface SecurityOverviewPageProps {
  overview: SecurityOverview | null;
  githubStatus: SecurityGitHubAppStatus | null;
  githubConnectionStatus?: PlatformPluginConnectionStatus | null;
  installations: readonly SecurityGitHubInstallation[];
  githubRepositories: readonly SecurityGitHubRepository[];
  controlsPortalId?: string;
  loading?: boolean;
  error?: string;
  busyId?: string;
  onRefresh: () => void;
  onBeginGitHubSetup: () => void;
  onDisconnectGitHub: () => Promise<boolean>;
  onLoadRepositoryBranches: (
    repository: SecurityGitHubRepository,
  ) => Promise<readonly PlatformGitHubRepositoryBranch[]>;
  onManageRepositories: (
    changes: readonly SecurityRepositoryManagementChange[],
  ) => Promise<boolean>;
  onOpenRepository: (repository: SecurityRepository) => void;
  onRunRepository: (repository: SecurityRepository) => void;
}

function isMissingRepositoryCollectionError(value: string): boolean {
  return /(?:\b404\b|not found)/i.test(String(value || ""));
}

export function SecurityOverviewPage({
  overview,
  githubStatus,
  githubConnectionStatus = null,
  installations,
  githubRepositories,
  controlsPortalId,
  loading = false,
  error = "",
  busyId = "",
  onRefresh,
  onBeginGitHubSetup,
  onDisconnectGitHub,
  onLoadRepositoryBranches,
  onManageRepositories,
  onOpenRepository,
  onRunRepository,
}: SecurityOverviewPageProps) {
  const [repositoryPickerOpen, setRepositoryPickerOpen] = useState(false);
  const [repositorySearch, setRepositorySearch] = useState("");
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [selectedBranches, setSelectedBranches] = useState<Record<string, string>>({});
  const [repositoryBranches, setRepositoryBranches] = useState<
    Record<string, readonly PlatformGitHubRepositoryBranch[]>
  >({});
  const [branchLoadingIds, setBranchLoadingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [openBranchSelectorId, setOpenBranchSelectorId] = useState("");
  const [repositoryManagementError, setRepositoryManagementError] = useState("");
  const [repositoryManagementSubmitting, setRepositoryManagementSubmitting] = useState(false);
  const branchRequestIds = useRef(new Set<string>());
  const [statusFilter, setStatusFilter] = useState("all");
  const rows = overview?.repositories || [];
  const filteredRows = rows.filter((row) => statusFilter === "all" || row.status === statusFilter);
  const monitoredRepositoriesById = useMemo(
    () => new Map(rows.map((repository) => [repository.id, repository])),
    [rows],
  );
  const manageableRepositories = githubRepositories.filter(
    (repository) => repository.monitored || (!repository.archived && !repository.disabled),
  );
  const normalizedRepositorySearch = repositorySearch.trim().toLocaleLowerCase();
  const visibleManageableRepositories = normalizedRepositorySearch
    ? manageableRepositories.filter((repository) =>
        repository.fullName.toLocaleLowerCase().includes(normalizedRepositorySearch),
      )
    : manageableRepositories;
  const metrics = overview?.metrics;
  const tableError = rows.length === 0 && isMissingRepositoryCollectionError(error) ? "" : error;
  const activeInstallations = installations.filter(
    (installation) => installation.status === "active",
  );
  const activeDedicatedInstallations = activeInstallations.filter(
    (installation) => !installation.githubInstallationId.startsWith("oauth:"),
  );
  const primaryInstallation = activeDedicatedInstallations[0] || null;
  const githubConnected = Boolean(githubConnectionStatus?.connected || primaryInstallation);
  const pluginIdentity = getPlatformPluginConnectionIdentity("github", githubConnectionStatus);
  const connectedAccountLabel = githubConnectionStatus?.connected
    ? pluginIdentity
    : primaryInstallation
      ? `${primaryInstallation.accountLogin}${activeDedicatedInstallations.length > 1 ? ` +${activeDedicatedInstallations.length - 1}` : ""}`
      : "";

  const getConfiguredBranch = useCallback(
    (repository: SecurityGitHubRepository) => {
      const monitored = repository.securityRepositoryId
        ? monitoredRepositoriesById.get(repository.securityRepositoryId)
        : null;
      return monitored?.defaultBranch || repository.defaultBranch || "main";
    },
    [monitoredRepositoriesById],
  );

  const openRepositoryPicker = () => {
    if (!githubConnected) {
      onBeginGitHubSetup();
      return;
    }
    setSelectedRepositoryIds(
      new Set(
        manageableRepositories
          .filter((repository) => repository.monitored)
          .map((repository) => repository.id),
      ),
    );
    setSelectedBranches(
      Object.fromEntries(
        manageableRepositories.map((repository) => [
          repository.id,
          getConfiguredBranch(repository),
        ]),
      ),
    );
    setRepositoryBranches({});
    setBranchLoadingIds(new Set());
    setOpenBranchSelectorId("");
    setRepositorySearch("");
    branchRequestIds.current.clear();
    setRepositoryManagementError("");
    setRepositoryPickerOpen(true);
  };

  const featureCards: readonly PlatformHomeFeatureCard[] = [
    {
      id: "capabilities",
      title: "Secure your repositories",
      description:
        "Security agents inspect exact commits, preserve reviewable evidence, and prepare fixes without bypassing your approval boundaries.",
      icon: ShieldCheck,
      iconTone: "blue",
      links: [
        {
          id: "scans",
          label: "Scheduled and pull request scans",
          meta: "Exact commit SHAs",
        },
        {
          id: "findings",
          label: "Evidence-backed findings",
          meta: "Append-only audit",
        },
        {
          id: "fixes",
          label: "Draft pull-request fixes",
          meta: "Approval required",
        },
      ],
    },
    githubConnected
      ? {
          id: "posture",
          title: "Security posture",
          description: `Connected to ${connectedAccountLabel}. Review live repository coverage and the findings your security agents are tracking.`,
          icon: ChartNoAxesColumnIncreasing,
          iconTone: "violet",
          links: [
            {
              id: "repositories",
              label: "Monitored repositories",
              meta: String(metrics?.repositories || 0),
            },
            {
              id: "findings",
              label: "Open findings",
              meta: String(metrics?.openFindings || 0),
            },
            {
              id: "severity",
              label: "Critical / high findings",
              meta: `${metrics?.criticalFindings || 0} / ${metrics?.highFindings || 0}`,
            },
            {
              id: "fixes",
              label: "Completed fixes",
              meta: String(metrics?.fixedFindings || 0),
            },
          ],
        }
      : {
          id: "github",
          title: "Connect GitHub",
          description:
            "Connect the platform GitHub plugin, then explicitly select which repositories security agents may inspect and monitor.",
          icon: Github,
          iconTone: "white",
          links: [
            {
              id: "connect",
              label: "Connect GitHub",
              meta: "Secure OAuth",
              onClick: onBeginGitHubSetup,
            },
            {
              id: "access",
              label: "Repository access",
              meta: "Explicit selection",
            },
            { id: "mode", label: "Default scan mode", meta: "Advisory" },
            {
              id: "publication",
              label: "Fix publication",
              meta: "Draft PR only",
            },
          ],
        },
  ];

  const loadBranchesForRepository = useCallback(
    async (repository: SecurityGitHubRepository) => {
      if (
        Object.hasOwn(repositoryBranches, repository.id) ||
        branchRequestIds.current.has(repository.id)
      ) {
        return;
      }
      branchRequestIds.current.add(repository.id);
      setBranchLoadingIds((current) => new Set(current).add(repository.id));
      try {
        const loadedBranches = await onLoadRepositoryBranches(repository);
        const branches = new Map<string, PlatformGitHubRepositoryBranch>();
        const addBranch = (branch: PlatformGitHubRepositoryBranch) => {
          const name = branch.name.trim();
          if (name && !branches.has(name)) branches.set(name, { ...branch, name });
        };
        addBranch({
          name: selectedBranches[repository.id] || getConfiguredBranch(repository),
          protected: false,
        });
        addBranch({
          name: repository.defaultBranch || "main",
          protected: false,
        });
        loadedBranches.forEach(addBranch);
        setRepositoryBranches((current) => ({
          ...current,
          [repository.id]: [...branches.values()],
        }));
        setRepositoryManagementError("");
      } catch (nextError) {
        const detail = nextError instanceof Error ? nextError.message : String(nextError || "");
        setRepositoryManagementError(
          `Branches for ${repository.fullName} could not be loaded${detail ? `: ${detail}` : "."}`,
        );
      } finally {
        branchRequestIds.current.delete(repository.id);
        setBranchLoadingIds((current) => {
          const next = new Set(current);
          next.delete(repository.id);
          return next;
        });
      }
    },
    [getConfiguredBranch, onLoadRepositoryBranches, repositoryBranches, selectedBranches],
  );

  const repositoryManagementChanges = useMemo<SecurityRepositoryManagementChange[]>(() => {
    const changes: SecurityRepositoryManagementChange[] = [];
    manageableRepositories.forEach((repository) => {
      const wasMonitored = Boolean(repository.monitored && repository.securityRepositoryId);
      const monitored = selectedRepositoryIds.has(repository.id);
      const branch = (selectedBranches[repository.id] || getConfiguredBranch(repository)).trim();
      if (monitored && !wasMonitored) {
        changes.push({ kind: "monitor", repository, branch });
        return;
      }
      if (!monitored && wasMonitored && repository.securityRepositoryId) {
        changes.push({
          kind: "unmonitor",
          repository,
          securityRepositoryId: repository.securityRepositoryId,
        });
        return;
      }
      if (
        monitored &&
        wasMonitored &&
        repository.securityRepositoryId &&
        branch !== getConfiguredBranch(repository)
      ) {
        changes.push({
          kind: "update_branch",
          repository,
          securityRepositoryId: repository.securityRepositoryId,
          branch,
        });
      }
    });
    return changes;
  }, [getConfiguredBranch, manageableRepositories, selectedBranches, selectedRepositoryIds]);

  const closeRepositoryPicker = () => {
    if (!repositoryManagementSubmitting) {
      setOpenBranchSelectorId("");
      setRepositoryPickerOpen(false);
    }
  };

  const submitRepositoryManagement = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (!repositoryManagementChanges.length || repositoryManagementSubmitting) return;
    setRepositoryManagementSubmitting(true);
    setRepositoryManagementError("");
    try {
      const saved = await onManageRepositories(repositoryManagementChanges);
      if (saved) setRepositoryPickerOpen(false);
      else setRepositoryManagementError("Repository changes could not be saved. Please try again.");
    } catch (nextError) {
      setRepositoryManagementError(
        nextError instanceof Error
          ? nextError.message
          : "Repository changes could not be saved. Please try again.",
      );
    } finally {
      setRepositoryManagementSubmitting(false);
    }
  };

  const repositoryPickerColumns = useMemo<PlatformDataTableColumn<SecurityGitHubRepository>[]>(
    () => [
      {
        id: "repository",
        header: "Repository",
        accessor: "fullName",
        sortable: true,
        width: "minmax(250px, 1.5fr)",
        cell: ({ row }) => <ResourceOverviewIdentityCell title={row.fullName} />,
      },
      {
        id: "visibility",
        header: "Access",
        accessor: (row) =>
          row.archived || row.disabled ? "unavailable" : row.private ? "private" : "public",
        width: "minmax(110px, .55fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={row.archived || row.disabled ? "red" : "gray"}>
            {row.archived
              ? "Archived"
              : row.disabled
                ? "Unavailable"
                : row.private
                  ? "Private"
                  : "Public"}
          </PlatformLabel>
        ),
      },
      {
        id: "branch",
        header: "Branch",
        accessor: (row) => selectedBranches[row.id] || getConfiguredBranch(row),
        width: "minmax(190px, .85fr)",
        cell: ({ row }) => {
          const value = selectedBranches[row.id] || getConfiguredBranch(row);
          const loadedBranches = repositoryBranches[row.id] || [];
          const branches = new Map<string, PlatformGitHubRepositoryBranch>();
          [
            { name: value, protected: false },
            { name: row.defaultBranch || "main", protected: false },
            ...loadedBranches,
          ].forEach((branch) => {
            const name = branch.name.trim();
            if (name && !branches.has(name)) branches.set(name, { ...branch, name });
          });
          return (
            <PlatformSelector
              value={value}
              options={[...branches.values()].map((branch) => ({
                value: branch.name,
                label: branch.name,
                description: branch.protected
                  ? "Protected"
                  : branch.name === row.defaultBranch
                    ? "GitHub default"
                    : undefined,
              }))}
              ariaLabel={`Branch for ${row.fullName}`}
              fullWidth
              loading={branchLoadingIds.has(row.id)}
              loadingContent="Loading branches…"
              disabled={
                row.archived || row.disabled || repositoryManagementSubmitting || Boolean(busyId)
              }
              popupMaxHeight="min(280px, calc(100vh - 32px))"
              open={openBranchSelectorId === row.id}
              onOpenChange={(open) => {
                setOpenBranchSelectorId(open ? row.id : "");
                if (open) void loadBranchesForRepository(row);
              }}
              onValueChange={(branch) => {
                setSelectedBranches((current) => ({
                  ...current,
                  [row.id]: branch,
                }));
                setRepositoryManagementError("");
              }}
            />
          );
        },
      },
    ],
    [
      branchLoadingIds,
      busyId,
      getConfiguredBranch,
      loadBranchesForRepository,
      openBranchSelectorId,
      repositoryBranches,
      repositoryManagementSubmitting,
      selectedBranches,
    ],
  );

  const columns = useMemo<PlatformDataTableColumn<SecurityRepository>[]>(
    () => [
      {
        id: "repository",
        header: "Repository",
        accessor: "fullName",
        sortable: true,
        width: "minmax(230px, 1.45fr)",
        cell: ({ row }) => <ResourceOverviewIdentityCell title={row.fullName} />,
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
            {row.findingCounts.critical ? (
              <PlatformLabel variant="red">{row.findingCounts.critical} critical</PlatformLabel>
            ) : null}
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
        cell: ({ row }) => (
          <code className="develop-security-inline-code">{row.defaultBranch}</code>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(100px, .5fr)",
        cell: ({ row }) => (
          <PlatformLabel
            variant={row.status === "active" ? "green" : row.status === "paused" ? "yellow" : "red"}
          >
            {row.status}
          </PlatformLabel>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: SecurityRepository,
  ): readonly PlatformDataTableAction<SecurityRepository>[] => [
    {
      id: "open",
      label: "Open security workspace",
      icon: Eye,
      onSelect: () => onOpenRepository(row),
    },
    {
      id: "run",
      label: "Run exact-commit scan",
      icon: Play,
      disabled: row.status !== "active" || Boolean(busyId),
      onSelect: () => onRunRepository(row),
    },
  ];

  const repositoryDialog = githubConnected ? (
    <PlatformModal
      open={repositoryPickerOpen}
      title="Manage Repos"
      as="form"
      size="large"
      scrollable
      className="develop-security-repository-modal"
      bodyClassName="develop-security-repository-modal__body"
      closeOnBackdrop={!repositoryManagementSubmitting}
      closeOnEscape={!repositoryManagementSubmitting}
      closeButtonDisabled={repositoryManagementSubmitting}
      surfaceProps={{ onSubmit: submitRepositoryManagement }}
      headerActions={
        <PlatformSearch
          className="develop-security-repository-modal__search"
          value={repositorySearch}
          placeholder="Search GitHub repositories"
          aria-label="Search GitHub repositories"
          autoFocus={false}
          disabled={repositoryManagementSubmitting}
          onChange={(event) => setRepositorySearch(event.currentTarget.value)}
        />
      }
      footer={
        <>
          <span className="develop-security-repository-modal__selection-summary">
            {selectedRepositoryIds.size} selected
          </span>
          <PlatformSecondaryButton
            size="medium"
            type="button"
            disabled={repositoryManagementSubmitting}
            onClick={closeRepositoryPicker}
          >
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={
              repositoryManagementSubmitting ||
              Boolean(busyId) ||
              repositoryManagementChanges.length === 0
            }
          >
            {repositoryManagementSubmitting ? "Saving…" : "Save changes"}
          </PlatformPrimaryButton>
        </>
      }
      onClose={closeRepositoryPicker}
    >
      {activeInstallations.length === 0 ? (
        <PlatformEmptyState
          icon={Github}
          title="Repositories unavailable"
          description="Security Agents could not load repository access from the connected GitHub account. Retry the automatic synchronization."
          primaryAction={{ label: "Refresh repositories", onClick: onRefresh }}
        />
      ) : (
        <div className="develop-security-repository-management">
          {repositoryManagementError ? (
            <PlatformUiCard
              as="div"
              className="develop-security-callout is-danger develop-security-repository-management__error"
              role="alert"
            >
              <div>
                <strong>{repositoryManagementError}</strong>
              </div>
            </PlatformUiCard>
          ) : null}
          <PlatformDataTable
            rows={visibleManageableRepositories}
            columns={repositoryPickerColumns}
            getRowId={(repository) => repository.id}
            ariaLabel="GitHub repositories available to Security Agents"
            className="develop-security-repository-management__table"
            variant="minimalistic-ui"
            surface="plain"
            sticky={false}
            pagination={false}
            rowMinHeight={54}
            selection={{
              enabled: true,
              value: selectedRepositoryIds,
              onChange: ({ selectedIds }) => {
                setSelectedRepositoryIds(new Set(selectedIds));
                setRepositoryManagementError("");
              },
              ariaLabel: (repository) =>
                `${selectedRepositoryIds.has(repository.id) ? "Deselect" : "Select"} ${repository.fullName}`,
            }}
            sorting={{ defaultValue: { id: "repository", direction: "asc" } }}
            emptyState={
              normalizedRepositorySearch ? (
                "No repositories match this search."
              ) : (
                <PlatformEmptyState
                  icon={Github}
                  title="No repositories available"
                  description="Grant the connected GitHub account access to repositories, then reopen this dialog."
                />
              )
            }
          />
        </div>
      )}
    </PlatformModal>
  ) : null;

  return (
    <>
      <ResourceOverviewPage<SecurityRepository>
        showPeriodSelector={false}
        controlsPortalId={controlsPortalId}
        className="is-develop-security"
        heroContent={
          <div className="develop-security-overview-hero">
            <PlatformPageHero
              title="Security Agents"
              description="Continuously find, audit, and remediate vulnerabilities across the GitHub repositories your organization explicitly authorizes."
              actions={
                githubConnectionStatus?.connected
                  ? []
                  : [
                      {
                        id: githubConnected ? "github-account" : "connect-github",
                        label: githubConnected ? connectedAccountLabel : "Connect GitHub",
                        icon: Github,
                        ariaLabel: githubConnected
                          ? `Manage GitHub installation for ${connectedAccountLabel}`
                          : "Connect GitHub",
                        onClick: githubConnected ? openRepositoryPicker : onBeginGitHubSetup,
                      },
                    ]
              }
              actionsContent={
                githubConnectionStatus?.connected ? (
                  <PlatformButtonSelector
                    mode="popup"
                    buttonVariant="secondary"
                    buttonSize="small"
                    label={connectedAccountLabel}
                    leading={<Github width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
                    popupAriaLabel={`GitHub account ${connectedAccountLabel}`}
                    popupAlignment="right"
                    popupRole="menu"
                    popupVariant="minimal"
                    popupWidth={180}
                    closeOnSelect
                    disabled={Boolean(busyId)}
                    className="develop-security-github-account-selector"
                  >
                    <PlatformSecondaryButton
                      type="button"
                      size="small"
                      role="menuitem"
                      className="tb-popup-row is-danger"
                      onClick={() => void onDisconnectGitHub()}
                    >
                      <span>Sign out</span>
                    </PlatformSecondaryButton>
                  </PlatformButtonSelector>
                ) : null
              }
            />
            <PlatformHomeFeatureGrid
              cards={featureCards}
              ariaLabel="Security Agents capabilities and status"
              className="develop-security-overview-features"
            />
          </div>
        }
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
          error: tableError || undefined,
          emptyState: (
            <PlatformEmptyState
              icon={ShieldCheck}
              title="No repositories linked"
              description={
                githubConnected
                  ? "Link a repository from the connected GitHub account to begin with an advisory-only security policy."
                  : "Connect GitHub, then explicitly select which repositories Security Agents may monitor."
              }
              primaryAction={{
                label: githubConnected ? "Manage Repos" : "Connect GitHub",
                icon: githubConnected ? undefined : Github,
                onClick: githubConnected ? openRepositoryPicker : onBeginGitHubSetup,
              }}
            />
          ),
          noResultsState: "No repositories match this status filter.",
          toolbar: {
            title: "Repositories",
            search: {
              placeholder: "Search repositories",
              getSearchText: (row) => row.fullName,
            },
            filters: [
              {
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
              },
            ],
            primaryAction: {
              label: "Manage Repos",
              icon: null,
              disabled: !githubConnected || loading || Boolean(busyId),
              onClick: openRepositoryPicker,
            },
          },
        }}
      />
      {repositoryDialog}
    </>
  );
}
