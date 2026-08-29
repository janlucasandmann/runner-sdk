import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJiraAuthorizationUrl,
  buildJiraAuthorizationCapabilities,
  fetchConfluenceSpaces,
  isJiraApiRequestPath,
  JIRA_OAUTH_DEFAULT_SCOPE,
  normalizeJiraToken,
  resolveJiraOAuthConfiguration,
} from "./jira-oauth.mjs";

test("matches only Jira API routes", () => {
  assert.equal(isJiraApiRequestPath("/api/jira/callback"), true);
  assert.equal(isJiraApiRequestPath("/api/aios/jira/login"), true);
  assert.equal(isJiraApiRequestPath("/api/aios/jira/user"), true);
  assert.equal(isJiraApiRequestPath("/api/aios/jira/resources"), true);
  assert.equal(isJiraApiRequestPath("/api/github/callback"), false);
  assert.equal(isJiraApiRequestPath("/jira"), false);
});

test("builds the Atlassian authorization-code request", () => {
  const url = new URL(buildJiraAuthorizationUrl({
    clientId: "jira-client",
    redirectUri: "https://platform.example.test/api/jira/callback",
    state: "oauth-state",
  }));

  assert.equal(url.origin, "https://auth.atlassian.com");
  assert.equal(url.pathname, "/authorize");
  assert.equal(url.searchParams.get("audience"), "api.atlassian.com");
  assert.equal(url.searchParams.get("client_id"), "jira-client");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://platform.example.test/api/jira/callback",
  );
  assert.equal(url.searchParams.get("state"), "oauth-state");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("scope"), JIRA_OAUTH_DEFAULT_SCOPE);
  assert.match(
    JIRA_OAUTH_DEFAULT_SCOPE,
    /(?:^|\s)read:confluence-space\.summary(?:\s|$)/,
  );
  assert.match(JIRA_OAUTH_DEFAULT_SCOPE, /(?:^|\s)search:confluence(?:\s|$)/);
  assert.doesNotMatch(
    JIRA_OAUTH_DEFAULT_SCOPE,
    /(?:^|\s)read:space:confluence(?:\s|$)/,
  );
});

test("never lets a Jira-only caller downgrade the shared Atlassian grant", () => {
  const url = new URL(buildJiraAuthorizationUrl({
    clientId: "jira-client",
    redirectUri: "https://platform.example.test/api/jira/callback",
    state: "oauth-state",
    scope: "read:jira-work",
  }));
  const scopes = new Set(url.searchParams.get("scope").split(/\s+/));
  assert.equal(scopes.has("read:jira-work"), true);
  assert.equal(scopes.has("read:confluence-space.summary"), true);
  assert.equal(scopes.has("search:confluence"), true);
  assert.equal(scopes.has("read:space:confluence"), false);
  assert.equal(scopes.has("offline_access"), true);
});

test("reports Confluence capability separately on the shared Atlassian credential", () => {
  assert.deepEqual(
    buildJiraAuthorizationCapabilities("read:jira-work"),
    {
      jira: true,
      confluence: false,
      missingScopes: [
        "read:confluence-space.summary",
        "search:confluence",
      ],
    },
  );
  assert.deepEqual(
    buildJiraAuthorizationCapabilities(
      "read:jira-work read:confluence-space.summary search:confluence",
    ),
    {
      jira: true,
      confluence: true,
      missingScopes: [],
    },
  );
});

test("recognizes the granular Confluence space grant when it is already available", () => {
  assert.deepEqual(
    buildJiraAuthorizationCapabilities(
      "read:jira-work read:space:confluence",
    ),
    {
      jira: true,
      confluence: true,
      missingScopes: [],
    },
  );
});

test("loads Confluence spaces from the product-scoped v2 catalog", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return new Response(JSON.stringify({
      results: [
        { id: "space-1", key: "ENG", name: "Engineering" },
      ],
      _links: {},
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    assert.deepEqual(
      await fetchConfluenceSpaces("access-token", "cloud-123"),
      [{ id: "space-1", key: "ENG", name: "Engineering" }],
    );
    assert.equal(requests.length, 1);
    assert.match(requests[0], /\/ex\/confluence\/cloud-123\/wiki\/api\/v2\/spaces/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("falls back to classic-scope CQL space discovery for an existing grant", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    const requestUrl = String(input);
    requests.push(requestUrl);
    if (requestUrl.includes("/wiki/api/v2/spaces")) {
      return new Response(JSON.stringify({ message: "OAuth scope missing" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (requestUrl.includes("/wiki/rest/api/search")) {
      return new Response(JSON.stringify({
        results: [
          {
            content: {
              space: { id: "space-7", key: "DOC", name: "Docs" },
            },
          },
          {
            space: { id: "space-7", key: "DOC", name: "Docs" },
          },
          {
            content: {
              space: { id: "space-8", key: "ENG", name: "Engineering" },
            },
          },
        ],
        _links: {},
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`Unexpected request: ${requestUrl}`);
  };

  try {
    assert.deepEqual(
      await fetchConfluenceSpaces("classic-access-token", "cloud-456"),
      [
        { id: "space-7", key: "DOC", name: "Docs" },
        { id: "space-8", key: "ENG", name: "Engineering" },
      ],
    );
    assert.equal(requests.length, 2);
    assert.match(requests[1], /\/wiki\/rest\/api\/search/);
    assert.match(requests[1], /cql=type(?:\+|%20)in/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("uses the classic catalog directly when the stored scope is known", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    const requestUrl = String(input);
    requests.push(requestUrl);
    return new Response(JSON.stringify({
      results: [
        {
          content: {
            space: { id: "space-9", key: "OPS", name: "Operations" },
          },
        },
      ],
      _links: {},
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    assert.deepEqual(
      await fetchConfluenceSpaces("classic-access-token", "cloud-999", {
        scope: "read:confluence-space.summary search:confluence",
      }),
      [{ id: "space-9", key: "OPS", name: "Operations" }],
    );
    assert.equal(requests.length, 1);
    assert.match(requests[0], /\/wiki\/rest\/api\/search/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("requires reauthorization only when both Confluence catalogs reject the grant", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    const requestUrl = String(input);
    requests.push(requestUrl);
    return new Response(JSON.stringify({ message: "OAuth scope missing" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await assert.rejects(
      fetchConfluenceSpaces("invalid-access-token", "cloud-789"),
      (error) => error?.code === "jira_reauthorization_required"
        && error?.status === 428
        && /Reconnect Atlassian/.test(error?.message),
    );
    assert.equal(requests.length, 2);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("preserves the existing Jira refresh token when Atlassian omits a replacement", () => {
  const token = normalizeJiraToken({
    access_token: "refreshed-access-token",
    expires_in: 3600,
  }, {
    cloudId: "cloud-123",
    refreshToken: "existing-refresh-token",
  });

  assert.equal(token.accessToken, "refreshed-access-token");
  assert.equal(token.refreshToken, "existing-refresh-token");
  assert.equal(token.cloudId, "cloud-123");
});

test("resolves a complete Atlassian OAuth client through supported aliases", async () => {
  const keys = [
    "JIRA_OAUTH_CLIENT_ID",
    "JIRA_OAUTH_CLIENT_SECRET",
    "JIRA_OAUTH_REDIRECT_URI",
    "ATLASSIAN_OAUTH_CLIENT_ID",
    "ATLASSIAN_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_OAUTH_REDIRECT_URI",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => delete process.env[key]);
  process.env.ATLASSIAN_OAUTH_CLIENT_ID = "atlassian-client";
  process.env.ATLASSIAN_OAUTH_CLIENT_SECRET = "atlassian-secret";
  process.env.ATLASSIAN_OAUTH_REDIRECT_URI =
    "https://platform.example.test/api/jira/callback";

  try {
    const configuration = await resolveJiraOAuthConfiguration({
      platformOrigin: "https://ignored.example.test",
    });
    assert.equal(configuration.configured, true);
    assert.equal(configuration.clientId, "atlassian-client");
    assert.equal(configuration.clientSecret, "atlassian-secret");
    assert.equal(
      configuration.redirectUri,
      "https://platform.example.test/api/jira/callback",
    );
    assert.deepEqual(configuration.missing, []);
  } finally {
    keys.forEach((key) => {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    });
  }
});

test("reports every missing Jira OAuth credential before authorization starts", async () => {
  const keys = [
    "JIRA_OAUTH_CLIENT_ID",
    "JIRA_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_OAUTH_CLIENT_ID",
    "ATLASSIAN_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_CLIENT_ID",
    "ATLASSIAN_CLIENT_SECRET",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => delete process.env[key]);

  try {
    const configuration = await resolveJiraOAuthConfiguration({
      platformOrigin: "http://localhost:4177",
    });
    assert.equal(configuration.configured, false);
    assert.deepEqual(configuration.missing, [
      "JIRA_OAUTH_CLIENT_ID",
      "JIRA_OAUTH_CLIENT_SECRET",
    ]);
    assert.equal(
      configuration.redirectUri,
      "http://localhost:4177/api/jira/callback",
    );
  } finally {
    keys.forEach((key) => {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    });
  }
});
