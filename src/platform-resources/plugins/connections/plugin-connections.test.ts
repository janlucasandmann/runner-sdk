import { describe, expect, it, vi } from "vitest";
import {
  beginPlatformPluginConnection,
  buildPlatformPluginConnectionReturnUrl,
  clearPlatformPluginConnectionReturnUrlState,
  clearPlatformPluginConnectionRedirectState,
  createPlatformPluginConnectionReturnUrlState,
  disconnectPlatformPluginConnection,
  fetchPlatformGitHubRepositoryBranches,
  fetchPlatformPluginConnectionStatus,
  getPlatformPluginConnectionDefinition,
  getPlatformPluginConnectionIdentity,
  readCachedPlatformPluginConnectionStatus,
  readPlatformPluginConnectionReturnUrlState,
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
    expect(getPlatformPluginConnectionDefinition("jira")).toMatchObject({
      label: "Atlassian",
      statusPath: "/api/aios/jira/user",
      loginPath: "/api/aios/jira/login",
    });
  });

  it("uses the connected Atlassian site as its visible identity", () => {
    expect(
      getPlatformPluginConnectionIdentity("jira", {
        connected: true,
        profile: {
          siteName: "Computer Agents",
          displayName: "Jan Sandmann",
        },
      }),
    ).toBe("Computer Agents");
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

  it("loads connection status from the active organization scope", async () => {
    const request = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ connected: true, profile: { login: "octocat" } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );

    await fetchPlatformPluginConnectionStatus("github", {
      organizationId: "organization-acme",
      fetch: request,
    });

    expect(request).toHaveBeenCalledWith(
      "/api/aios/github/user?organizationId=organization-acme",
      expect.objectContaining({
        method: "GET",
        headers: {
          "X-Computer-Agents-Organization": "organization-acme",
        },
      }),
    );
  });

  it("coalesces duplicate default status reads during connector page startup", async () => {
    const request = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ connected: true, profile: { displayName: "Work Drive" } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", request);
    try {
      const [first, second] = await Promise.all([
        fetchPlatformPluginConnectionStatus("one-drive"),
        fetchPlatformPluginConnectionStatus("one-drive"),
      ]);
      expect(first).toEqual(second);
      expect(request).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("force-refreshes stale connector status and replaces the shared cache", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ connected: false, credentials: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            connected: true,
            credentials: [{ id: "box-work", name: "Work Box" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", request);
    try {
      const initial = await fetchPlatformPluginConnectionStatus("box", {
        organizationId: "organization-force-refresh",
      });
      const cached = await fetchPlatformPluginConnectionStatus("box", {
        organizationId: "organization-force-refresh",
      });
      const refreshed = await fetchPlatformPluginConnectionStatus("box", {
        organizationId: "organization-force-refresh",
        forceRefresh: true,
      });
      const refreshedCache = await fetchPlatformPluginConnectionStatus("box", {
        organizationId: "organization-force-refresh",
      });

      expect(initial.connected).toBe(false);
      expect(cached.connected).toBe(false);
      expect(refreshed.connected).toBe(true);
      expect(refreshedCache.connected).toBe(true);
      expect(request).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
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
      credentialId: "credential-work",
      credentialName: "Work GitHub",
      organizationId: "organization-acme",
      fetch: request,
    });
    await disconnectPlatformPluginConnection("github", {
      credentialId: "credential-work",
      fetch: request,
    });

    expect(started.authUrl).toContain("github.com");
    expect(request.mock.calls[0]?.[0]).toBe("/api/aios/github/login");
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual({
      redirectTo: "https://platform.example/develop/security",
      scope: "repo read:user",
      credentialId: "credential-work",
      credentialName: "Work GitHub",
      organizationId: "organization-acme",
    });
    expect(request.mock.calls[1]?.[0]).toBe("/api/aios/github/disconnect");
    expect(JSON.parse(String(request.mock.calls[1]?.[1]?.body))).toEqual({
      credentialId: "credential-work",
    });
  });

  it("starts Atlassian OAuth directly with the pending credential identity", async () => {
    const request = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            authUrl: "https://auth.atlassian.com/authorize?audience=api.atlassian.com",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );

    await beginPlatformPluginConnection("jira", {
      redirectTo: "https://platform.example/connectors/jira?tab=authentication",
      credentialId: "credential-jira-work",
      credentialName: "Work Atlassian",
      organizationId: "organization-acme",
      fetch: request,
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toBe("/api/aios/jira/login");
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual({
      redirectTo: "https://platform.example/connectors/jira?tab=authentication",
      credentialId: "credential-jira-work",
      credentialName: "Work Atlassian",
      organizationId: "organization-acme",
    });
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

  it("round-trips the exact connector authentication return target", () => {
    const savedAt = Date.parse("2026-07-29T09:30:00.000Z");
    const state = createPlatformPluginConnectionReturnUrlState(
      "github",
      {
        toolsView: "plugins",
        resourceId: "github",
        tab: "authentication",
      },
      savedAt,
    );
    const returnUrl = buildPlatformPluginConnectionReturnUrl(
      "http://localhost:4177/?existing=1",
      state,
    );

    expect(readPlatformPluginConnectionReturnUrlState(returnUrl, savedAt + 1_000)).toEqual(
      state,
    );
    const clearedUrl = new URL(clearPlatformPluginConnectionReturnUrlState(returnUrl));
    expect(clearedUrl.searchParams.get("existing")).toBe("1");
    expect(clearedUrl.searchParams.has("connectorAuthReturn")).toBe(false);
    expect(clearedUrl.searchParams.has("connectorAuthResource")).toBe(false);
  });

  it("rejects stale or malformed connector return targets", () => {
    const now = Date.parse("2026-07-29T10:00:00.000Z");
    const staleUrl = buildPlatformPluginConnectionReturnUrl(
      "https://platform.computer-agents.com/",
      createPlatformPluginConnectionReturnUrlState(
        "github",
        {
          toolsView: "tags",
          resourceId: "github",
          tab: "authentication",
        },
        now - 31 * 60 * 1_000,
      ),
    );
    const malformedUrl = new URL(staleUrl);
    malformedUrl.searchParams.set("connectorAuthSavedAt", String(now));
    malformedUrl.searchParams.set("connectorAuthView", "settings");

    expect(readPlatformPluginConnectionReturnUrlState(staleUrl, now)).toBeNull();
    expect(readPlatformPluginConnectionReturnUrlState(malformedUrl, now)).toBeNull();
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
      fetchPlatformGitHubRepositoryBranches("computer-agents/platform", {
        fetch: request,
        credentialId: "github-account-1",
        organizationId: "org-1",
      }),
    ).resolves.toEqual([
      { name: "main", protected: true },
      { name: "release/next", protected: false },
    ]);
    expect(request).toHaveBeenCalledWith(
      "/api/aios/github/repos/computer-agents/platform/branches?credentialId=github-account-1&organizationId=org-1",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "X-Computer-Agents-Organization": "org-1" },
      }),
    );
  });
});
