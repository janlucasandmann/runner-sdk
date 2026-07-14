/**
 * Project task API gateway.
 *
 * Task endpoints first target the authenticated cloud route and retain the
 * direct API-key path used by the standalone demo. Authentication primitives
 * remain injected by the host; task-specific fallback behavior lives here.
 */
export function createTaskUpstreamGateway({
  fetchAiosApi,
  fetchAiosCloud,
  hasAiosSession,
  parseUpstreamUrl,
  readOptionalApiKey,
  readRequestBody,
  sendJson,
  withProxyOrganizationHeader,
}) {
  const dependencies = {
    fetchAiosApi,
    fetchAiosCloud,
    hasAiosSession,
    parseUpstreamUrl,
    readOptionalApiKey,
    readRequestBody,
    sendJson,
    withProxyOrganizationHeader,
  };
  for (const [name, value] of Object.entries(dependencies)) {
    if (typeof value !== "function") {
      throw new TypeError(`Task upstream gateway requires a ${name} adapter.`);
    }
  }

  async function fetchAiosTaskApi(req, upstreamPath, init = {}) {
    const requestUrl = new URL(req.url || "/", "http://localhost");
    const normalizedPath = upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`;
    const cloudResponse = await fetchAiosCloud(req, normalizedPath, init);

    if (cloudResponse.status !== 404) {
      return cloudResponse;
    }

    return fetchAiosApi(req, `/api${normalizedPath}${requestUrl.search}`, init);
  }

  async function proxyUpstreamTaskJsonRequest(req, res, upstreamPath, method) {
    try {
      const upstreamUrl = parseUpstreamUrl(req, {});
      const body = method === "GET" || method === "HEAD"
        ? undefined
        : await readRequestBody(req);
      const apiKey = readOptionalApiKey(req, body);
      const requestUrl = new URL(req.url || "/", "http://localhost");
      let upstream;

      if (apiKey) {
        const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
        upstreamTarget.search = requestUrl.search;
        upstream = await fetch(upstreamTarget.toString(), {
          method,
          headers: withProxyOrganizationHeader(req, body, {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          }),
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } else if (hasAiosSession(req)) {
        upstream = await fetchAiosTaskApi(req, upstreamPath, {
          method,
          headers: {
            "content-type": "application/json",
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } else {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in with Computer Agents or provide an API key.",
        });
      }

      const text = await upstream.text();
      let parsed = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { message: text };
      }

      return sendJson(res, upstream.status, parsed);
    } catch (error) {
      return sendJson(res, 502, {
        error: `Failed to proxy upstream ${method} task request`,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Object.freeze({
    fetchAiosTaskApi,
    proxyUpstreamTaskJsonRequest,
  });
}
