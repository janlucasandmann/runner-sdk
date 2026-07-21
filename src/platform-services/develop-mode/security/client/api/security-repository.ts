import type { PlatformApiClient } from "../../../../../platform-runtime/platform-api-client.js";
import type {
  SecurityFinding,
  SecurityFindingDetail,
  SecurityFindingStatus,
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubRepository,
  SecurityOverview,
  SecurityRepository,
  SecurityRepositoryDetail,
  SecurityRun,
  SecurityRunDetail,
  SecurityScanPolicy,
  SecurityThreatModel,
} from "../domain/index.js";

export interface SecurityServiceRepository {
  getOverview(signal?: AbortSignal): Promise<SecurityOverview>;
  getGitHubStatus(signal?: AbortSignal): Promise<SecurityGitHubAppStatus>;
  listGitHubInstallations(signal?: AbortSignal): Promise<SecurityGitHubInstallation[]>;
  listGitHubRepositories(signal?: AbortSignal): Promise<SecurityGitHubRepository[]>;
  beginGitHubSetup(): Promise<{ installUrl: string; expiresAt: string }>;
  syncGitHubInstallation(installationId: string): Promise<SecurityGitHubRepository[]>;
  monitorRepository(githubRepositoryId: string, permissionSet?: unknown): Promise<SecurityRepository>;
  getRepository(repositoryId: string, signal?: AbortSignal): Promise<SecurityRepositoryDetail>;
  updateRepository(repositoryId: string, patch: Record<string, unknown>): Promise<SecurityRepository>;
  deleteRepository(repositoryId: string): Promise<void>;
  savePolicy(repositoryId: string, value: SecurityScanPolicy, changeSummary: string): Promise<unknown>;
  saveThreatModel(repositoryId: string, value: SecurityThreatModel, changeSummary: string): Promise<unknown>;
  createRun(repositoryId: string): Promise<SecurityRun>;
  getRun(runId: string, signal?: AbortSignal): Promise<SecurityRunDetail>;
  cancelRun(runId: string): Promise<SecurityRun>;
  getFinding(findingId: string, signal?: AbortSignal): Promise<SecurityFindingDetail>;
  updateFinding(findingId: string, patch: {
    status: SecurityFindingStatus;
    reason?: string;
    expiresAt?: string | null;
  }): Promise<SecurityFinding>;
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data;
  }
  return [];
}

function requireId(value: string, label: string): string {
  const id = String(value || "").trim();
  if (!id) throw new Error(`${label} is required.`);
  return encodeURIComponent(id);
}

export function createSecurityServiceRepository(
  apiClient: Pick<PlatformApiClient, "get" | "post" | "put" | "patch" | "delete">,
): SecurityServiceRepository {
  const result: SecurityServiceRepository = {
    getOverview: (signal) => apiClient.get<SecurityOverview>("/api/real/security/overview", { signal }),
    getGitHubStatus: (signal) => apiClient.get<SecurityGitHubAppStatus>("/api/real/github/security/status", { signal }),
    async listGitHubInstallations(signal) {
      return unwrapList<SecurityGitHubInstallation>(await apiClient.get("/api/real/github/security/installations", { signal }));
    },
    async listGitHubRepositories(signal) {
      return unwrapList<SecurityGitHubRepository>(await apiClient.get("/api/real/github/security/repositories", { signal }));
    },
    beginGitHubSetup: () => apiClient.post<{ installUrl: string; expiresAt: string }>("/api/real/github/security/setup", { redirectPath: "/?develop_security=1" }),
    async syncGitHubInstallation(installationId) {
      return unwrapList<SecurityGitHubRepository>(await apiClient.post(
        `/api/real/github/security/installations/${requireId(installationId, "Installation id")}/sync`,
        {},
      ));
    },
    monitorRepository: (githubRepositoryId, permissionSet) => apiClient.post<SecurityRepository>("/api/real/security/repositories", {
      githubRepositoryId,
      ...(permissionSet ? { permissionSet } : {}),
    }),
    getRepository: (repositoryId, signal) => apiClient.get<SecurityRepositoryDetail>(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}`,
      { signal },
    ),
    updateRepository: (repositoryId, body) => apiClient.patch<SecurityRepository>(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}`,
      body,
    ),
    deleteRepository: (repositoryId) => apiClient.delete(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}`,
    ),
    savePolicy: (repositoryId, value, changeSummary) => apiClient.put(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/policy`,
      { value, changeSummary },
    ),
    saveThreatModel: (repositoryId, value, changeSummary) => apiClient.put(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/threat-model`,
      { value, changeSummary },
    ),
    createRun: (repositoryId) => apiClient.post<SecurityRun>(
      `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/runs`,
      {},
    ),
    getRun: (runId, signal) => apiClient.get<SecurityRunDetail>(`/api/real/security/runs/${requireId(runId, "Run id")}`, { signal }),
    cancelRun: (runId) => apiClient.post<SecurityRun>(`/api/real/security/runs/${requireId(runId, "Run id")}/cancel`, {}),
    getFinding: (findingId, signal) => apiClient.get<SecurityFindingDetail>(
      `/api/real/security/findings/${requireId(findingId, "Finding id")}`,
      { signal },
    ),
    updateFinding: (findingId, body) => apiClient.patch<SecurityFinding>(
      `/api/real/security/findings/${requireId(findingId, "Finding id")}`,
      body,
    ),
  };
  return Object.freeze(result);
}
