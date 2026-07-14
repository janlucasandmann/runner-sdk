const ORGANIZATIONS_PROXY_METHODS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
const ORGANIZATIONS_PROXY_PATH_PATTERN = /^\/api\/real\/organizations(?:\/(.*))?$/;

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Organizations service requires the ${name} adapter.`);
  }
}

function buildOrganizationsUpstreamPath(match) {
  const suffix = match?.[1]
    ? "/" + match[1]
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/")
    : "";
  return "/organizations" + suffix;
}

/** Creates the Organizations API proxy service from host transport adapters. */
export function createOrganizationsService(adapters = {}) {
  ["proxyUpstreamGet", "proxyUpstreamJsonRequest"]
    .forEach((name) => assertAdapter(adapters, name));

  return Object.freeze({
    handleRequest(req, res, url) {
      const organizationsProxyMatch = url.pathname.match(ORGANIZATIONS_PROXY_PATH_PATTERN);
      if (!organizationsProxyMatch || !ORGANIZATIONS_PROXY_METHODS.has(req.method || "")) {
        return false;
      }
      const upstreamPath = buildOrganizationsUpstreamPath(organizationsProxyMatch);
      if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath + (url.search || ""));
      } else {
        void adapters.proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
      }
      return true;
    },
  });
}
