import { describe, expect, it, vi } from "vitest";
import {
  beginPlatformPluginConnection,
  clearPlatformPluginConnectionRedirectState,
  disconnectPlatformPluginConnection,
  fetchPlatformGitHubRepositoryBranches,
  fetchPlatformPluginConnectionStatus,
  getPlatformPluginConnectionDefinition,
  getPlatformPluginConnectionIdentity,
  readCachedPlatformPluginConnectionStatus,
  readPlatformPluginConnectionRedirectState,
  writeCachedPlatformPluginConnectionStatus,
  writePlatformPluginConnectionRedirectState,
} from "./index.js";

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("plugin connection registry", () => {
  it("exposes the catalog logo sources for Gmail and OneDrive", () => {
    expect(getPlatformPluginConnectionDefinition("gmail").logoUrl).toBe(
      "/img/plugins/gmail.svg",
    );
    expect(getPlatformPluginConnectionDefinition("one-drive").logoUrl).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microsoft_OneDrive_Icon_%282025_-_present%29.svg",
    );
  });

  it("owns provider endpoints and normalizes connected identities", async () => {
    const request = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ connected: true, profile: { login: "octocat" }, scope: "repo" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );

    const status = await fetchPlatformPluginConnectionStatus("github", { fetch: request });

    expect(request).toHaveBeenCalledWith(
      getPlatformPluginConnectionDefinition("github").statusPath,
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
    expect(status).toMatchObject({ connected: true, scope: "repo" });
    expect(getPlatformPluginConnectionIdentity("github", status)).toBe("octocat");
  });

  it("starts and disconnects providers through the registered endpoints", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authUrl: "https://github.com/login/oauth/authorize" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const started = await beginPlatformPluginConnection("github", {
      redirectTo: "https://platform.example/develop/security",
      scope: "repo read:user",
      fetch: request,
    });
    await disconnectPlatformPluginConnection("github", { fetch: request });

    expect(started.authUrl).toContain("github.com");
    expect(request.mock.calls[0]?.[0]).toBe("/api/aios/github/login");
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual({
      redirectTo: "https://platform.example/develop/security",
      scope: "repo read:user",
    });
    expect(request.mock.calls[1]?.[0]).toBe("/api/aios/github/disconnect");
  });

  it("preserves existing cache and redirect storage contracts", () => {
    const local = createStorage();
    const session = createStorage();
    writeCachedPlatformPluginConnectionStatus(
      "github",
      { connected: true, profile: { login: "acme" } },
      local,
    );
    writePlatformPluginConnectionRedirectState(
      { provider: "github", savedAt: 123, activePage: "develop-security" },
      session,
    );

    expect(readCachedPlatformPluginConnectionStatus("github", local)).toEqual({
      connected: true,
      profile: { login: "acme" },
    });
    expect(readPlatformPluginConnectionRedirectState(session)).toMatchObject({
      provider: "github",
      activePage: "develop-security",
    });

    clearPlatformPluginConnectionRedirectState(session);
    expect(readPlatformPluginConnectionRedirectState(session)).toBeNull();
  });

  it("loads normalized repository branches through the shared GitHub plugin API", async () => {
    const request = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            branches: [
              { name: "main", protected: true },
              { name: "release/next", protected: false },
              { protected: false },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );

    await expect(
      fetchPlatformGitHubRepositoryBranches("computer-agents/platform", { fetch: request }),
    ).resolves.toEqual([
      { name: "main", protected: true },
      { name: "release/next", protected: false },
    ]);
    expect(request).toHaveBeenCalledWith(
      "/api/aios/github/repos/computer-agents/platform/branches",
      expect.objectContaining({ method: "GET", credentials: "include", cache: "no-store" }),
    );
  });
});
