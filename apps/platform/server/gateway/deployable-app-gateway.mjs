import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const PLATFORM_INTERNAL_HEADERS = new Set([
  "cookie",
  "forwarded",
  "x-control-plane-secret",
  "x-runner-upstream-url",
]);

const PASSTHROUGH_COMPUTER_AGENTS_HEADERS = new Set([
  "x-computer-agents-organization",
]);

function normalizeControlOrigin(value) {
  const parsed = new URL(String(value || "").trim());
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("The deployable application control origin must use HTTP or HTTPS.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("The deployable application control origin must not contain credentials.");
  }
  return parsed;
}

function pathMatches(pathname) {
  return /^\/runtime\/apps\/[^/]+(?:\/|$)/.test(String(pathname || ""));
}

export function isDeployableAppRequestPath(value) {
  try {
    const parsed = value instanceof URL
      ? value
      : new URL(String(value || "/"), "http://platform.local");
    return pathMatches(parsed.pathname);
  } catch {
    return false;
  }
}

export function sanitizeDeployableAppProxyHeaders(source = {}) {
  const headers = {};
  for (const [rawName, value] of Object.entries(source)) {
    const name = String(rawName || "").trim().toLowerCase();
    if (!name || value === undefined) continue;
    if (HOP_BY_HOP_HEADERS.has(name) || PLATFORM_INTERNAL_HEADERS.has(name)) continue;
    if (
      name.startsWith("x-forwarded-")
      || (
        name.startsWith("x-computer-agents-")
        && !PASSTHROUGH_COMPUTER_AGENTS_HEADERS.has(name)
      )
    ) {
      continue;
    }
    headers[name] = value;
  }
  return headers;
}

function responseHeaders(source = {}) {
  const headers = {};
  for (const [rawName, value] of Object.entries(source)) {
    const name = String(rawName || "").trim().toLowerCase();
    if (!name || value === undefined || HOP_BY_HOP_HEADERS.has(name)) continue;
    headers[name] = value;
  }
  return headers;
}

function requestProtocol(req) {
  const forwarded = String(req.headers?.["x-forwarded-proto"] || "")
    .split(",", 1)[0]
    .trim()
    .toLowerCase();
  if (forwarded === "http" || forwarded === "https") return forwarded;
  return req.socket?.encrypted ? "https" : "http";
}

async function resolveRequestHeaders(req, identityService, { upgrade = false } = {}) {
  const headers = sanitizeDeployableAppProxyHeaders(req.headers);
  if (!headers.authorization && !headers["x-api-key"] && identityService?.readSession) {
    try {
      const session = await identityService.readSession(req);
      const sessionApiKey = String(session?.credential?.key || "").trim();
      if (sessionApiKey) headers["x-api-key"] = sessionApiKey;
    } catch {
      // Public deployed applications do not require a platform session. The
      // control gateway remains authoritative for private application access.
    }
  }
  headers.host = String(req.headers?.host || "").trim();
  headers["x-forwarded-proto"] = requestProtocol(req);
  if (upgrade) {
    headers.connection = "Upgrade";
    headers.upgrade = String(req.headers?.upgrade || "websocket");
  }
  return headers;
}

function writeProxyFailure(res, statusCode = 502) {
  if (res.headersSent) {
    res.destroy();
    return;
  }
  const body = JSON.stringify({
    error: "Deployment unavailable",
    message: "The appliance application gateway could not reach the control plane.",
  });
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
  });
  res.end(body);
}

function writeUpgradeFailure(socket, statusCode, statusText) {
  if (socket.destroyed) return;
  socket.end(
    `HTTP/1.1 ${statusCode} ${statusText}\r\n`
    + "Connection: close\r\n"
    + "Content-Length: 0\r\n\r\n",
  );
}

function serializeUpgradeRequest(req, requestPath, headers) {
  const lines = [`${req.method || "GET"} ${requestPath} HTTP/${req.httpVersion || "1.1"}`];
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => lines.push(`${name}: ${entry}`));
    } else {
      lines.push(`${name}: ${value}`);
    }
  }
  return `${lines.join("\r\n")}\r\n\r\n`;
}

export function createDeployableAppGateway({
  defaultUpstreamOrigin,
  deploymentTopology,
  identityService,
} = {}) {
  const enabled = deploymentTopology === "on_prem";
  const controlOrigin = enabled
    ? normalizeControlOrigin(defaultUpstreamOrigin)
    : null;
  const httpAgent = enabled && controlOrigin.protocol === "http:"
    ? new http.Agent({ keepAlive: true })
    : null;
  const httpsAgent = enabled && controlOrigin.protocol === "https:"
    ? new https.Agent({ keepAlive: true })
    : null;

  function ownsRequest(url) {
    return enabled && isDeployableAppRequestPath(url);
  }

  async function proxyDeployableAppRequest(req, res, url) {
    if (!ownsRequest(url)) return false;
    try {
      const headers = await resolveRequestHeaders(req, identityService);
      if (!headers.host) headers.host = controlOrigin.host;
      const transport = controlOrigin.protocol === "https:" ? https : http;
      const upstream = transport.request({
        protocol: controlOrigin.protocol,
        hostname: controlOrigin.hostname,
        port: controlOrigin.port || undefined,
        method: req.method || "GET",
        path: `${url.pathname}${url.search}`,
        headers,
        agent: controlOrigin.protocol === "https:" ? httpsAgent : httpAgent,
      }, (upstreamResponse) => {
        res.writeHead(
          upstreamResponse.statusCode || 502,
          responseHeaders(upstreamResponse.headers),
        );
        upstreamResponse.pipe(res);
      });
      upstream.once("error", () => writeProxyFailure(res));
      req.once("aborted", () => upstream.destroy());
      res.once("close", () => {
        if (!res.writableEnded) upstream.destroy();
      });
      req.pipe(upstream);
    } catch {
      writeProxyFailure(res);
    }
    return true;
  }

  function proxyDeployableAppUpgrade(req, socket, head, { port = 4177 } = {}) {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    if (!ownsRequest(url)) return false;
    void (async () => {
      try {
        const headers = await resolveRequestHeaders(req, identityService, { upgrade: true });
        if (!headers.host) headers.host = controlOrigin.host;
        const connectOptions = {
          host: controlOrigin.hostname,
          port: Number(controlOrigin.port || (controlOrigin.protocol === "https:" ? 443 : 80)),
        };
        const upstream = controlOrigin.protocol === "https:"
          ? tls.connect({ ...connectOptions, servername: controlOrigin.hostname })
          : net.connect(connectOptions);
        upstream.once("connect", () => {
          upstream.write(serializeUpgradeRequest(
            req,
            `${url.pathname}${url.search}`,
            headers,
          ));
          if (head?.length > 0) upstream.write(head);
          socket.pipe(upstream).pipe(socket);
        });
        upstream.once("error", () => writeUpgradeFailure(socket, 502, "Bad Gateway"));
        socket.once("error", () => upstream.destroy());
        socket.once("close", () => upstream.destroy());
      } catch {
        writeUpgradeFailure(socket, 502, "Bad Gateway");
      }
    })();
    return true;
  }

  function closeDeployableAppGateway() {
    httpAgent?.destroy();
    httpsAgent?.destroy();
  }

  return Object.freeze({
    closeDeployableAppGateway,
    deployableAppGatewayEnabled: enabled,
    proxyDeployableAppRequest,
    proxyDeployableAppUpgrade,
  });
}
