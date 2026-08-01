import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchGithubJson,
  validateGithubCredential,
} from "./github-api-client.mjs";

test("GitHub API requests use the supported API contract", async () => {
  let request = null;
  const profile = await fetchGithubJson("/user", "github-token", {
    fetchImpl: async (target, init) => {
      request = { target: target.toString(), init };
      return new Response(JSON.stringify({ login: "computer-agents" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  assert.equal(request.target, "https://api.github.com/user");
  assert.equal(request.init.headers.Authorization, "Bearer github-token");
  assert.equal(request.init.headers["X-GitHub-Api-Version"], "2022-11-28");
  assert.equal(profile.login, "computer-agents");
});

test("GitHub credential validation distinguishes revocation from outages", async () => {
  const invalid = await validateGithubCredential("revoked-token", {
    fetchImpl: async () => new Response(
      JSON.stringify({ message: "Bad credentials" }),
      { status: 401 },
    ),
  });
  const unavailable = await validateGithubCredential("stored-token", {
    fetchImpl: async () => {
      throw new Error("temporary network failure");
    },
  });

  assert.equal(invalid.state, "invalid");
  assert.equal(invalid.error.status, 401);
  assert.equal(unavailable.state, "unavailable");
});

test("GitHub API requests cannot be redirected to an untrusted host", async () => {
  await assert.rejects(
    fetchGithubJson("https://example.com/user", "github-token", {
      fetchImpl: async () => new Response("{}"),
    }),
    /api\.github\.com/,
  );
});
