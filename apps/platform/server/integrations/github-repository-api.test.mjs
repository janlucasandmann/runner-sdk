import assert from "node:assert/strict";
import test from "node:test";

import {
  handleGithubRepositoryCreate,
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
  const loadedCredentials = [];
  const fixture = createDependencies({
    loadGithubToken: async (...args) => {
      loadedCredentials.push(args);
      return {
        accessToken: "github-token",
        credentialId: "credential-work",
      };
    },
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
      "https://platform.example/api/github/repos?per_page=500&page=0&search=runner&credentialId=credential-work",
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
  assert.deepEqual(loadedCredentials, [["user-1", [], "credential-work"]]);
});

test("Function repository creation commits the complete source tree on main", async () => {
  let blobIndex = 0;
  const fixture = createDependencies({
    fetchImpl: async (url, init) => {
      fixture.calls.push({ url, init });
      const pathname = new URL(url).pathname;
      if (pathname === "/user/repos") {
        return createJsonResponse({
          id: 42,
          name: "billing-function",
          full_name: "computer-agents/billing-function",
          owner: { login: "computer-agents" },
          default_branch: "main",
        }, 201);
      }
      if (pathname.endsWith("/git/blobs")) {
        blobIndex += 1;
        return createJsonResponse({ sha: `blob-${blobIndex}` }, 201);
      }
      if (pathname.endsWith("/git/trees")) {
        return createJsonResponse({ sha: "tree-1" }, 201);
      }
      if (pathname.endsWith("/git/commits")) {
        return createJsonResponse({ sha: "commit-1" }, 201);
      }
      if (pathname.endsWith("/git/refs/heads/main")) {
        return createJsonResponse({ ref: "refs/heads/main" }, 201);
      }
      if (pathname === "/repos/computer-agents/billing-function") {
        return createJsonResponse({ default_branch: "main" });
      }
      return createJsonResponse({ message: "Not found" }, 404);
    },
  });

  const result = await handleGithubRepositoryCreate({
    ...fixture.dependencies,
    url: new URL("https://platform.example/api/github/repos?credentialId=credential-work"),
    body: {
      name: "Billing Function",
      description: "Processes billing events.",
      functionId: "function_billing1234",
      files: [
        { path: "index.js", content: "export default () => 'ok';" },
        { path: "package.json", content: "{\"type\":\"module\"}" },
      ],
    },
  });

  assert.equal(result.status, 201);
  assert.equal(result.payload.repo.full_name, "computer-agents/billing-function");
  assert.equal(result.payload.repo.default_branch, "main");
  assert.equal(result.payload.seededFileCount, 2);
  const createRequest = fixture.calls.find(({ url }) => new URL(url).pathname === "/user/repos");
  assert.deepEqual(JSON.parse(createRequest.init.body), {
    name: "billing-function",
    description: "Processes billing events.",
    private: true,
    auto_init: true,
  });
  const blobRequests = fixture.calls.filter(({ url }) => new URL(url).pathname.endsWith("/git/blobs"));
  assert.equal(blobRequests.length, 2);
  assert.deepEqual(
    blobRequests.map(({ init }) => Buffer.from(JSON.parse(init.body).content, "base64").toString("utf8")),
    ["export default () => 'ok';", "{\"type\":\"module\"}"],
  );
  const treeRequest = fixture.calls.find(({ url }) => new URL(url).pathname.endsWith("/git/trees"));
  assert.deepEqual(JSON.parse(treeRequest.init.body).tree, [
    { path: "index.js", mode: "100644", type: "blob", sha: "blob-1" },
    { path: "package.json", mode: "100644", type: "blob", sha: "blob-2" },
  ]);
  const refRequest = fixture.calls.find(({ url }) =>
    new URL(url).pathname.endsWith("/git/refs/heads/main"));
  assert.equal(refRequest.init.method, "PATCH");
  assert.deepEqual(JSON.parse(refRequest.init.body), {
    sha: "commit-1",
    force: true,
  });
});

test("Function repository creation rejects unsafe source paths before contacting GitHub", async () => {
  const fixture = createDependencies();
  const result = await handleGithubRepositoryCreate({
    ...fixture.dependencies,
    url: new URL("https://platform.example/api/github/repos"),
    body: {
      name: "Unsafe Function",
      files: [{ path: "../secret.txt", content: "secret" }],
    },
  });

  assert.equal(result.status, 400);
  assert.match(result.payload.error, /safe relative path/i);
  assert.equal(fixture.calls.length, 0);
});

test("repository detail normalizes README content and sorts directories first", async () => {
  const loadedCredentials = [];
  const fixture = createDependencies({
    loadGithubToken: async (...args) => {
      loadedCredentials.push(args);
      return {
        accessToken: "github-token",
        credentialId: "credential-work",
      };
    },
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
    url: new URL("https://platform.example/api/github/repos/computer/runner?credentialId=credential-work"),
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
  assert.deepEqual(loadedCredentials, [
    ["user-1", [], "credential-work"],
    ["user-1", [], ""],
  ]);
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
