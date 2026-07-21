import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { createPlatformDefaultPermissionSet, type PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";
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
  SecurityScanPolicy,
  SecurityThreatModel,
  SecurityWorkspaceRoute,
} from "../domain/index.js";
import { readSecurityWorkspaceRoute, writeSecurityWorkspaceRoute } from "../domain/index.js";
import { SecurityFindingDetailPage } from "./security-finding-detail-page.js";
import { SecurityOverviewPage } from "./security-overview-page.js";
import { SecurityRepositoryDetailPage } from "./security-repository-detail-page.js";
import { SecurityRunDetailPage } from "./security-run-detail-page.js";

export interface DevelopSecurityWorkspacePageProps {
  controlsPortalId?: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "Security service request failed.");
}

function readGitHubSetupNotice(): { message: string; tone: "success" | "danger" } {
  if (typeof window === "undefined") return { message: "", tone: "success" };
  const params = new URLSearchParams(window.location.search);
  if (params.get("github_security") === "connected") {
    return { message: "GitHub App connected. Select a repository to begin monitoring.", tone: "success" };
  }
  if (params.get("github_security") === "error") {
    return {
      message: params.get("message")?.trim() || "The GitHub App connection could not be completed.",
      tone: "danger",
    };
  }
  return { message: "", tone: "success" };
}

function LoadingSecurityPage() {
  return <PlatformLoadingState centered className="develop-security-page-state" message="Loading repository security…" />;
}

function SecurityLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="develop-security-page-state is-error">
      <PlatformEmptyState icon={AlertTriangle} title="Repository security is unavailable" description={message} primaryAction={{ label: "Try again", icon: RefreshCw, onClick: onRetry }} />
    </div>
  );
}

export function DevelopSecurityWorkspacePage({ controlsPortalId = "" }: DevelopSecurityWorkspacePageProps) {
  const repository = useSecurityServiceRepository();
  const [initialSetupNotice] = useState(readGitHubSetupNotice);
  const [route, setRoute] = useState<SecurityWorkspaceRoute>(() => readSecurityWorkspaceRoute());
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [githubStatus, setGitHubStatus] = useState<SecurityGitHubAppStatus | null>(null);
  const [installations, setInstallations] = useState<SecurityGitHubInstallation[]>([]);
  const [githubRepositories, setGitHubRepositories] = useState<SecurityGitHubRepository[]>([]);
  const [repositoryDetail, setRepositoryDetail] = useState<SecurityRepositoryDetail | null>(null);
  const [runDetail, setRunDetail] = useState<SecurityRunDetail | null>(null);
  const [findingDetail, setFindingDetail] = useState<SecurityFindingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(initialSetupNotice.message);
  const [messageTone, setMessageTone] = useState<"success" | "danger">(initialSetupNotice.tone);
  const [busyId, setBusyId] = useState("");

  const navigate = useCallback((nextRoute: SecurityWorkspaceRoute, mode: "push" | "replace" = "push") => {
    writeSecurityWorkspaceRoute(nextRoute, mode);
    setRoute(nextRoute);
    setError("");
    setMessage("");
    setMessageTone("success");
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(readSecurityWorkspaceRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hadSetupParameters = ["develop_security", "github_security", "message"]
      .some((key) => url.searchParams.has(key));
    if (!hadSetupParameters) return;
    for (const key of ["develop_security", "github_security", "message"]) url.searchParams.delete(key);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextStatus, nextInstallations, nextRepositories] = await Promise.all([
        repository.getOverview(signal),
        repository.getGitHubStatus(signal),
        repository.listGitHubInstallations(signal),
        repository.listGitHubRepositories(signal),
      ]);
      setOverview(nextOverview);
      setGitHubStatus(nextStatus);
      setInstallations(nextInstallations);
      setGitHubRepositories(nextRepositories);
    } catch (nextError) {
      if ((nextError as { name?: string })?.name !== "AbortError") setError(getErrorMessage(nextError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository]);

  const loadRepository = useCallback(async (repositoryId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setRepositoryDetail(await repository.getRepository(repositoryId, signal));
    } catch (nextError) {
      if ((nextError as { name?: string })?.name !== "AbortError") setError(getErrorMessage(nextError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository]);

  const loadRun = useCallback(async (runId: string, signal?: AbortSignal, quiet = false) => {
    if (!quiet) setLoading(true);
    if (!quiet) setError("");
    try {
      setRunDetail(await repository.getRun(runId, signal));
    } catch (nextError) {
      if ((nextError as { name?: string })?.name !== "AbortError" && !quiet) setError(getErrorMessage(nextError));
    } finally {
      if (!signal?.aborted && !quiet) setLoading(false);
    }
  }, [repository]);

  const loadFinding = useCallback(async (findingId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setFindingDetail(await repository.getFinding(findingId, signal));
    } catch (nextError) {
      if ((nextError as { name?: string })?.name !== "AbortError") setError(getErrorMessage(nextError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    const controller = new AbortController();
    if (route.kind === "overview") void loadOverview(controller.signal);
    if (route.kind === "repository") void loadRepository(route.id, controller.signal);
    if (route.kind === "run") void loadRun(route.id, controller.signal);
    if (route.kind === "finding") void loadFinding(route.id, controller.signal);
    return () => controller.abort();
  }, [loadFinding, loadOverview, loadRepository, loadRun, route]);

  useEffect(() => {
    if (route.kind !== "run" || !runDetail || !["queued", "running", "waiting_approval"].includes(runDetail.run.status)) return undefined;
    const timer = window.setInterval(() => void loadRun(route.id, undefined, true), 5_000);
    return () => window.clearInterval(timer);
  }, [loadRun, route, runDetail]);

  const runMutation = useCallback(async (id: string, operation: () => Promise<void>, successMessage = "") => {
    setBusyId(id);
    setError("");
    try {
      await operation();
      if (successMessage) {
        setMessage(successMessage);
        setMessageTone("success");
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setBusyId("");
    }
  }, []);

  if (route.kind === "overview") {
    return (
      <SecurityOverviewPage
        overview={overview}
        githubStatus={githubStatus}
        installations={installations}
        githubRepositories={githubRepositories}
        controlsPortalId={controlsPortalId}
        loading={loading}
        error={error}
        busyId={busyId}
        message={message}
        messageTone={messageTone}
        onRefresh={() => void loadOverview()}
        onBeginGitHubSetup={() => void runMutation("github-setup", async () => {
          const setup = await repository.beginGitHubSetup();
          window.location.assign(setup.installUrl);
        })}
        onSyncInstallation={(installationId) => void runMutation(installationId, async () => {
          await repository.syncGitHubInstallation(installationId);
          await loadOverview();
        }, "GitHub repository access refreshed.")}
        onMonitorRepository={(githubRepository) => void runMutation(githubRepository.id, async () => {
          const created = await repository.monitorRepository(
            githubRepository.id,
            createPlatformDefaultPermissionSet("security_repository"),
          );
          navigate({ kind: "repository", id: created.id });
        })}
        onOpenRepository={(selected) => navigate({ kind: "repository", id: selected.id })}
        onRunRepository={(selected) => void runMutation(selected.id, async () => {
          const run = await repository.createRun(selected.id);
          navigate({ kind: "run", id: run.id });
        })}
      />
    );
  }

  if (loading) return <LoadingSecurityPage />;
  if (error) {
    const retry = route.kind === "repository"
      ? () => void loadRepository(route.id)
      : route.kind === "run"
        ? () => void loadRun(route.id)
        : () => void loadFinding(route.id);
    return <SecurityLoadError message={error} onRetry={retry} />;
  }

  if (route.kind === "repository" && repositoryDetail) {
    const refresh = () => loadRepository(route.id);
    return (
      <SecurityRepositoryDetailPage
        detail={repositoryDetail}
        loading={loading}
        busy={Boolean(busyId)}
        message={message}
        onBack={() => navigate({ kind: "overview" })}
        onRefresh={() => void refresh()}
        onRun={() => void runMutation(route.id, async () => {
          const run = await repository.createRun(route.id);
          navigate({ kind: "run", id: run.id });
        })}
        onOpenRun={(run) => navigate({ kind: "run", id: run.id })}
        onOpenFinding={(finding) => navigate({ kind: "finding", id: finding.id })}
        onSavePolicy={(policy: SecurityScanPolicy) => void runMutation(route.id, async () => {
          await repository.savePolicy(route.id, policy, "Updated from Develop Security");
          await refresh();
        }, "Scan policy version saved.")}
        onSaveThreatModel={(threatModel: SecurityThreatModel) => void runMutation(route.id, async () => {
          await repository.saveThreatModel(route.id, threatModel, "Updated from Develop Security");
          await refresh();
        }, "Threat-model version saved.")}
        onSavePermissionSet={(permissionSet: PlatformPermissionSet) => void runMutation(route.id, async () => {
          await repository.updateRepository(route.id, { permissionSet });
          await refresh();
        }, "Repository permissions saved.")}
        onSetStatus={(status) => void runMutation(route.id, async () => {
          await repository.updateRepository(route.id, { status });
          await refresh();
        }, status === "active" ? "Monitoring resumed." : "Monitoring paused.")}
        onDelete={() => {
          if (!window.confirm(`Delete all retained security data for ${repositoryDetail.repository.fullName}?`)) return;
          void runMutation(route.id, async () => {
            await repository.deleteRepository(route.id);
            navigate({ kind: "overview" });
          });
        }}
      />
    );
  }

  if (route.kind === "run" && runDetail) {
    return (
      <SecurityRunDetailPage
        detail={runDetail}
        busy={Boolean(busyId)}
        onBack={() => navigate({ kind: "repository", id: runDetail.run.repositoryId })}
        onRefresh={() => void loadRun(route.id)}
        onCancel={() => void runMutation(route.id, async () => {
          await repository.cancelRun(route.id);
          await loadRun(route.id);
        })}
        onOpenFinding={(finding) => navigate({ kind: "finding", id: finding.id })}
      />
    );
  }

  if (route.kind === "finding" && findingDetail) {
    return (
      <SecurityFindingDetailPage
        detail={findingDetail}
        busy={Boolean(busyId)}
        onBack={() => navigate({ kind: "repository", id: findingDetail.finding.repositoryId })}
        onOpenRun={(runId) => navigate({ kind: "run", id: runId })}
        onTriage={(input: { status: SecurityFindingStatus; reason?: string; expiresAt?: string | null }) => void runMutation(route.id, async () => {
          await repository.updateFinding(route.id, input);
          await loadFinding(route.id);
        }, "Triage decision recorded in the audit log.")}
      />
    );
  }

  return (
    <div className="develop-security-page-state">
      <PlatformEmptyState icon={ShieldCheck} title="Security record not found" description="The selected repository security record may have been deleted or moved outside this organization." primaryAction={{ label: "Back to security", onClick: () => navigate({ kind: "overview" }) }} />
    </div>
  );
}
