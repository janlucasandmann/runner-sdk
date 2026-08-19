function encodePathSuffix(value) {
  return value
    ? "/" + value
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")
    : "";
}

/** Owns Batches BFF route matching and exact upstream translation. */
export function createBatchesRequestHandler({
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
}) {
  if (typeof proxyUpstreamGet !== "function") {
    throw new TypeError("Batches service requires a proxyUpstreamGet adapter.");
  }
  if (typeof proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Batches service requires a proxyUpstreamJsonRequest adapter.");
  }

  return function handleBatchesRequest(req, res, url) {
    const match = url.pathname.match(/^\/api\/real\/batch-jobs(?:\/(.*))?$/);
    const method = String(req.method || "GET").toUpperCase();
    if (!match || !["GET", "POST", "PATCH", "DELETE"].includes(method)) {
      return false;
    }
    const suffix = encodePathSuffix(match[1]);
    if (method === "GET") {
      void proxyUpstreamGet(
        req,
        res,
        "/batch-jobs" + suffix + (url.search || ""),
      );
    } else {
      void proxyUpstreamJsonRequest(
        req,
        res,
        "/batch-jobs" + suffix,
        method,
      );
    }
    return true;
  };
}

