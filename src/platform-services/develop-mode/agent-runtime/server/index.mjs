const PLATFORM_PREFIX = "/api/real/agent-runtimes";
const UPSTREAM_PREFIX = "/agent-runtimes";

function encodePathSegment(value) {
  const rawValue = String(value || "");
  try {
    return encodeURIComponent(decodeURIComponent(rawValue));
  } catch {
    return encodeURIComponent(rawValue);
  }
}

function buildUpstreamPath(url) {
  const suffix = url.pathname.slice(PLATFORM_PREFIX.length);
  if (!suffix) {
    return UPSTREAM_PREFIX + (url.search || "");
  }
  const encodedSuffix = suffix
    .split("/")
    .map((segment, index) => index === 0 || !segment ? segment : encodePathSegment(segment))
    .join("/");
  return UPSTREAM_PREFIX + encodedSuffix + (url.search || "");
}

export function createAgentRuntimeService(adapters = {}) {
  if (typeof adapters.proxyUpstreamGet !== "function") {
    throw new TypeError("Agent Runtime service requires the proxyUpstreamGet adapter.");
  }
  if (typeof adapters.proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Agent Runtime service requires the proxyUpstreamJsonRequest adapter.");
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (
        url.pathname !== PLATFORM_PREFIX
        && !url.pathname.startsWith(PLATFORM_PREFIX + "/")
      ) {
        return false;
      }

      const upstreamPath = buildUpstreamPath(url);
      if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath);
        return true;
      }
      if (["POST", "PATCH", "DELETE"].includes(req.method)) {
        void adapters.proxyUpstreamJsonRequest(
          req,
          res,
          upstreamPath.replace(/\?.*$/, ""),
          req.method,
        );
        return true;
      }
      return false;
    },
  });
}
