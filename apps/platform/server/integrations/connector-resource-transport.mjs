export function createConnectorResourceTransport({
  fetchImpl = globalThis.fetch,
  fetchAiosCloud,
  fetchAiosApi,
  withProxyOrganizationHeader,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Connector resource transport requires fetchImpl.");
  }
  if (typeof fetchAiosCloud !== "function") {
    throw new TypeError(
      "Connector resource transport requires fetchAiosCloud.",
    );
  }
  if (fetchAiosApi !== undefined && typeof fetchAiosApi !== "function") {
    throw new TypeError(
      "Connector resource transport fetchAiosApi must be a function.",
    );
  }
  if (typeof withProxyOrganizationHeader !== "function") {
    throw new TypeError(
      "Connector resource transport requires withProxyOrganizationHeader.",
    );
  }

  return async function fetchConnectorResource(
    req,
    upstreamPath,
    init = {},
    context = {},
  ) {
    const apiKey = String(context.apiKey || "").trim();
    const upstreamUrl = String(context.upstreamUrl || "").trim();
    if (!apiKey || !upstreamUrl) {
      const cloudResponse = await fetchAiosCloud(req, upstreamPath, init);
      if (cloudResponse?.status !== 404 || typeof fetchAiosApi !== "function") {
        return cloudResponse;
      }
      return fetchAiosApi(
        req,
        buildHostedResourcePath(upstreamPath),
        init,
      );
    }

    const targetUrl = buildRunnerResourceUrl(upstreamUrl, upstreamPath);
    const headers = withProxyOrganizationHeader(req, {}, {
      ...(init.headers || {}),
      "X-API-Key": apiKey,
    });
    return fetchImpl(targetUrl, {
      ...init,
      headers,
    });
  };
}

export function buildHostedResourcePath(upstreamPath) {
  const normalizedPath = String(upstreamPath || "").trim();
  if (!normalizedPath) {
    throw new TypeError("Connector resource transport requires a path.");
  }
  return `/api${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}

export function buildRunnerResourceUrl(upstreamUrl, upstreamPath) {
  const normalizedOrigin = String(upstreamUrl || "").trim().replace(/\/+$/, "");
  const normalizedPath = String(upstreamPath || "").trim();
  if (!normalizedOrigin || !normalizedPath) {
    throw new TypeError(
      "Connector resource transport requires an upstream URL and path.",
    );
  }
  const parsedOrigin = new URL(normalizedOrigin);
  if (parsedOrigin.protocol !== "https:" && parsedOrigin.protocol !== "http:") {
    throw new TypeError("Connector resource upstream must use HTTP or HTTPS.");
  }
  return `${normalizedOrigin}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}
