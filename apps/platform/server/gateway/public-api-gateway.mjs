import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { normalizeBackendUrl, sendJson } from "./http-utils.mjs";

const REQUEST_HEADER_ALLOWLIST = Object.freeze([
  "accept",
  "authorization",
  "content-length",
  "content-type",
  "idempotency-key",
  "last-event-id",
  "origin",
  "user-agent",
  "x-api-key",
  "x-computer-agents-organization",
  "x-request-id",
]);

const RESPONSE_HEADER_BLOCKLIST = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const SUPPORTED_METHODS = new Set([
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
]);

function buildUpstreamTarget(defaultUpstreamOrigin, url) {
  const upstreamRoot = normalizeBackendUrl(defaultUpstreamOrigin);
  const suffix = url.pathname === "/v1"
    ? ""
    : url.pathname.slice("/v1".length);
  const target = new URL(`${upstreamRoot}${suffix}`);
  target.search = url.search;
  return target;
}

function buildRequestHeaders(request) {
  const headers = new Headers();
  for (const name of REQUEST_HEADER_ALLOWLIST) {
    const value = request.headers[name];
    if (Array.isArray(value)) {
      if (value[0]) headers.set(name, value[0]);
    } else if (typeof value === "string" && value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function writeUpstreamHeaders(upstream, response) {
  for (const [name, value] of upstream.headers.entries()) {
    if (!RESPONSE_HEADER_BLOCKLIST.has(name.toLowerCase())) {
      response.setHeader(name, value);
    }
  }
  response.setHeader("X-Accel-Buffering", "no");
}

export function createPublicApiGateway({
  defaultUpstreamOrigin,
  deploymentTopology,
  fetchImpl = fetch,
} = {}) {
  const upstreamRoot = normalizeBackendUrl(defaultUpstreamOrigin);
  const publicApiEnabled = deploymentTopology === "on_prem";

  async function proxyPublicApiRequest(request, response, url) {
    const method = String(request.method || "GET").toUpperCase();
    if (!SUPPORTED_METHODS.has(method)) {
      sendJson(response, 405, {
        error: "Method not allowed",
        code: "PUBLIC_API_METHOD_NOT_ALLOWED",
      }, { Allow: [...SUPPORTED_METHODS].join(", ") });
      return;
    }

    const abortController = new AbortController();
    const abortUpstream = () => {
      if (!abortController.signal.aborted) {
        abortController.abort(new Error("Public API client disconnected."));
      }
    };
    request.once("aborted", abortUpstream);
    response.once("close", () => {
      if (!response.writableEnded) abortUpstream();
    });

    try {
      const target = buildUpstreamTarget(upstreamRoot, url);
      const hasRequestBody = method !== "GET" && method !== "HEAD";
      const upstream = await fetchImpl(target, {
        method,
        headers: buildRequestHeaders(request),
        ...(hasRequestBody ? { body: request, duplex: "half" } : {}),
        redirect: "manual",
        signal: abortController.signal,
      });

      response.statusCode = upstream.status;
      writeUpstreamHeaders(upstream, response);
      if (method === "HEAD" || !upstream.body) {
        response.end();
        return;
      }
      await pipeline(Readable.fromWeb(upstream.body), response);
    } catch (error) {
      if (abortController.signal.aborted || response.destroyed) return;
      console.warn("[platform-public-api] Control API proxy failed", {
        method,
        path: url.pathname,
        message: error instanceof Error ? error.message : String(error),
      });
      if (!response.headersSent) {
        sendJson(response, 502, {
          error: "Public API unavailable",
          code: "PUBLIC_API_UPSTREAM_UNAVAILABLE",
          message: "The appliance control API could not complete the request.",
        });
      } else if (!response.writableEnded) {
        response.destroy(error instanceof Error ? error : undefined);
      }
    } finally {
      request.off("aborted", abortUpstream);
    }
  }

  return Object.freeze({ publicApiEnabled, proxyPublicApiRequest });
}
