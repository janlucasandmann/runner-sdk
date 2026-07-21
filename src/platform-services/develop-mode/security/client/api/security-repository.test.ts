import { describe, expect, it, vi } from "vitest";

import { createSecurityServiceRepository } from "./security-repository.js";

describe("security service repository", () => {
  it("uses the centralized API boundary and encodes resource identifiers", async () => {
    const get = vi.fn()
      .mockResolvedValueOnce({ metrics: {}, repositories: [] })
      .mockResolvedValueOnce({ configured: true })
      .mockResolvedValueOnce({ data: [{ id: "installation_1" }] })
      .mockResolvedValueOnce({ data: [{ id: "github_repository_1" }] })
      .mockResolvedValueOnce({ repository: { id: "repository_1" } })
      .mockResolvedValueOnce({ run: { id: "run_1" } })
      .mockResolvedValueOnce({ finding: { id: "finding_1" } });
    const post = vi.fn()
      .mockResolvedValueOnce({ installUrl: "https://github.com/apps/example", expiresAt: "2026-07-21T12:00:00.000Z" })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ id: "repository_1" })
      .mockResolvedValueOnce({ id: "run_1" })
      .mockResolvedValueOnce({ id: "run_1" });
    const put = vi.fn().mockResolvedValue({});
    const patch = vi.fn().mockResolvedValue({ id: "repository_1" });
    const remove = vi.fn().mockResolvedValue(undefined);
    const repository = createSecurityServiceRepository({ get, post, put, patch, delete: remove });

    await repository.getOverview();
    await repository.getGitHubStatus();
    await repository.listGitHubInstallations();
    await repository.listGitHubRepositories();
    await repository.beginGitHubSetup();
    await repository.syncGitHubInstallation("installation / 1");
    await repository.monitorRepository("github_repository_1");
    await repository.getRepository("repository / 1");
    await repository.createRun("repository / 1");
    await repository.getRun("run / 1");
    await repository.cancelRun("run / 1");
    await repository.getFinding("finding / 1");

    expect(post).toHaveBeenNthCalledWith(1, "/api/real/github/security/setup", { redirectPath: "/?develop_security=1" });
    expect(post).toHaveBeenNthCalledWith(2, "/api/real/github/security/installations/installation%20%2F%201/sync", {});
    expect(get).toHaveBeenNthCalledWith(5, "/api/real/security/repositories/repository%20%2F%201", { signal: undefined });
    expect(post).toHaveBeenNthCalledWith(4, "/api/real/security/repositories/repository%20%2F%201/runs", {});
    expect(get).toHaveBeenNthCalledWith(6, "/api/real/security/runs/run%20%2F%201", { signal: undefined });
    expect(get).toHaveBeenNthCalledWith(7, "/api/real/security/findings/finding%20%2F%201", { signal: undefined });
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
});
