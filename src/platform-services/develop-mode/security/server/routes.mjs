function encodePathSuffix(value) {
  return value
    ? `/${value
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")}`
    : "";
}

/** Owns authenticated platform proxy routes for the Repository Security API. */
export function createSecurityRequestHandler({
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
}) {
  if (typeof proxyUpstreamGet !== "function") {
    throw new TypeError("Security service requires a proxyUpstreamGet adapter.");
  }
  if (typeof proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Security service requires a proxyUpstreamJsonRequest adapter.");
  }

  return function handleSecurityRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    if (!["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return false;
    }

    const securityMatch = url.pathname.match(
      /^\/api\/real\/security(?:\/(.*))?$/,
    );
    const githubMatch = url.pathname.match(
      /^\/api\/real\/github\/security(?:\/(.*))?$/,
    );
    const match = securityMatch || githubMatch;
    if (!match) return false;

    const upstreamPrefix = securityMatch ? "/security" : "/github/security";
    const upstreamPath = upstreamPrefix + encodePathSuffix(match[1]);
    if (method === "GET") {
      void proxyUpstreamGet(req, res, upstreamPath);
    } else {
      void proxyUpstreamJsonRequest(req, res, upstreamPath, method);
    }
    return true;
  };
}
