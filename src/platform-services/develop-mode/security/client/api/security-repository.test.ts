import { describe, expect, it, vi } from "vitest";

import { createSecurityServiceRepository } from "./security-repository.js";

describe("security service repository", () => {
  it("uses the centralized API boundary and encodes resource identifiers", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({ metrics: {}, repositories: [] })
      .mockResolvedValueOnce({ configured: true })
      .mockResolvedValueOnce({ data: [{ id: "installation_1" }] })
      .mockResolvedValueOnce({ data: [{ id: "github_repository_1" }] })
      .mockResolvedValueOnce({ repository: { id: "repository_1" } })
      .mockResolvedValueOnce({ run: { id: "run_1" } })
      .mockResolvedValueOnce({ finding: { id: "finding_1" } })
      .mockResolvedValueOnce({
        data: [
          {
            id: "share_1",
            resourceType: "security_repository",
            resourceId: "repository_1",
          },
          { id: "share_2", resourceType: "agent", resourceId: "agent_1" },
        ],
      })
      .mockResolvedValueOnce({
        data: [{ id: "membership_1", user: { id: "user_1" } }],
      });
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        installUrl: "https://github.com/apps/example",
        expiresAt: "2026-07-21T12:00:00.000Z",
      })
      .mockResolvedValueOnce({
        installation: { id: "installation_oauth" },
        repositories: [],
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ id: "repository_1" })
      .mockResolvedValueOnce({ id: "run_1" })
      .mockResolvedValueOnce({ id: "run_1" })
      .mockResolvedValueOnce({ data: { id: "share_1" } });
    const put = vi.fn().mockResolvedValue({});
    const patch = vi.fn().mockResolvedValue({ id: "repository_1" });
    const remove = vi.fn().mockResolvedValue(undefined);
    const repository = createSecurityServiceRepository({
      get,
      post,
      put,
      patch,
      delete: remove,
    });

    await repository.getOverview();
    await repository.getGitHubStatus();
    await repository.listGitHubInstallations();
    await repository.listGitHubRepositories();
    await repository.beginGitHubSetup();
    await repository.syncGitHubOAuthConnection();
    await repository.syncGitHubInstallation("installation / 1");
    await repository.monitorRepository("github_repository_1");
    await repository.getRepository("repository / 1");
    await repository.createRun("repository / 1");
    await repository.getRun("run / 1");
    await repository.cancelRun("run / 1");
    await repository.getFinding("finding / 1");
    expect(await repository.listTeamResourceShares("team / 1")).toHaveLength(1);
    expect(await repository.listTeamMembers("team / 1")).toHaveLength(1);
    await repository.upsertTeamResourceShare("team / 1", {
      repositoryId: "repository / 1",
      metadata: { resourceName: "acme/security" },
    });
    await repository.deleteTeamResourceShare("team / 1", "share / 1");

    expect(post).toHaveBeenNthCalledWith(1, "/api/real/github/security/setup", {
      redirectPath: "/?develop_security=1",
    });
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/api/real/github/security/oauth/sync",
      {},
      { signal: undefined },
    );
    expect(post).toHaveBeenNthCalledWith(
      3,
      "/api/real/github/security/installations/installation%20%2F%201/sync",
      {},
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      "/api/real/security/repositories/repository%20%2F%201",
      {
        signal: undefined,
      },
    );
    expect(post).toHaveBeenNthCalledWith(
      5,
      "/api/real/security/repositories/repository%20%2F%201/runs",
      {},
      {
        headers: {
          "Idempotency-Key": expect.stringMatching(/^security-run-/),
        },
      },
    );
    expect(get).toHaveBeenNthCalledWith(
      6,
      "/api/real/security/runs/run%20%2F%201",
      {
        signal: undefined,
      },
    );
    expect(get).toHaveBeenNthCalledWith(
      7,
      "/api/real/security/findings/finding%20%2F%201",
      {
        signal: undefined,
      },
    );
    expect(get).toHaveBeenNthCalledWith(
      8,
      "/api/real/teams/team%20%2F%201/resource-shares",
      {
        signal: undefined,
      },
    );
    expect(get).toHaveBeenNthCalledWith(
      9,
      "/api/real/teams/team%20%2F%201/members",
      {
        signal: undefined,
        query: {
          includeProfiles: 1,
          includeUsers: 1,
          include: "profile,user,account",
          expand: "profile,user,account",
        },
      },
    );
    expect(post).toHaveBeenNthCalledWith(
      7,
      "/api/real/teams/team%20%2F%201/resource-shares",
      {
        resourceType: "security_repository",
        resourceId: "repository / 1",
        accessLevel: "manage",
        metadata: { resourceName: "acme/security" },
      },
    );
    expect(remove).toHaveBeenCalledWith(
      "/api/real/teams/team%20%2F%201/resource-shares/share%20%2F%201",
    );
  });

  it("rejects an empty identifier before issuing a request", async () => {
    const get = vi.fn();
    const repository = createSecurityServiceRepository({
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    });
    expect(() => repository.getRun(" ")).toThrow("Run id is required");
    expect(get).not.toHaveBeenCalled();
  });

  it("creates one idempotent run remediation and reconciles its GitHub state", async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        id: "security_remediation_1",
        findingIds: ["finding_1", "finding_2"],
        lifecycle: "queued",
      })
      .mockResolvedValueOnce({
        id: "security_remediation_1",
        findingIds: ["finding_1", "finding_2"],
        lifecycle: "pull_request_open",
      });
    const repository = createSecurityServiceRepository({
      get: vi.fn(),
      post,
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    });

    await repository.createRunRemediation("run / 1", {
      findingIds: ["finding_1", "finding_2"],
    });
    await repository.reconcileRemediation("security_remediation / 1");

    expect(post).toHaveBeenNthCalledWith(
      1,
      "/api/real/security/runs/run%20%2F%201/remediations",
      { findingIds: ["finding_1", "finding_2"] },
      {
        headers: {
          "Idempotency-Key": expect.stringMatching(
            /^security-remediation-/,
          ),
        },
      },
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/api/real/security/remediations/security_remediation%20%2F%201/reconcile",
      {},
    );
  });

  it("retries transient idempotent reads without retrying mutations", async () => {
    vi.useFakeTimers();
    try {
      const transientError = Object.assign(new Error("Bad gateway"), {
        status: 502,
      });
      const get = vi
        .fn()
        .mockRejectedValueOnce(transientError)
        .mockRejectedValueOnce(transientError)
        .mockResolvedValueOnce({ run: { id: "run_1" } });
      const repository = createSecurityServiceRepository({
        get,
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      });

      const resultPromise = repository.getRun("run_1");
      await vi.runAllTimersAsync();

      await expect(resultPromise).resolves.toEqual({ run: { id: "run_1" } });
      expect(get).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry permanent read failures", async () => {
    const permanentError = Object.assign(new Error("Repository not found"), {
      status: 404,
    });
    const get = vi.fn().mockRejectedValue(permanentError);
    const repository = createSecurityServiceRepository({
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    });

    await expect(repository.getRepository("repository_1")).rejects.toBe(
      permanentError,
    );
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("stops retrying an idempotent read when its navigation signal aborts", async () => {
    vi.useFakeTimers();
    try {
      const transientError = Object.assign(new Error("Bad gateway"), {
        status: 502,
      });
      const get = vi.fn().mockRejectedValue(transientError);
      const repository = createSecurityServiceRepository({
        get,
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      });
      const controller = new AbortController();

      const resultPromise = repository.getOverview(controller.signal);
      const rejection = expect(resultPromise).rejects.toMatchObject({
        name: "AbortError",
      });
      await Promise.resolve();
      controller.abort();
      await vi.runAllTimersAsync();

      await rejection;
      expect(get).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses the shared resource-version route contract for repository configuration", async () => {
    const snapshot = {
      schemaVersion: 1 as const,
      policy: { schemaVersion: 1 },
      threatModel: { schemaVersion: 1 },
    } as never;
    const version = {
      id: "version_1",
      version: 1,
      status: "published",
      snapshot,
    };
    const get = vi.fn().mockResolvedValue({ data: [version] });
    const post = vi
      .fn()
      .mockResolvedValueOnce({ version, versions: [version] })
      .mockResolvedValueOnce({ version, versions: [version] });
    const patch = vi.fn().mockResolvedValue({ version });
    const remove = vi.fn().mockResolvedValue({ deleted: true });
    const repository = createSecurityServiceRepository({
      get,
      post,
      put: vi.fn(),
      patch,
      delete: remove,
    });

    await repository.listRepositoryVersions("repository / 1");
    await repository.createRepositoryVersion("repository / 1", {
      snapshot,
      description: "Harden pull-request scans",
      publish: true,
    });
    await repository.updateRepositoryVersion("repository / 1", "version / 1", {
      description: "Updated description",
    });
    await repository.publishRepositoryVersion("repository / 1", "version / 1", {
      snapshot,
    });
    await expect(
      repository.deleteRepositoryVersion("repository / 1", "version / 1"),
    ).resolves.toBe(true);

    const versionBase =
      "/api/real/security/repositories/repository%20%2F%201/versions";
    expect(get).toHaveBeenCalledWith(versionBase, { signal: undefined });
    expect(post).toHaveBeenNthCalledWith(1, versionBase, {
      snapshot,
      description: "Harden pull-request scans",
      publish: true,
    });
    expect(patch).toHaveBeenCalledWith(`${versionBase}/version%20%2F%201`, {
      description: "Updated description",
    });
    expect(post).toHaveBeenNthCalledWith(
      2,
      `${versionBase}/version%20%2F%201/publish`,
      { snapshot },
    );
    expect(remove).toHaveBeenCalledWith(`${versionBase}/version%20%2F%201`);
  });
});
