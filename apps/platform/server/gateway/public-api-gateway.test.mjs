import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { createPublicApiGateway } from "./public-api-gateway.mjs";

const WEBHOOK_HEADER_NAMES = [
  "x-github-event",
  "x-gitlab-event",
  "x-gitlab-token",
  "x-hub-signature-256",
  "x-slack-request-timestamp",
  "x-slack-signature",
  "x-webhook-event",
  "x-webhook-signature",
];

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("public API gateway pins the control origin and strips browser-only headers", async (t) => {
  const upstreamCalls = [];
  const upstreamServer = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    upstreamCalls.push({
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: Buffer.concat(chunks).toString("utf8"),
    });
    response.writeHead(202, {
      "content-type": "application/json",
      "set-cookie": "control-secret=must-not-leak",
      "x-request-id": "request_1",
    });
    response.write('{"accepted":');
    response.end("true}");
  });
  const upstreamOrigin = await listen(upstreamServer);
  t.after(() => new Promise((resolve) => upstreamServer.close(resolve)));

  const gateway = createPublicApiGateway({
    defaultUpstreamOrigin: `${upstreamOrigin}/v1`,
    deploymentTopology: "on_prem",
  });
  assert.equal(gateway.publicApiEnabled, true);
  const platformServer = http.createServer((request, response) => {
    const url = new URL(request.url || "/", "http://platform.test");
    if (url.pathname === "/v1" || url.pathname.startsWith("/v1/")) {
      void gateway.proxyPublicApiRequest(request, response, url);
      return;
    }
    response.writeHead(404).end();
  });
  const platformOrigin = await listen(platformServer);
  t.after(() => new Promise((resolve) => platformServer.close(resolve)));

  const response = await fetch(`${platformOrigin}/v1/threads?limit=2`, {
    method: "POST",
    headers: {
      authorization: "Bearer public-client-token",
      cookie: "computer_agents_session=browser-only",
      "content-type": "application/json",
      "x-api-key": "tb_public-client-key",
      "x-computer-agents-organization": "org_1",
      "x-runner-upstream-url": "https://attacker.invalid/v1",
    },
    body: JSON.stringify({ prompt: "hello" }),
  });

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { accepted: true });
  assert.equal(response.headers.get("x-request-id"), "request_1");
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(upstreamCalls.length, 1);
  assert.equal(upstreamCalls[0].method, "POST");
  assert.equal(upstreamCalls[0].url, "/v1/threads?limit=2");
  assert.equal(upstreamCalls[0].headers.authorization, "Bearer public-client-token");
  assert.equal(upstreamCalls[0].headers["x-api-key"], "tb_public-client-key");
  assert.equal(upstreamCalls[0].headers["x-computer-agents-organization"], "org_1");
  assert.equal(upstreamCalls[0].headers.cookie, undefined);
  assert.equal(upstreamCalls[0].headers["x-runner-upstream-url"], undefined);
  assert.deepEqual(JSON.parse(upstreamCalls[0].body), { prompt: "hello" });
});

test("public API gateway forwards signature headers only for webhook deliveries", async (t) => {
  const upstreamCalls = [];
  const upstreamServer = http.createServer(async (request, response) => {
    for await (const _chunk of request) {
      // Drain the request body before responding.
    }
    upstreamCalls.push({ url: request.url, headers: request.headers });
    response.writeHead(204).end();
  });
  const upstreamOrigin = await listen(upstreamServer);
  t.after(() => new Promise((resolve) => upstreamServer.close(resolve)));

  const gateway = createPublicApiGateway({
    defaultUpstreamOrigin: `${upstreamOrigin}/v1`,
    deploymentTopology: "on_prem",
  });
  const platformServer = http.createServer((request, response) => {
    const url = new URL(request.url || "/", "http://platform.test");
    void gateway.proxyPublicApiRequest(request, response, url);
  });
  const platformOrigin = await listen(platformServer);
  t.after(() => new Promise((resolve) => platformServer.close(resolve)));

  const headers = {
    authorization: "Bearer must-not-reach-webhook",
    "content-type": "application/json",
    "x-api-key": "must-not-reach-webhook",
    "x-computer-agents-organization": "must-not-reach-webhook",
    "x-github-event": "push",
    "x-gitlab-event": "Push Hook",
    "x-gitlab-token": "gitlab-token",
    "x-hub-signature-256": `sha256=${"a".repeat(64)}`,
    "x-slack-request-timestamp": "1788041000",
    "x-slack-signature": `v0=${"b".repeat(64)}`,
    "x-webhook-event": "acceptance",
    "x-webhook-signature": `sha256=${"c".repeat(64)}`,
  };

  const webhookResponse = await fetch(`${platformOrigin}/v1/webhooks/triggers/trig_1`, {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.equal(webhookResponse.status, 204);

  const ordinaryResponse = await fetch(`${platformOrigin}/v1/threads`, {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.equal(ordinaryResponse.status, 204);

  assert.equal(upstreamCalls.length, 2);
  const webhookCall = upstreamCalls[0];
  assert.equal(webhookCall.url, "/v1/webhooks/triggers/trig_1");
  for (const name of WEBHOOK_HEADER_NAMES) {
    assert.equal(webhookCall.headers[name], headers[name]);
  }
  assert.equal(webhookCall.headers.authorization, undefined);
  assert.equal(webhookCall.headers["x-api-key"], undefined);
  assert.equal(webhookCall.headers["x-computer-agents-organization"], undefined);

  const ordinaryCall = upstreamCalls[1];
  assert.equal(ordinaryCall.url, "/v1/threads");
  assert.equal(ordinaryCall.headers.authorization, headers.authorization);
  assert.equal(ordinaryCall.headers["x-api-key"], headers["x-api-key"]);
  assert.equal(ordinaryCall.headers["x-computer-agents-organization"], headers["x-computer-agents-organization"]);
  for (const name of WEBHOOK_HEADER_NAMES) {
    assert.equal(ordinaryCall.headers[name], undefined);
  }
});
