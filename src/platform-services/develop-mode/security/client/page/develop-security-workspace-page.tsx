import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  beginPlatformPluginConnection,
  disconnectPlatformPluginConnection,
  fetchPlatformGitHubRepositoryBranches,
  fetchPlatformPluginConnectionStatus,
  writeCachedPlatformPluginConnectionStatus,
  writePlatformPluginConnectionRedirectState,
  type PlatformPluginConnectionStatus,
} from "../../../../../platform-resources/plugins/connections/index.js";
import {
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  buildPlatformSystemPrincipalPermissionMetadata,
  type PlatformSystemAccessPrincipalId,
} from "../../../../../platform-resources/access-control/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import type { PlatformVersionNavigationGuardRegistrar } from "../../../../../platform-ui/components/composite/versioning/index.js";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import {
  createPlatformDefaultPermissionSet,
  type PlatformPermissionSet,
} from "../../../../../platform-ui/pages/permissions/index.js";
import type {
  DevelopResourceIdentity,
  DevelopResourceIdentityInput,
} from "../../../shared/client/domain/index.js";
import { useSecurityServiceRepository } from "../api/index.js";
import type {
  SecurityFindingDetail,
  SecurityFindingStatus,
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubRepository,
  SecurityOverview,
  SecurityRepositoryDetail,
  SecurityRunDetail,
  SecurityTeamRoleId,
  SecurityTeamRolePermissionSets,
  SecurityWorkspaceTeam,
  SecurityWorkspaceRoute,
} from "../domain/index.js";
import {
  buildSecurityRepositoryOwnerMetadata,
  buildSecurityRepositoryTeamAccessMetadata,
  buildSecurityRepositoryTeamRolePermissionMetadata,
  buildSecurityTeamResourceShareMetadata,
  getSecurityRepositorySharedTeamIds,
  normalizeSecurityWorkspaceTeam,
  readSecurityWorkspaceRoute,
  SECURITY_WORKSPACE_ROUTE_CHANGE_EVENT,
  writeSecurityWorkspaceRoute,
} from "../domain/index.js";
import {
  SECURITY_FINDING_HEADER_SECTIONS,
  SecurityFindingDetailPage,
  type SecurityFindingTab,
} from "./security-finding-detail-page.js";
import {
  SecurityDetailLoadingState,
  SecurityDetailPageFrame,
} from "./security-detail-layout.js";
import { SecurityOverviewPage } from "./security-overview-page.js";
import {
  SECURITY_REPOSITORY_HEADER_SECTIONS,
  SecurityRepositoryDetailPage,
  type SecurityRepositoryAnalyticsTimeframe,
  type SecurityRepositoryTab,
} from "./security-repository-detail-page.js";
import {
  SecurityRepositoryVersionControl,
  type SecurityRepositoryHeaderState,
} from "./security-repository-version-control.js";
import {
  SECURITY_RUN_HEADER_SECTIONS,
  SecurityRunDetailPage,
  type SecurityRunTab,
} from "./security-run-detail-page.js";

export interface DevelopSecurityWorkspacePageProps {
  controlsPortalId?: string;
  versionsDrawerPortalId?: string;
  githubConnectionStatus?: PlatformPluginConnectionStatus | null;
  viewerIdentity?: DevelopResourceIdentityInput;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamsRequiresPlan?: boolean;
  onWorkspaceTeamsRequest?: (options?: Record<string, unknown>) => void;
  onConnectGitHub?: (options: { redirectTo: string }) => void | Promise<void>;
  onDisconnectGitHub?: () => void | Promise<void>;
  onResourcesHeaderChange?: (state: SecurityRepositoryHeaderState) => void;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error || "Security service request failed.");
}

function getSecurityRouteKey(route: SecurityWorkspaceRoute): string {
  return route.kind === "overview" ? route.kind : `${route.kind}:${route.id}`;
}

function SecurityLoadError({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="develop-security-page-state is-error">
      <PlatformEmptyState
        icon={AlertTriangle}
        title="Repository security is unavailable"
        description={message}
        primaryAction={{
          label: "Try again",
          icon: RefreshCw,
          onClick: onRetry,
        }}
      />
      <PlatformSecondaryButton type="button" size="small" onClick={onBack}>
        Back to Security Agents
      </PlatformSecondaryButton>
    </div>
  );
}

function SecurityRequestNotice({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div className="develop-security-request-notice" role="alert">
      <AlertTriangle width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
      <span>{message}</span>
      <PlatformSecondaryButton type="button" size="small" onClick={onDismiss}>
        Dismiss
      </PlatformSecondaryButton>
    </div>
  );
}

export function DevelopSecurityWorkspacePage({
  controlsPortalId = "",
  versionsDrawerPortalId = "",
  githubConnectionStatus: shellGitHubConnectionStatus = null,
  viewerIdentity = {},
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamsRequiresPlan = false,
  onWorkspaceTeamsRequest,
  onConnectGitHub,
  onDisconnectGitHub,
  onResourcesHeaderChange,
  onVersionsSidebarOpenChange,
  onNavigationGuardChange,
}: DevelopSecurityWorkspacePageProps) {
  const repository = useSecurityServiceRepository();
  const [route, setRoute] = useState<SecurityWorkspaceRoute>(() =>
    readSecurityWorkspaceRoute(),
  );
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [githubStatus, setGitHubStatus] =
    useState<SecurityGitHubAppStatus | null>(null);
  const [installations, setInstallations] = useState<
    SecurityGitHubInstallation[]
  >([]);
  const [githubRepositories, setGitHubRepositories] = useState<
    SecurityGitHubRepository[]
  >([]);
  const [githubConnectionStatus, setGitHubConnectionStatus] =
    useState<PlatformPluginConnectionStatus>(
      shellGitHubConnectionStatus || { connected: false },
    );
  const [repositoryDetail, setRepositoryDetail] =
    useState<SecurityRepositoryDetail | null>(null);
  const [runDetail, setRunDetail] = useState<SecurityRunDetail | null>(null);
  const [findingDetail, setFindingDetail] =
    useState<SecurityFindingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [repositoryTab, setRepositoryTab] =
    useState<SecurityRepositoryTab>("runs");
  const [runTab, setRunTab] = useState<SecurityRunTab>("overview");
  const [findingTab, setFindingTab] = useState<SecurityFindingTab>("evidence");
  const [analyticsTimeframe, setAnalyticsTimeframe] =
    useState<SecurityRepositoryAnalyticsTimeframe>("30d");
  const activeRouteKeyRef = useRef(getSecurityRouteKey(route));
  const loadRequestIdRef = useRef(0);
  activeRouteKeyRef.current = getSecurityRouteKey(route);

  const prepareRoute = useCallback((nextRoute: SecurityWorkspaceRoute) => {
    activeRouteKeyRef.current = getSecurityRouteKey(nextRoute);
    loadRequestIdRef.current += 1;
    setRoute(nextRoute);
    setLoading(true);
    setError("");
    setActionError("");
  }, []);

  const navigate = useCallback(
    (nextRoute: SecurityWorkspaceRoute, mode: "push" | "replace" = "push") => {
      writeSecurityWorkspaceRoute(nextRoute, mode);
    },
    [],
  );

  useEffect(() => {
    const handleRouteChange = () => prepareRoute(readSecurityWorkspaceRoute());
    const handlePopState = () => handleRouteChange();
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(
      SECURITY_WORKSPACE_ROUTE_CHANGE_EVENT,
      handleRouteChange,
    );
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(
        SECURITY_WORKSPACE_ROUTE_CHANGE_EVENT,
        handleRouteChange,
      );
    };
  }, [prepareRoute]);

  useEffect(() => {
    if (shellGitHubConnectionStatus)
      setGitHubConnectionStatus(shellGitHubConnectionStatus);
  }, [shellGitHubConnectionStatus]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hadSetupParameters = [
      "develop_security",
      "github_security",
      "message",
    ].some((key) => url.searchParams.has(key));
    if (!hadSetupParameters) return;
    for (const key of ["develop_security", "github_security", "message"])
      url.searchParams.delete(key);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const loadOverview = useCallback(
    async (signal?: AbortSignal) => {
      const routeKey = "overview";
      const requestId = ++loadRequestIdRef.current;
      const isCurrent = () =>
        !signal?.aborted &&
        activeRouteKeyRef.current === routeKey &&
        loadRequestIdRef.current === requestId;
      setLoading(true);
      setError("");
      try {
        const nextOverview = await repository.getOverview(signal);
        if (isCurrent()) setOverview(nextOverview);
      } catch (nextError) {
        if (
          (nextError as { name?: string })?.name !== "AbortError" &&
          isCurrent()
        ) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [repository],
  );

  const loadGitHubIntegration = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const [
          nextStatus,
          nextInstallations,
          nextRepositories,
          nextConnectionStatus,
        ] = await Promise.all([
          repository.getGitHubStatus(signal),
          repository.listGitHubInstallations(signal),
          repository.listGitHubRepositories(signal),
          fetchPlatformPluginConnectionStatus("github", { signal }).catch(
            () => ({
              connected: false,
            }),
          ),
        ]);
        let resolvedInstallations = nextInstallations;
        let resolvedRepositories = nextRepositories;
        const hasOAuthInstallation = nextInstallations.some((installation) =>
          installation.githubInstallationId.startsWith("oauth:"),
        );
        if (nextConnectionStatus.connected && !hasOAuthInstallation) {
          try {
            const synced = await repository.syncGitHubOAuthConnection(signal);
            resolvedInstallations = [
              synced.installation,
              ...nextInstallations.filter(
                (installation) => installation.id !== synced.installation.id,
              ),
            ];
            const syncedIds = new Set(
              synced.repositories.map(
                (githubRepository) => githubRepository.id,
              ),
            );
            resolvedRepositories = [
              ...synced.repositories,
              ...nextRepositories.filter(
                (githubRepository) => !syncedIds.has(githubRepository.id),
              ),
            ];
          } catch (syncError) {
            if ((syncError as { name?: string })?.name === "AbortError")
              throw syncError;
          }
        }
        setGitHubStatus(nextStatus);
        setGitHubConnectionStatus(nextConnectionStatus);
        setInstallations(resolvedInstallations);
        setGitHubRepositories(resolvedRepositories);
      } catch (nextError) {
        if ((nextError as { name?: string })?.name === "AbortError") return;
      }
    },
    [repository],
  );

  const connectGitHub = useCallback(async () => {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.searchParams.set("develop_security", "1");
    writePlatformPluginConnectionRedirectState({
      provider: "github",
      savedAt: Date.now(),
      activePage: "develop-security",
    });
    if (onConnectGitHub) {
      await onConnectGitHub({ redirectTo: redirectUrl.toString() });
      return;
    }
    const connection = await beginPlatformPluginConnection("github", {
      redirectTo: redirectUrl.toString(),
    });
    window.location.assign(connection.authUrl);
  }, [onConnectGitHub]);

  const disconnectGitHub = useCallback(async () => {
    if (onDisconnectGitHub) {
      await onDisconnectGitHub();
    } else {
      await disconnectPlatformPluginConnection("github");
    }
    writeCachedPlatformPluginConnectionStatus("github", { connected: false });
    const oauthInstallationIds = new Set(
      installations
        .filter((installation) =>
          installation.githubInstallationId.startsWith("oauth:"),
        )
        .map((installation) => installation.id),
    );
    setGitHubConnectionStatus({ connected: false });
    setInstallations((current) =>
      current.filter(
        (installation) => !oauthInstallationIds.has(installation.id),
      ),
    );
    setGitHubRepositories((current) =>
      current.filter(
        (githubRepository) =>
          !oauthInstallationIds.has(githubRepository.installationId),
      ),
    );
  }, [installations, onDisconnectGitHub]);

  const loadRepository = useCallback(
    async (repositoryId: string, signal?: AbortSignal, quiet = false) => {
      const routeKey = `repository:${repositoryId}`;
      const requestId = ++loadRequestIdRef.current;
      const isCurrent = () =>
        !signal?.aborted &&
        activeRouteKeyRef.current === routeKey &&
        loadRequestIdRef.current === requestId;
      if (!quiet && isCurrent()) setLoading(true);
      if (!quiet && isCurrent()) setError("");
      try {
        const nextDetail = await repository.getRepository(repositoryId, signal);
        if (isCurrent()) {
          setRepositoryDetail(nextDetail);
          setError("");
        }
        return nextDetail;
      } catch (nextError) {
        if (
          (nextError as { name?: string })?.name !== "AbortError" &&
          !quiet &&
          isCurrent()
        ) {
          setError(getErrorMessage(nextError));
        }
        return null;
      } finally {
        if (!quiet && isCurrent()) setLoading(false);
      }
    },
    [repository],
  );

  const loadRun = useCallback(
    async (runId: string, signal?: AbortSignal, quiet = false) => {
      const routeKey = `run:${runId}`;
      const requestId = ++loadRequestIdRef.current;
      const isCurrent = () =>
        !signal?.aborted &&
        activeRouteKeyRef.current === routeKey &&
        loadRequestIdRef.current === requestId;
      if (!quiet && isCurrent()) setLoading(true);
      if (!quiet && isCurrent()) setError("");
      try {
        const nextDetail = await repository.getRun(runId, signal);
        if (isCurrent()) {
          setRunDetail(nextDetail);
          setError("");
        }
      } catch (nextError) {
        if (
          (nextError as { name?: string })?.name !== "AbortError" &&
          !quiet &&
          isCurrent()
        ) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (!quiet && isCurrent()) setLoading(false);
      }
    },
    [repository],
  );

  const loadFinding = useCallback(
    async (findingId: string, signal?: AbortSignal) => {
      const routeKey = `finding:${findingId}`;
      const requestId = ++loadRequestIdRef.current;
      const isCurrent = () =>
        !signal?.aborted &&
        activeRouteKeyRef.current === routeKey &&
        loadRequestIdRef.current === requestId;
      if (isCurrent()) setLoading(true);
      if (isCurrent()) setError("");
      try {
        const nextDetail = await repository.getFinding(findingId, signal);
        if (isCurrent()) {
          setFindingDetail(nextDetail);
          setError("");
        }
      } catch (nextError) {
        if (
          (nextError as { name?: string })?.name !== "AbortError" &&
          isCurrent()
        ) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    const controller = new AbortController();
    if (route.kind === "overview") {
      void loadOverview(controller.signal);
      void loadGitHubIntegration(controller.signal);
    }
    if (route.kind === "repository")
      void loadRepository(route.id, controller.signal);
    if (route.kind === "run") void loadRun(route.id, controller.signal);
    if (route.kind === "finding") void loadFinding(route.id, controller.signal);
    return () => controller.abort();
  }, [
    loadFinding,
    loadGitHubIntegration,
    loadOverview,
    loadRepository,
    loadRun,
    route,
  ]);

  useEffect(() => {
    if (route.kind !== "run" || !runDetail) return undefined;
    const runActive = ["queued", "running", "waiting_approval"].includes(
      runDetail.run.status,
    );
    const latestRemediation = [...runDetail.remediations].sort(
      (left, right) => (
        Date.parse(right.updatedAt || right.createdAt || "")
        - Date.parse(left.updatedAt || left.createdAt || "")
      ),
    )[0] || null;
    const lifecycle = String(
      latestRemediation?.lifecycle
      || latestRemediation?.validation?.lifecycle
      || latestRemediation?.status
      || "",
    );
    const remediationActive = [
      "queued",
      "generating",
      "agent_running",
      "pull_request_open",
      "merged",
      "verifying",
    ].includes(lifecycle);
    if (!runActive && !remediationActive) return undefined;
    const shouldReconcile = [
      "pull_request_open",
      "merged",
      "verifying",
    ].includes(lifecycle);
    const refresh = async () => {
      if (shouldReconcile && latestRemediation?.id) {
        await repository
          .reconcileRemediation(latestRemediation.id)
          .catch(() => undefined);
      }
      await loadRun(route.id, undefined, true);
    };
    const timer = window.setInterval(
      () => void refresh(),
      shouldReconcile ? 15_000 : 5_000,
    );
    return () => window.clearInterval(timer);
  }, [loadRun, repository, route, runDetail]);

  const runMutation = useCallback(
    async (id: string, operation: () => Promise<void>): Promise<boolean> => {
      setBusyId(id);
      setActionError("");
      try {
        await operation();
        return true;
      } catch (nextError) {
        setActionError(getErrorMessage(nextError));
        return false;
      } finally {
        setBusyId("");
      }
    },
    [],
  );

  const backToSecurityOverview = useCallback(
    () => navigate({ kind: "overview" }),
    [navigate],
  );

  useEffect(() => {
    if (!onResourcesHeaderChange) return;
    if (route.kind === "run" && runDetail) {
      onResourcesHeaderChange({
        mode: "detail",
        title: `Run ${runDetail.run.id.slice(-8)}`,
        resourceType: "security_run",
        resourceId: runDetail.run.id,
        parentTitle: runDetail.run.repositoryFullName || "Security repository",
        onParentClick: () =>
          navigate({ kind: "repository", id: runDetail.run.repositoryId }),
        activeSection: runTab,
        sectionOptions: SECURITY_RUN_HEADER_SECTIONS,
        onSectionChange: (section) => setRunTab(section as SecurityRunTab),
        onOverviewClick: backToSecurityOverview,
      });
      return;
    }
    if (route.kind === "finding" && findingDetail) {
      onResourcesHeaderChange({
        mode: "detail",
        title: findingDetail.finding.title,
        resourceType: "security_finding",
        resourceId: findingDetail.finding.id,
        parentTitle:
          findingDetail.finding.repositoryFullName || "Security repository",
        onParentClick: () =>
          navigate({
            kind: "repository",
            id: findingDetail.finding.repositoryId,
          }),
        activeSection: findingTab,
        sectionOptions: SECURITY_FINDING_HEADER_SECTIONS,
        onSectionChange: (section) =>
          setFindingTab(section as SecurityFindingTab),
        onOverviewClick: backToSecurityOverview,
      });
    }
  }, [
    backToSecurityOverview,
    findingDetail,
    findingTab,
    navigate,
    onResourcesHeaderChange,
    route.kind,
    runDetail,
    runTab,
  ]);

  useEffect(() => {
    if (route.kind !== "overview") return;
    onResourcesHeaderChange?.({ mode: "overview", title: "" });
    onVersionsSidebarOpenChange?.(false);
  }, [onResourcesHeaderChange, onVersionsSidebarOpenChange, route.kind]);

  if (route.kind === "overview") {
    return (
      <SecurityOverviewPage
        overview={overview}
        githubStatus={githubStatus}
        githubConnectionStatus={githubConnectionStatus}
        installations={installations}
        githubRepositories={githubRepositories}
        controlsPortalId={controlsPortalId}
        loading={loading}
        error={error || actionError}
        busyId={busyId}
        onRefresh={() => {
          void loadOverview();
          void loadGitHubIntegration();
        }}
        onBeginGitHubSetup={() =>
          void runMutation("github-setup", connectGitHub)
        }
        onDisconnectGitHub={() =>
          runMutation("github-disconnect", disconnectGitHub)
        }
        onLoadRepositoryBranches={(githubRepository) =>
          fetchPlatformGitHubRepositoryBranches(githubRepository.fullName)
        }
        onManageRepositories={(changes) =>
          runMutation("manage-repositories", async () => {
            for (const change of changes) {
              if (change.kind === "unmonitor") continue;
              const securityRepositoryId =
                change.kind === "monitor"
                  ? (
                      await repository.monitorRepository(
                        change.repository.id,
                        createPlatformDefaultPermissionSet(
                          "security_repository",
                        ),
                      )
                    ).id
                  : change.securityRepositoryId;
              if (
                change.kind === "monitor" &&
                change.branch === change.repository.defaultBranch
              ) {
                continue;
              }
              const configuration =
                await repository.getRepository(securityRepositoryId);
              if (!configuration.policy) {
                throw new Error(
                  `The scan policy for ${change.repository.fullName} could not be loaded.`,
                );
              }
              await repository.savePolicy(
                securityRepositoryId,
                {
                  ...configuration.policy.value,
                  defaultBranch: change.branch,
                },
                `Set default scan branch to ${change.branch}`,
              );
            }
            for (const change of changes) {
              if (change.kind === "unmonitor") {
                await repository.deleteRepository(change.securityRepositoryId);
              }
            }
            await Promise.all([loadOverview(), loadGitHubIntegration()]);
          })
        }
        onOpenRepository={(selected) =>
          navigate({ kind: "repository", id: selected.id })
        }
        onRunRepository={(selected) =>
          void runMutation(selected.id, async () => {
            const run = await repository.createRun(selected.id);
            navigate({ kind: "run", id: run.id });
          })
        }
      />
    );
  }

  const hasCurrentDetail =
    (route.kind === "repository" &&
      repositoryDetail?.repository.id === route.id) ||
    (route.kind === "run" && runDetail?.run.id === route.id) ||
    (route.kind === "finding" && findingDetail?.finding.id === route.id);

  if (loading && !hasCurrentDetail) {
    return (
      <SecurityDetailLoadingState
        message={
          route.kind === "repository"
            ? "Loading security agent…"
            : route.kind === "run"
              ? "Loading security run…"
              : "Loading security finding…"
        }
      />
    );
  }
  if (error && !hasCurrentDetail) {
    const retry =
      route.kind === "repository"
        ? () => void loadRepository(route.id)
        : route.kind === "run"
          ? () => void loadRun(route.id)
          : () => void loadFinding(route.id);
    return (
      <SecurityLoadError
        message={error}
        onBack={backToSecurityOverview}
        onRetry={retry}
      />
    );
  }

  const requestNotice = (
    <SecurityRequestNotice
      message={actionError || error}
      onDismiss={() => {
        setActionError("");
        setError("");
      }}
    />
  );

  if (
    route.kind === "repository" &&
    repositoryDetail?.repository.id === route.id
  ) {
    const refresh = () => loadRepository(route.id, undefined, true);
    return (
      <SecurityDetailPageFrame>
        {requestNotice}
        <SecurityRepositoryVersionControl
          detail={repositoryDetail}
          repository={repository}
          controlsPortalId={controlsPortalId}
          versionsDrawerPortalId={versionsDrawerPortalId}
          busy={Boolean(busyId)}
          onBack={backToSecurityOverview}
          activeSection={repositoryTab}
          sectionOptions={SECURITY_REPOSITORY_HEADER_SECTIONS}
          onSectionChange={(section) =>
            setRepositoryTab(section as SecurityRepositoryTab)
          }
          headerLeadingControls={
            repositoryTab === "runs" ? (
              <PlatformSwitch
                value={analyticsTimeframe}
                options={[
                  { value: "24h", label: "24H" },
                  { value: "7d", label: "7D" },
                  { value: "30d", label: "30D" },
                ]}
                onValueChange={(value) =>
                  setAnalyticsTimeframe(
                    value as SecurityRepositoryAnalyticsTimeframe,
                  )
                }
                ariaLabel="Security analytics time frame"
                className="playground-security-agent-detail-header-timeframe"
              />
            ) : null
          }
          onReload={refresh}
          onDelete={() => {
            if (
              !window.confirm(
                `Delete all retained security data for ${repositoryDetail.repository.fullName}?`,
              )
            )
              return;
            void runMutation(route.id, async () => {
              await repository.deleteRepository(route.id);
              navigate({ kind: "overview" });
            });
          }}
          onHeaderChange={onResourcesHeaderChange}
          onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
          onNavigationGuardChange={onNavigationGuardChange}
        >
          {({
            detail: versionedDetail,
            busy: versionBusy,
            onPolicyChange,
            onThreatModelChange,
          }) => (
            <SecurityRepositoryDetailPage
              detail={versionedDetail}
              activeTab={repositoryTab}
              analyticsTimeframe={analyticsTimeframe}
              busy={versionBusy}
              viewerIdentity={viewerIdentity}
              onLoadOwnerCandidates={async () => {
                const teamsById = new Map(
                  workspaceTeams
                    .map(normalizeSecurityWorkspaceTeam)
                    .filter((team): team is SecurityWorkspaceTeam =>
                      Boolean(team),
                    )
                    .map((team) => [team.id, team]),
                );
                const memberGroups = await Promise.all(
                  getSecurityRepositorySharedTeamIds(versionedDetail.repository)
                    .slice()
                    .sort()
                    .map(async (teamId) => {
                      try {
                        const members =
                          await repository.listTeamMembers(teamId);
                        const teamName =
                          teamsById.get(teamId)?.name || "Shared team";
                        return members.map((member) => {
                          const memberRecord =
                            member &&
                            typeof member === "object" &&
                            !Array.isArray(member)
                              ? (member as Record<string, unknown>)
                              : { member };
                          return {
                            ...memberRecord,
                            teamNames: [teamName],
                          };
                        });
                      } catch {
                        return [];
                      }
                    }),
                );
                return memberGroups.flat();
              }}
              onOwnerChange={(owner: DevelopResourceIdentity) =>
                runMutation(`security-owner:${route.id}`, async () => {
                  await repository.updateRepository(route.id, {
                    metadata: buildSecurityRepositoryOwnerMetadata(
                      versionedDetail.repository,
                      owner,
                    ),
                  });
                  await refresh();
                })
              }
              onOpenRun={(run) => navigate({ kind: "run", id: run.id })}
              onOpenFinding={(finding) =>
                navigate({ kind: "finding", id: finding.id })
              }
              onRunScan={() =>
                void runMutation(route.id, async () => {
                  const run = await repository.createRun(route.id);
                  navigate({ kind: "run", id: run.id });
                })
              }
              onSavePolicy={onPolicyChange}
              onSaveThreatModel={onThreatModelChange}
              onSaveSystemPrincipalPermissionSet={(
                principalId: PlatformSystemAccessPrincipalId,
                permissionSet: PlatformPermissionSet,
              ) =>
                void runMutation(route.id, async () => {
                  const currentRepository = versionedDetail.repository;
                  if (principalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID) {
                    await repository.updateRepository(route.id, {
                      permissionSet,
                    });
                  } else {
                    await repository.updateRepository(route.id, {
                      metadata: buildPlatformSystemPrincipalPermissionMetadata(
                        currentRepository.metadata,
                        principalId,
                        permissionSet,
                        "security_repository",
                      ),
                    });
                  }
                  await refresh();
                })
              }
              workspaceTeams={workspaceTeams}
              workspaceTeamsLoading={workspaceTeamsLoading}
              workspaceTeamsRequiresPlan={workspaceTeamsRequiresPlan}
              onWorkspaceTeamsRequest={() => onWorkspaceTeamsRequest?.({})}
              onAddTeamAccess={(
                team: SecurityWorkspaceTeam,
                _rolePermissionSets: SecurityTeamRolePermissionSets,
              ) =>
                void runMutation(`security-access:add:${team.id}`, async () => {
                  const currentRepository = versionedDetail.repository;
                  const metadata = buildSecurityRepositoryTeamAccessMetadata(
                    currentRepository,
                    team.id,
                    true,
                  );
                  const nextRepository = { ...currentRepository, metadata };
                  await repository.upsertTeamResourceShare(team.id, {
                    repositoryId: route.id,
                    metadata: buildSecurityTeamResourceShareMetadata(
                      nextRepository,
                      team.id,
                      team.name,
                    ),
                  });
                  await repository.updateRepository(route.id, { metadata });
                  await refresh();
                })
              }
              onRemoveTeamAccess={(teams: readonly SecurityWorkspaceTeam[]) =>
                void runMutation("security-access:remove", async () => {
                  const currentRepository = versionedDetail.repository;
                  let metadata = currentRepository.metadata;
                  for (const team of teams) {
                    metadata = buildSecurityRepositoryTeamAccessMetadata(
                      { ...currentRepository, metadata },
                      team.id,
                      false,
                    );
                    const shares = await repository.listTeamResourceShares(
                      team.id,
                    );
                    const matchingShares = shares.filter(
                      (share) => share.resourceId === route.id,
                    );
                    await Promise.all(
                      matchingShares.map((share) =>
                        repository.deleteTeamResourceShare(team.id, share.id),
                      ),
                    );
                  }
                  await repository.updateRepository(route.id, { metadata });
                  await refresh();
                })
              }
              onSaveTeamRolePermissionSet={(
                team: SecurityWorkspaceTeam,
                roleId: SecurityTeamRoleId,
                permissionSet: PlatformPermissionSet,
              ) =>
                void runMutation(
                  `security-access:${team.id}:${roleId}`,
                  async () => {
                    const currentRepository = versionedDetail.repository;
                    const metadata =
                      buildSecurityRepositoryTeamRolePermissionMetadata(
                        currentRepository,
                        team.id,
                        roleId,
                        permissionSet,
                      );
                    const nextRepository = { ...currentRepository, metadata };
                    await repository.updateRepository(route.id, { metadata });
                    await repository.upsertTeamResourceShare(team.id, {
                      repositoryId: route.id,
                      metadata: buildSecurityTeamResourceShareMetadata(
                        nextRepository,
                        team.id,
                        team.name,
                      ),
                    });
                    await refresh();
                  },
                )
              }
              onSetStatus={(status) =>
                void runMutation(route.id, async () => {
                  await repository.updateRepository(route.id, { status });
                  await refresh();
                })
              }
              onTabChange={setRepositoryTab}
            />
          )}
        </SecurityRepositoryVersionControl>
      </SecurityDetailPageFrame>
    );
  }

  if (route.kind === "run" && runDetail?.run.id === route.id) {
    return (
      <SecurityDetailPageFrame>
        {requestNotice}
        <SecurityRunDetailPage
          detail={runDetail}
          activeTab={runTab}
          busy={Boolean(busyId)}
          controlsPortalId={controlsPortalId}
          onRefresh={() => void loadRun(route.id)}
          onCancel={() =>
            void runMutation(route.id, async () => {
              await repository.cancelRun(route.id);
              await loadRun(route.id);
            })
          }
          onFixFindings={() =>
            void runMutation(`remediation:${route.id}`, async () => {
              await repository.createRunRemediation(route.id);
              await loadRun(route.id);
            })
          }
          onOpenPullRequest={(url) => {
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          onOpenFinding={(finding) =>
            navigate({ kind: "finding", id: finding.id })
          }
          onTabChange={setRunTab}
        />
      </SecurityDetailPageFrame>
    );
  }

  if (route.kind === "finding" && findingDetail?.finding.id === route.id) {
    return (
      <SecurityDetailPageFrame>
        {requestNotice}
        <SecurityFindingDetailPage
          detail={findingDetail}
          activeTab={findingTab}
          busy={Boolean(busyId)}
          onOpenRun={(runId) => navigate({ kind: "run", id: runId })}
          onTriage={(input: {
            status: SecurityFindingStatus;
            reason?: string;
            expiresAt?: string | null;
          }) =>
            void runMutation(route.id, async () => {
              await repository.updateFinding(route.id, input);
              await loadFinding(route.id);
            })
          }
          onTabChange={setFindingTab}
        />
      </SecurityDetailPageFrame>
    );
  }

  return (
    <div className="develop-security-page-state">
      <PlatformEmptyState
        icon={ShieldCheck}
        title="Security record not found"
        description="The selected repository security record may have been deleted or moved outside this organization."
        primaryAction={{
          label: "Back to security",
          onClick: () => navigate({ kind: "overview" }),
        }}
      />
    </div>
  );
}
