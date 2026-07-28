import type { PlatformApiClient } from "../../../../../platform-runtime/platform-api-client.js";
import type {
  SecurityFinding,
  SecurityFindingDetail,
  SecurityFindingStatus,
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubOAuthSyncResult,
  SecurityGitHubRepository,
  SecurityOverview,
  SecurityRepository,
  SecurityRepositoryDetail,
  SecurityRepositoryVersion,
  SecurityRepositoryVersionMutationResult,
  SecurityRepositoryVersionSnapshot,
  SecurityRemediation,
  SecurityRun,
  SecurityRunDetail,
  SecurityScanPolicy,
  SecurityTeamResourceShare,
  SecurityThreatModel,
} from "../domain/index.js";

export interface SecurityServiceRepository {
  getOverview(signal?: AbortSignal): Promise<SecurityOverview>;
  getGitHubStatus(signal?: AbortSignal): Promise<SecurityGitHubAppStatus>;
  listGitHubInstallations(
    signal?: AbortSignal,
  ): Promise<SecurityGitHubInstallation[]>;
  listGitHubRepositories(
    signal?: AbortSignal,
  ): Promise<SecurityGitHubRepository[]>;
  beginGitHubSetup(): Promise<{ installUrl: string; expiresAt: string }>;
  syncGitHubOAuthConnection(
    signal?: AbortSignal,
  ): Promise<SecurityGitHubOAuthSyncResult>;
  syncGitHubInstallation(
    installationId: string,
  ): Promise<SecurityGitHubRepository[]>;
  monitorRepository(
    githubRepositoryId: string,
    permissionSet?: unknown,
  ): Promise<SecurityRepository>;
  getRepository(
    repositoryId: string,
    signal?: AbortSignal,
  ): Promise<SecurityRepositoryDetail>;
  updateRepository(
    repositoryId: string,
    patch: Record<string, unknown>,
  ): Promise<SecurityRepository>;
  listRepositoryVersions(
    repositoryId: string,
    signal?: AbortSignal,
  ): Promise<SecurityRepositoryVersion[]>;
  createRepositoryVersion(
    repositoryId: string,
    input: {
      snapshot: SecurityRepositoryVersionSnapshot;
      description?: string;
      publish?: boolean;
    },
  ): Promise<SecurityRepositoryVersionMutationResult>;
  updateRepositoryVersion(
    repositoryId: string,
    versionId: string,
    input: {
      snapshot?: SecurityRepositoryVersionSnapshot;
      description?: string;
    },
  ): Promise<SecurityRepositoryVersion>;
  publishRepositoryVersion(
    repositoryId: string,
    versionId: string,
    input?: {
      snapshot?: SecurityRepositoryVersionSnapshot;
      description?: string;
    },
  ): Promise<SecurityRepositoryVersionMutationResult>;
  deleteRepositoryVersion(
    repositoryId: string,
    versionId: string,
  ): Promise<boolean>;
  listTeamResourceShares(
    teamId: string,
    signal?: AbortSignal,
  ): Promise<SecurityTeamResourceShare[]>;
  listTeamMembers(teamId: string, signal?: AbortSignal): Promise<unknown[]>;
  upsertTeamResourceShare(
    teamId: string,
    input: {
      repositoryId: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<SecurityTeamResourceShare>;
  deleteTeamResourceShare(teamId: string, shareId: string): Promise<void>;
  deleteRepository(repositoryId: string): Promise<void>;
  savePolicy(
    repositoryId: string,
    value: SecurityScanPolicy,
    changeSummary: string,
  ): Promise<unknown>;
  saveThreatModel(
    repositoryId: string,
    value: SecurityThreatModel,
    changeSummary: string,
  ): Promise<unknown>;
  createRun(repositoryId: string): Promise<SecurityRun>;
  getRun(runId: string, signal?: AbortSignal): Promise<SecurityRunDetail>;
  cancelRun(runId: string): Promise<SecurityRun>;
  createRunRemediation(
    runId: string,
    input?: { findingIds?: string[] },
  ): Promise<SecurityRemediation>;
  reconcileRemediation(
    remediationId: string,
  ): Promise<SecurityRemediation>;
  getFinding(
    findingId: string,
    signal?: AbortSignal,
  ): Promise<SecurityFindingDetail>;
  updateFinding(
    findingId: string,
    patch: {
      status: SecurityFindingStatus;
      reason?: string;
      expiresAt?: string | null;
    },
  ): Promise<SecurityFinding>;
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

function requireId(value: string, label: string): string {
  const id = String(value || "").trim();
  if (!id) throw new Error(`${label} is required.`);
  return encodeURIComponent(id);
}

function createSecurityRunRequestKey(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return `security-run-${randomId || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function createSecurityRemediationRequestKey(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return `security-remediation-${randomId || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

const SECURITY_READ_RETRY_DELAYS_MS = [150, 500, 1_250] as const;
const TRANSIENT_SECURITY_READ_STATUSES = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504,
]);

function isAbortError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      (error as { name?: unknown }).name === "AbortError",
  );
}

function isTransientSecurityReadError(error: unknown): boolean {
  if (isAbortError(error)) return false;
  const status = Number(
    error && typeof error === "object"
      ? (error as { status?: unknown }).status
      : Number.NaN,
  );
  if (TRANSIENT_SECURITY_READ_STATUSES.has(status)) return true;
  if (error instanceof TypeError) return true;
  const message =
    error instanceof Error ? error.message : String(error || "");
  return /\b(?:network|fetch|proxy|gateway|timed out|timeout|temporarily unavailable)\b/i.test(
    message,
  );
}

function createAbortError(): Error {
  if (typeof DOMException === "function") {
    return new DOMException("The request was aborted.", "AbortError");
  }
  const error = new Error("The request was aborted.");
  error.name = "AbortError";
  return error;
}

function waitForSecurityReadRetry(
  delayMs: number,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) return Promise.reject(createAbortError());
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

async function readSecurityResource<T>(
  operation: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  let retryIndex = 0;
  while (true) {
    if (signal?.aborted) throw createAbortError();
    try {
      return await operation();
    } catch (error) {
      if (
        retryIndex >= SECURITY_READ_RETRY_DELAYS_MS.length ||
        !isTransientSecurityReadError(error)
      ) {
        throw error;
      }
      const delayMs = SECURITY_READ_RETRY_DELAYS_MS[retryIndex];
      retryIndex += 1;
      await waitForSecurityReadRetry(delayMs, signal);
    }
  }
}

export function createSecurityServiceRepository(
  apiClient: Pick<
    PlatformApiClient,
    "get" | "post" | "put" | "patch" | "delete"
  >,
): SecurityServiceRepository {
  const result: SecurityServiceRepository = {
    getOverview: (signal) =>
      readSecurityResource(
        () =>
          apiClient.get<SecurityOverview>("/api/real/security/overview", {
            signal,
          }),
        signal,
      ),
    getGitHubStatus: (signal) =>
      readSecurityResource(
        () =>
          apiClient.get<SecurityGitHubAppStatus>(
            "/api/real/github/security/status",
            { signal },
          ),
        signal,
      ),
    async listGitHubInstallations(signal) {
      return unwrapList<SecurityGitHubInstallation>(
        await readSecurityResource(
          () =>
            apiClient.get("/api/real/github/security/installations", {
              signal,
            }),
          signal,
        ),
      );
    },
    async listGitHubRepositories(signal) {
      return unwrapList<SecurityGitHubRepository>(
        await readSecurityResource(
          () =>
            apiClient.get("/api/real/github/security/repositories", {
              signal,
            }),
          signal,
        ),
      );
    },
    beginGitHubSetup: () =>
      apiClient.post<{ installUrl: string; expiresAt: string }>(
        "/api/real/github/security/setup",
        {
          redirectPath: "/?develop_security=1",
        },
      ),
    syncGitHubOAuthConnection: (signal) =>
      apiClient.post<SecurityGitHubOAuthSyncResult>(
        "/api/real/github/security/oauth/sync",
        {},
        { signal },
      ),
    async syncGitHubInstallation(installationId) {
      return unwrapList<SecurityGitHubRepository>(
        await apiClient.post(
          `/api/real/github/security/installations/${requireId(installationId, "Installation id")}/sync`,
          {},
        ),
      );
    },
    monitorRepository: (githubRepositoryId, permissionSet) =>
      apiClient.post<SecurityRepository>("/api/real/security/repositories", {
        githubRepositoryId,
        ...(permissionSet ? { permissionSet } : {}),
      }),
    getRepository(repositoryId, signal) {
      const encodedRepositoryId = requireId(repositoryId, "Repository id");
      return readSecurityResource(
        () =>
          apiClient.get<SecurityRepositoryDetail>(
            `/api/real/security/repositories/${encodedRepositoryId}`,
            { signal },
          ),
        signal,
      );
    },
    updateRepository: (repositoryId, body) =>
      apiClient.patch<SecurityRepository>(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}`,
        body,
      ),
    async listRepositoryVersions(repositoryId, signal) {
      return unwrapList<SecurityRepositoryVersion>(
        await readSecurityResource(
          () =>
            apiClient.get(
              `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/versions`,
              { signal },
            ),
          signal,
        ),
      );
    },
    createRepositoryVersion: (repositoryId, body) =>
      apiClient.post<SecurityRepositoryVersionMutationResult>(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/versions`,
        body,
      ),
    updateRepositoryVersion: (repositoryId, versionId, body) =>
      apiClient
        .patch<{ version: SecurityRepositoryVersion }>(
          `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/versions/${requireId(versionId, "Version id")}`,
          body,
        )
        .then((response) => response.version),
    publishRepositoryVersion: (repositoryId, versionId, body = {}) =>
      apiClient.post<SecurityRepositoryVersionMutationResult>(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/versions/${requireId(versionId, "Version id")}/publish`,
        body,
      ),
    deleteRepositoryVersion: (repositoryId, versionId) =>
      apiClient
        .delete<{ deleted?: boolean }>(
          `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/versions/${requireId(versionId, "Version id")}`,
        )
        .then((response) => Boolean(response?.deleted)),
    async listTeamResourceShares(teamId, signal) {
      return unwrapList<SecurityTeamResourceShare>(
        await readSecurityResource(
          () =>
            apiClient.get(
              `/api/real/teams/${requireId(teamId, "Team id")}/resource-shares`,
              {
                signal,
              },
            ),
          signal,
        ),
      ).filter((share) => share.resourceType === "security_repository");
    },
    async listTeamMembers(teamId, signal) {
      return unwrapList(
        await readSecurityResource(
          () =>
            apiClient.get(
              `/api/real/teams/${requireId(teamId, "Team id")}/members`,
              {
                signal,
                query: {
                  includeProfiles: 1,
                  includeUsers: 1,
                  include: "profile,user,account",
                  expand: "profile,user,account",
                },
              },
            ),
          signal,
        ),
      );
    },
    upsertTeamResourceShare: (teamId, input) =>
      apiClient
        .post<{ data?: SecurityTeamResourceShare } | SecurityTeamResourceShare>(
          `/api/real/teams/${requireId(teamId, "Team id")}/resource-shares`,
          {
            resourceType: "security_repository",
            resourceId: input.repositoryId,
            accessLevel: "manage",
            metadata: input.metadata,
          },
        )
        .then((response) =>
          response &&
          typeof response === "object" &&
          "data" in response &&
          response.data
            ? response.data
            : (response as SecurityTeamResourceShare),
        ),
    deleteTeamResourceShare: (teamId, shareId) =>
      apiClient.delete(
        `/api/real/teams/${requireId(teamId, "Team id")}/resource-shares/${requireId(shareId, "Share id")}`,
      ),
    deleteRepository: (repositoryId) =>
      apiClient.delete(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}`,
      ),
    savePolicy: (repositoryId, value, changeSummary) =>
      apiClient.put(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/policy`,
        { value, changeSummary },
      ),
    saveThreatModel: (repositoryId, value, changeSummary) =>
      apiClient.put(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/threat-model`,
        { value, changeSummary },
      ),
    createRun: (repositoryId) =>
      apiClient.post<SecurityRun>(
        `/api/real/security/repositories/${requireId(repositoryId, "Repository id")}/runs`,
        {},
        {
          headers: {
            "Idempotency-Key": createSecurityRunRequestKey(),
          },
        },
      ),
    getRun(runId, signal) {
      const encodedRunId = requireId(runId, "Run id");
      return readSecurityResource(
        () =>
          apiClient.get<SecurityRunDetail>(
            `/api/real/security/runs/${encodedRunId}`,
            {
              signal,
            },
          ),
        signal,
      );
    },
    cancelRun: (runId) =>
      apiClient.post<SecurityRun>(
        `/api/real/security/runs/${requireId(runId, "Run id")}/cancel`,
        {},
      ),
    createRunRemediation: (runId, body = {}) =>
      apiClient.post<SecurityRemediation>(
        `/api/real/security/runs/${requireId(runId, "Run id")}/remediations`,
        body,
        {
          headers: {
            "Idempotency-Key": createSecurityRemediationRequestKey(),
          },
        },
      ),
    reconcileRemediation: (remediationId) =>
      apiClient.post<SecurityRemediation>(
        `/api/real/security/remediations/${requireId(remediationId, "Remediation id")}/reconcile`,
        {},
      ),
    getFinding(findingId, signal) {
      const encodedFindingId = requireId(findingId, "Finding id");
      return readSecurityResource(
        () =>
          apiClient.get<SecurityFindingDetail>(
            `/api/real/security/findings/${encodedFindingId}`,
            { signal },
          ),
        signal,
      );
    },
    updateFinding: (findingId, body) =>
      apiClient.patch<SecurityFinding>(
        `/api/real/security/findings/${requireId(findingId, "Finding id")}`,
        body,
      ),
  };
  return Object.freeze(result);
}
