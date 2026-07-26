function encodePath(value) {
  return String(value || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

/** Owns authenticated platform proxy routes for Evidence Agents. */
export function createEvidenceAgentsRequestHandler({
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
}) {
  if (typeof proxyUpstreamGet !== "function") {
    throw new TypeError("Evidence Agents requires a proxyUpstreamGet adapter.");
  }
  if (typeof proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Evidence Agents requires a proxyUpstreamJsonRequest adapter.");
  }
  return function handleEvidenceAgentsRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    if (!["GET", "POST"].includes(method)) return false;
    const match = url.pathname.match(/^\/api\/real\/evidence-agents\/([^/]+)(?:\/(.*))?$/);
    if (!match) return false;
    const serverId = encodeURIComponent(decodeURIComponent(match[1]));
    const suffix = encodePath(match[2]);
    const query = url.search || "";
    const upstreamPath = `/servers/${serverId}/evidence-agents${suffix ? `/${suffix}` : ""}${query}`;
    if (method === "GET") {
      void proxyUpstreamGet(req, res, upstreamPath);
    } else {
      void proxyUpstreamJsonRequest(req, res, upstreamPath, method);
    }
    return true;
  };
}
