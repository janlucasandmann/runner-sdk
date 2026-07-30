import assert from "node:assert/strict";
import test from "node:test";

import { createDropboxConnectorAdapter } from "./dropbox-connector-adapter.mjs";

const NOW = 1_800_000_000_000;

function credential(token = {}) {
  return {
    credentialId: "credential_dropbox",
    credentialOwnerId: "user_owner",
    organizationId: "org_test",
    name: "Dropbox workspace",
    identity: "owner@example.com",
    profile: { account_id: "dbid:test" },
    token: {
      accessToken: "dropbox-access-token",
      refreshToken: "dropbox-refresh-token",
      scope:
        "account_info.read files.metadata.read files.content.read sharing.read " +
        "files.metadata.write files.content.write sharing.write",
      expiresAt: NOW + 60 * 60 * 1000,
      ...token,
    },
  };
}

function grant() {
  return {
    organizationId: "org_test",
    credentialId: "credential_dropbox",
  };
}

test("Dropbox adapter lists folders with the selected organization credential", async () => {
  const requests = [];
  const resolved = [];
  const adapter = createDropboxConnectorAdapter({
    now: () => NOW,
    async resolveCredential(input) {
      resolved.push(input);
      return credential();
    },
    async persistCredential() {
      throw new Error("not used");
    },
    async getEnvironmentValue() {
      throw new Error("not used");
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      return jsonResponse({
        entries: [{ ".tag": "file", name: "report.pdf" }],
        cursor: "next-page",
        has_more: false,
      });
    },
  });

  const result = await adapter.invoke({
    grant: grant(),
    name: "list_folder",
    arguments: {
      path: "Research",
      limit: 25,
      recursive: true,
    },
  });

  assert.deepEqual(resolved[0], {
    provider: "dropbox",
    organizationId: "org_test",
    credentialId: "credential_dropbox",
    envFileCandidates: [],
    encryptionKeyNames: ["DROPBOX_TOKEN_ENCRYPTION_KEY", "CONNECTOR_TOKEN_ENCRYPTION_KEY"],
  });
  assert.equal(requests[0].url, "https://api.dropboxapi.com/2/files/list_folder");
  assert.equal(requests[0].init.headers.Authorization, "Bearer dropbox-access-token");
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    path: "/Research",
    limit: 25,
    recursive: true,
  });
  assert.equal(result.entries[0].name, "report.pdf");
});

test("Dropbox adapter refreshes expiring access tokens and persists the replacement", async () => {
  const requests = [];
  const persisted = [];
  const adapter = createDropboxConnectorAdapter({
    now: () => NOW,
    async resolveCredential() {
      return credential({ expiresAt: NOW + 30_000 });
    },
    async persistCredential(input) {
      persisted.push(input);
    },
    async getEnvironmentValue(name) {
      return (
        {
          DROPBOX_OAUTH_CLIENT_ID: "dropbox-app-key",
          DROPBOX_OAUTH_CLIENT_SECRET: "dropbox-app-secret",
        }[name] || ""
      );
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      if (String(url) === "https://api.dropboxapi.com/oauth2/token") {
        return jsonResponse({
          access_token: "refreshed-access-token",
          expires_in: 14400,
          token_type: "bearer",
          scope: "account_info.read files.metadata.read",
        });
      }
      assert.equal(init.headers.Authorization, "Bearer refreshed-access-token");
      return jsonResponse({
        account_id: "dbid:test",
        email: "owner@example.com",
      });
    },
  });

  const result = await adapter.invoke({
    grant: grant(),
    name: "get_current_account",
    arguments: {},
  });

  const refreshBody = new URLSearchParams(requests[0].init.body);
  assert.equal(refreshBody.get("grant_type"), "refresh_token");
  assert.equal(refreshBody.get("refresh_token"), "dropbox-refresh-token");
  assert.equal(refreshBody.get("client_id"), "dropbox-app-key");
  assert.equal(refreshBody.get("client_secret"), "dropbox-app-secret");
  assert.equal(requests[1].url, "https://api.dropboxapi.com/2/users/get_current_account");
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].provider, "dropbox");
  assert.equal(persisted[0].uid, "user_owner");
  assert.equal(persisted[0].token.accessToken, "refreshed-access-token");
  assert.equal(persisted[0].token.refreshToken, "dropbox-refresh-token");
  assert.equal(persisted[0].token.expiresAt, NOW + 14_400_000);
  assert.equal(result.email, "owner@example.com");
});

test("Dropbox adapter returns downloaded binary content and response metadata", async () => {
  const requests = [];
  const adapter = createDropboxConnectorAdapter({
    now: () => NOW,
    async resolveCredential() {
      return credential();
    },
    async persistCredential() {
      throw new Error("not used");
    },
    async getEnvironmentValue() {
      throw new Error("not used");
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      return new Response(Buffer.from("hello Dropbox", "utf8"), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Dropbox-API-Result": JSON.stringify({
            name: "Résumé.txt",
            rev: "rev-1",
          }),
        },
      });
    },
  });

  const result = await adapter.invoke({
    grant: grant(),
    name: "download_file",
    arguments: { path: "/Résumé.txt" },
  });

  assert.equal(requests[0].url, "https://content.dropboxapi.com/2/files/download");
  assert.equal(requests[0].init.headers["Dropbox-API-Arg"], '{"path":"/R\\u00e9sum\\u00e9.txt"}');
  assert.equal(result.metadata.name, "Résumé.txt");
  assert.equal(result.text, "hello Dropbox");
  assert.equal(Buffer.from(result.contentBase64, "base64").toString("utf8"), "hello Dropbox");
});

test("Dropbox adapter uploads supplied base64 content with revision-safe update mode", async () => {
  const requests = [];
  const adapter = createDropboxConnectorAdapter({
    now: () => NOW,
    async resolveCredential() {
      return credential();
    },
    async persistCredential() {
      throw new Error("not used");
    },
    async getEnvironmentValue() {
      throw new Error("not used");
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      return jsonResponse({
        ".tag": "file",
        name: "report.txt",
        rev: "new-revision",
      });
    },
  });

  const result = await adapter.invoke({
    grant: grant(),
    name: "upload_file",
    arguments: {
      path: "Reports/report.txt",
      contentBase64: Buffer.from("updated report").toString("base64"),
      mode: "update",
      revision: "old-revision",
    },
  });

  assert.equal(requests[0].url, "https://content.dropboxapi.com/2/files/upload");
  assert.deepEqual(JSON.parse(requests[0].init.headers["Dropbox-API-Arg"]), {
    path: "/Reports/report.txt",
    mode: { ".tag": "update", update: "old-revision" },
    autorename: false,
    mute: false,
  });
  assert.equal(Buffer.from(requests[0].init.body).toString(), "updated report");
  assert.equal(result.rev, "new-revision");
});

test("Dropbox adapter resolves existing shared links idempotently", async () => {
  const requests = [];
  const adapter = createDropboxConnectorAdapter({
    now: () => NOW,
    async resolveCredential() {
      return credential();
    },
    async persistCredential() {
      throw new Error("not used");
    },
    async getEnvironmentValue() {
      throw new Error("not used");
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      if (requests.length === 1) {
        return jsonResponse(
          {
            error_summary: "shared_link_already_exists/...",
            error: {
              ".tag": "shared_link_already_exists",
            },
          },
          409,
        );
      }
      return jsonResponse({
        links: [
          {
            ".tag": "file",
            url: "https://www.dropbox.com/s/example",
          },
        ],
      });
    },
  });

  const result = await adapter.invoke({
    grant: grant(),
    name: "create_shared_link",
    arguments: {
      path: "/Reports/report.txt",
      audience: "team",
      access: "viewer",
      allowDownload: false,
    },
  });

  assert.deepEqual(JSON.parse(requests[0].init.body), {
    path: "/Reports/report.txt",
    settings: {
      audience: "team",
      access: "viewer",
      allow_download: false,
    },
  });
  assert.equal(requests[1].url, "https://api.dropboxapi.com/2/sharing/list_shared_links");
  assert.equal(result.url, "https://www.dropbox.com/s/example");
});

test("Dropbox adapter exposes its complete capability catalog", () => {
  const adapter = createDropboxConnectorAdapter({
    async resolveCredential() {
      throw new Error("not used");
    },
    async persistCredential() {
      throw new Error("not used");
    },
    async getEnvironmentValue() {
      throw new Error("not used");
    },
    async fetchImpl() {
      throw new Error("not used");
    },
  });

  assert.deepEqual(
    adapter.listTools(["get_current_account", "upload_file", "not_real"]).map((tool) => tool.name),
    ["get_current_account", "upload_file"],
  );
  assert.deepEqual(adapter.listCapabilities(), [
    { id: "get_current_account", access: "read-only" },
    { id: "list_folder", access: "read-only" },
    { id: "search_files", access: "read-only" },
    { id: "get_metadata", access: "read-only" },
    { id: "download_file", access: "read-only" },
    { id: "list_revisions", access: "read-only" },
    { id: "upload_file", access: "interactive" },
    { id: "create_folder", access: "interactive" },
    { id: "move_item", access: "interactive" },
    { id: "delete_item", access: "interactive" },
    { id: "create_shared_link", access: "interactive" },
  ]);
});

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
