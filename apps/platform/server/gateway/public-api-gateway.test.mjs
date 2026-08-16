import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { createPublicApiGateway } from "./public-api-gateway.mjs";

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
