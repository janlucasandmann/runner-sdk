function encodePathSuffix(value) {
  return value
    ? "/" + value
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")
    : "";
}

/** Owns all Metronome HTTP route matching and upstream path translation. */
export function createMetronomeRequestHandler({
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
}) {
  if (typeof proxyUpstreamGet !== "function") {
    throw new TypeError("Metronome service requires a proxyUpstreamGet adapter.");
  }
  if (typeof proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Metronome service requires a proxyUpstreamJsonRequest adapter.");
  }

  return function handleMetronomeRequest(req, res, url) {
    const match = url.pathname.match(/^\/api\/real\/metronomes(?:\/(.*))?$/);
    const method = String(req.method || "GET").toUpperCase();
    if (!match || !["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return false;
    }

    const suffix = encodePathSuffix(match[1]);
    if (method === "GET") {
      void proxyUpstreamGet(req, res, "/metronomes" + suffix + (url.search || ""));
    } else {
      void proxyUpstreamJsonRequest(req, res, "/metronomes" + suffix, method);
    }
    return true;
  };
}
