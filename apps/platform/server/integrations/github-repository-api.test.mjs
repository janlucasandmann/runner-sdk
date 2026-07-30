import assert from "node:assert/strict";
import test from "node:test";

import {
  handleGithubRepositories,
  handleGithubRepositoryDetail,
} from "./github-repository-api.mjs";

const createJsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? "OK" : "Request failed",
  text: async () => JSON.stringify(payload),
});

const createDependencies = (overrides = {}) => {
  const calls = [];
  const deleted = [];
  return {
    calls,
    deleted,
    dependencies: {
      req: {},
      res: {},
      envFileCandidates: [],
      allowedOrigins: [],
      verifyRequestUser: async () => ({ uid: "user-1" }),
      loadGithubToken: async () => ({
        accessToken: "github-token",
        credentialId: "credential-1",
      }),
      deleteGithubToken: async (...args) => deleted.push(args),
      sendJson: (_req, _res, status, payload) => ({ status, payload }),
      fetchImpl: async (url, init) => {
        calls.push({ url, init });
        return createJsonResponse([]);
      },
      ...overrides,
    },
  };
};

test("repository listing clamps pagination and filters returned repositories", async () => {
  const fixture = createDependencies({
    fetchImpl: async (url, init) => {
      fixture.calls.push({ url, init });
      return createJsonResponse([
        { name: "runner-web-sdk", full_name: "computer-agents/runner-web-sdk" },
        { name: "landing", full_name: "computer-agents/landing" },
      ]);
    },
  });
  const result = await handleGithubRepositories({
    ...fixture.dependencies,
    url: new URL(
      "https://platform.example/api/github/repos?per_page=500&page=0&search=runner",
    ),
  });

  assert.equal(result.status, 200);
  assert.equal(result.payload.repos.length, 1);
  assert.equal(result.payload.repos[0].name, "runner-web-sdk");
  assert.deepEqual(result.payload.pagination, {
    page: 1,
    perPage: 100,
    count: 1,
  });
  const requestUrl = new URL(fixture.calls[0].url);
  assert.equal(requestUrl.pathname, "/user/repos");
  assert.equal(requestUrl.searchParams.get("per_page"), "100");
  assert.equal(
    fixture.calls[0].init.headers.Authorization,
    "Bearer github-token",
  );
});

test("repository detail normalizes README content and sorts directories first", async () => {
  const fixture = createDependencies({
    fetchImpl: async (url, init) => {
      fixture.calls.push({ url, init });
      if (url.endsWith("/readme")) {
        return createJsonResponse({
          encoding: "base64",
          content: Buffer.from("# Repository").toString("base64"),
        });
      }
      if (url.includes("/contents")) {
        return createJsonResponse([
          { type: "file", name: "z.txt" },
          { type: "dir", name: "src" },
          { type: "file", name: "a.txt" },
        ]);
      }
      return createJsonResponse({ name: "runner-web-sdk" });
    },
  });

  const detail = await handleGithubRepositoryDetail({
    ...fixture.dependencies,
    url: new URL("https://platform.example/api/github/repos/computer/runner"),
    normalizedPathname: "/api/github/repos/computer/runner",
  });
  assert.equal(detail.status, 200);
  assert.equal(detail.payload.readme, "# Repository");

  const contents = await handleGithubRepositoryDetail({
    ...fixture.dependencies,
    url: new URL(
      "https://platform.example/api/github/repos/computer/runner/contents?path=src/lib&ref=main",
    ),
    normalizedPathname: "/api/github/repos/computer/runner/contents",
  });
  assert.deepEqual(
    contents.payload.contents.map((entry) => entry.name),
    ["src", "a.txt", "z.txt"],
  );
  assert.ok(
    fixture.calls.some(({ url }) =>
      url.endsWith("/contents/src/lib?ref=main")),
  );
});

test("download responses include MIME metadata and revoked tokens are deleted", async () => {
  const downloadFixture = createDependencies({
    fetchImpl: async (url, init) => {
      downloadFixture.calls.push({ url, init });
      return createJsonResponse({
        name: "config.json",
        path: "config/config.json",
        content: "e30=",
        encoding: "base64",
        size: 2,
        sha: "sha-1",
      });
    },
  });
  const download = await handleGithubRepositoryDetail({
    ...downloadFixture.dependencies,
    url: new URL(
      "https://platform.example/api/github/repos/computer/runner/download?path=config/config.json",
    ),
    normalizedPathname: "/api/github/repos/computer/runner/download",
  });
  assert.equal(download.status, 200);
  assert.equal(download.payload.mimeType, "application/json");

  const revokedFixture = createDependencies({
    fetchImpl: async () => createJsonResponse({ message: "Bad credentials" }, 401),
  });
  const revoked = await handleGithubRepositories({
    ...revokedFixture.dependencies,
    url: new URL("https://platform.example/api/github/repos"),
  });
  assert.equal(revoked.status, 401);
  assert.equal(revoked.payload.error, "GitHub token revoked");
  assert.deepEqual(revokedFixture.deleted, [
    ["user-1", [], "credential-1"],
  ]);
});
