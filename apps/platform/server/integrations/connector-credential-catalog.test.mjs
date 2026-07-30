import assert from "node:assert/strict";
import test from "node:test";

import {
  createConnectorCredentialCatalogService,
} from "./connector-credential-catalog.mjs";

function createResponseRecorder() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body = "") {
      this.body = String(body || "");
    },
  };
}

function waitForResponse(res) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      if (res.statusCode) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startedAt > 1_000) {
        clearInterval(interval);
        reject(new Error("Timed out waiting for response."));
      }
    }, 2);
  });
}

test("lists safe organization credential metadata for active members", async () => {
  const listCalls = [];
  const organizationCalls = [];
  const service = createConnectorCredentialCatalogService({
    identityService: {
      async readPrincipal() {
        return { uid: "user_1" };
      },
    },
    async fetchSessionApi() {
      throw new Error("The direct session route must not be used.");
    },
    async fetchOrganizationApi(_req, path) {
      organizationCalls.push(path);
      return new Response(JSON.stringify({
        organizations: [{ id: "org_1", role: "member" }],
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    async listCredentials(options) {
      listCalls.push(options);
      return [{
        id: "cred_1",
        provider: "jira",
        name: "Work Atlassian",
        identity: "user@example.com",
        status: "valid",
        isDefault: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        ownerUserId: "must-not-leak",
        token: "must-not-leak",
      }];
    },
    logger: null,
  });
  const req = {
    method: "GET",
    headers: {
      "x-computer-agents-organization": "org_1",
    },
  };
  const res = createResponseRecorder();
  const url = new URL(
    "http://localhost/api/aios/organizations/org_1/connector-credentials?provider=atlassian",
  );

  assert.equal(service.handleRequest(req, res, url), true);
  await waitForResponse(res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(organizationCalls, ["/organizations"]);
  assert.deepEqual(listCalls, [{
    organizationId: "org_1",
    provider: "jira",
    envFileCandidates: [],
  }]);
  const payload = JSON.parse(res.body);
  assert.equal(payload.credentials[0].id, "cred_1");
  assert.equal(payload.credentials[0].ownerUserId, undefined);
  assert.equal(payload.credentials[0].token, undefined);
});

test("lists every connected provider for project-scoped credential routing", async () => {
  const providerListCalls = [];
  const service = createConnectorCredentialCatalogService({
    identityService: {
      async readPrincipal() {
        return { uid: "user_1" };
      },
    },
    async fetchSessionApi() {
      return new Response(JSON.stringify({
        organizations: [{ id: "org_1", role: "developer" }],
      }), { status: 200 });
    },
    async listCredentialProviders(options) {
      providerListCalls.push(options);
      return [
        {
          provider: "jira",
          credentials: [{
            id: "jira_credential",
            name: "Delivery Atlassian",
            identity: "delivery@example.com",
            status: "valid",
            isDefault: true,
            accessToken: "must-not-leak",
          }],
        },
        {
          provider: "github",
          credentials: [{
            id: "github_credential",
            name: "Engineering GitHub",
            identity: "computer-agents",
            status: "valid",
            isDefault: true,
            refreshToken: "must-not-leak",
          }],
        },
      ];
    },
    logger: null,
  });
  const req = {
    method: "GET",
    headers: {
      "x-computer-agents-organization": "org_1",
    },
  };
  const res = createResponseRecorder();
  const url = new URL(
    "http://localhost/api/aios/organizations/org_1/connector-credentials",
  );

  assert.equal(service.handleRequest(req, res, url), true);
  await waitForResponse(res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(providerListCalls, [{
    organizationId: "org_1",
    envFileCandidates: [],
  }]);
  const payload = JSON.parse(res.body);
  assert.deepEqual(
    payload.providers.map((provider) => provider.provider),
    ["github", "jira"],
  );
  assert.equal(payload.providers[0].credentials[0].refreshToken, undefined);
  assert.equal(payload.providers[1].credentials[0].accessToken, undefined);
});

test("rejects credential discovery outside the active organization", async () => {
  let listed = false;
  const service = createConnectorCredentialCatalogService({
    identityService: {
      async readPrincipal() {
        return { uid: "user_1" };
      },
    },
    async fetchSessionApi() {
      return new Response(JSON.stringify({
        organizations: [{ id: "org_2", role: "member" }],
      }), { status: 200 });
    },
    async listCredentials() {
      listed = true;
      return [];
    },
    logger: null,
  });
  const req = {
    method: "GET",
    headers: {
      "x-computer-agents-organization": "org_1",
    },
  };
  const res = createResponseRecorder();
  const url = new URL(
    "http://localhost/api/aios/organizations/org_1/connector-credentials?provider=jira",
  );

  assert.equal(service.handleRequest(req, res, url), true);
  await waitForResponse(res);

  assert.equal(res.statusCode, 403);
  assert.equal(listed, false);
});

test("returns an authentication response when the principal cannot be read", async () => {
  let listed = false;
  const service = createConnectorCredentialCatalogService({
    identityService: {
      async readPrincipal() {
        throw new Error("Missing ID token");
      },
    },
    async fetchSessionApi() {
      throw new Error("Session API should not be called.");
    },
    async listCredentials() {
      listed = true;
      return [];
    },
    logger: null,
  });
  const req = {
    method: "GET",
    headers: {
      "x-computer-agents-organization": "org_1",
    },
  };
  const res = createResponseRecorder();
  const url = new URL(
    "http://localhost/api/aios/organizations/org_1/connector-credentials",
  );

  assert.equal(service.handleRequest(req, res, url), true);
  await waitForResponse(res);

  assert.equal(res.statusCode, 401);
  assert.equal(listed, false);
  assert.deepEqual(JSON.parse(res.body), {
    error: "authentication_required",
    message: "Sign in to view connector credentials.",
  });
});
