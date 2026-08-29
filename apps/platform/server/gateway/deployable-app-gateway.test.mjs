import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { once } from "node:events";
import { WebSocket, WebSocketServer } from "ws";

import {
  createDeployableAppGateway,
  isDeployableAppRequestPath,
  sanitizeDeployableAppProxyHeaders,
} from "./deployable-app-gateway.mjs";

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function close(server) {
  if (!server.listening) return;
  server.close();
  await once(server, "close");
}

test("deployable application path matching is narrow", () => {
  assert.equal(isDeployableAppRequestPath("/runtime/apps/srv_123"), true);
  assert.equal(isDeployableAppRequestPath("/runtime/apps/srv_123/assets/app.js?q=1"), true);
  assert.equal(isDeployableAppRequestPath("/runtime/apps"), false);
  assert.equal(isDeployableAppRequestPath("/api/runtime/apps/srv_123"), false);
});

test("deployable application proxy headers reject platform credentials", () => {
  assert.deepEqual(sanitizeDeployableAppProxyHeaders({
    authorization: "Bearer caller-key",
    cookie: "session=secret",
    connection: "keep-alive",
    forwarded: "for=spoofed",
    "x-api-key": "caller-key",
    "x-control-plane-secret": "internal-secret",
    "x-forwarded-for": "spoofed",
    "x-runner-upstream-url": "https://attacker.example",
    "x-computer-agents-runtime-token": "runtime-secret",
    "x-computer-agents-organization": "org_123",
    "x-custom-app-header": "preserved",
  }), {
    authorization: "Bearer caller-key",
    "x-api-key": "caller-key",
    "x-computer-agents-organization": "org_123",
    "x-custom-app-header": "preserved",
  });
});

test("HTTP proxy streams arbitrary requests and uses the appliance browser credential", async (t) => {
  let observed;
  const control = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      observed = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      };
      res.writeHead(201, {
        "content-type": "text/plain",
        "x-deployed-app": "ready",
      });
      res.write("stream-");
      setTimeout(() => res.end("complete"), 5);
    });
  });
  const controlPort = await listen(control);
  t.after(() => close(control));

  let sessionReads = 0;
  const gateway = createDeployableAppGateway({
    defaultUpstreamOrigin: `http://127.0.0.1:${controlPort}/v1`,
    deploymentTopology: "on_prem",
    identityService: {
      async readSession() {
        sessionReads += 1;
        return { credential: { key: "session-api-key" } };
      },
    },
  });
  t.after(() => gateway.closeDeployableAppGateway());

  const platform = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://platform.local");
    void gateway.proxyDeployableAppRequest(req, res, url).then((handled) => {
      if (!handled && !res.headersSent) res.writeHead(404).end();
    });
  });
  const platformPort = await listen(platform);
  t.after(() => close(platform));

  const response = await fetch(
    `http://127.0.0.1:${platformPort}/runtime/apps/srv_test/path?query=1`,
    {
      method: "POST",
      headers: {
        cookie: "computer_agents_session=secret",
        "content-type": "application/octet-stream",
        "x-control-plane-secret": "spoofed",
        "x-custom-app-header": "preserved",
        "x-forwarded-for": "spoofed",
      },
      body: "request-body",
    },
  );

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-deployed-app"), "ready");
  assert.equal(await response.text(), "stream-complete");
  assert.equal(sessionReads, 1);
  assert.equal(observed.method, "POST");
  assert.equal(observed.url, "/runtime/apps/srv_test/path?query=1");
  assert.equal(observed.body, "request-body");
  assert.equal(observed.headers["x-api-key"], "session-api-key");
  assert.equal(observed.headers["x-custom-app-header"], "preserved");
  assert.equal(observed.headers.cookie, undefined);
  assert.equal(observed.headers["x-control-plane-secret"], undefined);
  assert.notEqual(observed.headers["x-forwarded-for"], "spoofed");
});

test("explicit API keys take precedence over appliance browser sessions", async (t) => {
  let observedApiKey = "";
  const control = http.createServer((req, res) => {
    observedApiKey = String(req.headers["x-api-key"] || "");
    res.writeHead(204).end();
  });
  const controlPort = await listen(control);
  t.after(() => close(control));

  let sessionReads = 0;
  const gateway = createDeployableAppGateway({
    defaultUpstreamOrigin: `http://127.0.0.1:${controlPort}/v1`,
    deploymentTopology: "on_prem",
    identityService: {
      async readSession() {
        sessionReads += 1;
        return { credential: { key: "session-api-key" } };
      },
    },
  });
  t.after(() => gateway.closeDeployableAppGateway());

  const platform = http.createServer((req, res) => {
    void gateway.proxyDeployableAppRequest(
      req,
      res,
      new URL(req.url || "/", "http://platform.local"),
    );
  });
  const platformPort = await listen(platform);
  t.after(() => close(platform));

  const response = await fetch(
    `http://127.0.0.1:${platformPort}/runtime/apps/srv_test`,
    { headers: { "x-api-key": "explicit-api-key" } },
  );
  assert.equal(response.status, 204);
  assert.equal(observedApiKey, "explicit-api-key");
  assert.equal(sessionReads, 0);
});

test("WebSocket upgrades are proxied with session authentication", async (t) => {
  let observedHeaders;
  const upstreamWebSockets = new WebSocketServer({ noServer: true });
  upstreamWebSockets.on("connection", (socket) => {
    socket.on("message", (data, isBinary) => socket.send(data, { binary: isBinary }));
  });
  const control = http.createServer();
  control.on("upgrade", (req, socket, head) => {
    observedHeaders = req.headers;
    upstreamWebSockets.handleUpgrade(req, socket, head, (webSocket) => {
      upstreamWebSockets.emit("connection", webSocket, req);
    });
  });
  const controlPort = await listen(control);
  t.after(async () => {
    upstreamWebSockets.close();
    await close(control);
  });

  const gateway = createDeployableAppGateway({
    defaultUpstreamOrigin: `http://127.0.0.1:${controlPort}/v1`,
    deploymentTopology: "on_prem",
    identityService: {
      async readSession() {
        return { credential: { key: "websocket-session-key" } };
      },
    },
  });
  t.after(() => gateway.closeDeployableAppGateway());

  const platform = http.createServer((_req, res) => res.writeHead(404).end());
  platform.on("upgrade", (req, socket, head) => {
    if (!gateway.proxyDeployableAppUpgrade(req, socket, head)) socket.destroy();
  });
  const platformPort = await listen(platform);
  t.after(() => close(platform));

  const client = new WebSocket(
    `ws://127.0.0.1:${platformPort}/runtime/apps/srv_test/socket?channel=1`,
    { headers: { cookie: "computer_agents_session=secret" } },
  );
  await once(client, "open");
  client.send("ping");
  const [message] = await once(client, "message");
  assert.equal(message.toString(), "ping");
  assert.equal(observedHeaders["x-api-key"], "websocket-session-key");
  assert.equal(observedHeaders.cookie, undefined);
  client.close();
  await once(client, "close");
});

test("cloud deployments do not claim appliance application paths", async () => {
  const gateway = createDeployableAppGateway({
    defaultUpstreamOrigin: "https://api.computer-agents.com/v1",
    deploymentTopology: "gcp_saas",
  });
  assert.equal(gateway.deployableAppGatewayEnabled, false);
  assert.equal(
    await gateway.proxyDeployableAppRequest(
      {},
      {},
      new URL("https://platform.example/runtime/apps/srv_test"),
    ),
    false,
  );
});
