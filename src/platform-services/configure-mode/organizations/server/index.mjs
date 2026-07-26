const ORGANIZATIONS_PROXY_METHODS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
const ORGANIZATIONS_PROXY_ROUTES = Object.freeze([
  Object.freeze({
    pattern: /^\/api\/real\/organizations(?:\/(.*))?$/,
    upstreamBase: "/organizations",
  }),
  Object.freeze({
    pattern: /^\/api\/real\/identity-connections(?:\/(.*))?$/,
    upstreamBase: "/identity-connections",
  }),
  Object.freeze({
    pattern: /^\/api\/real\/authorization(?:\/(.*))?$/,
    upstreamBase: "/authorization",
  }),
]);

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Organizations service requires the ${name} adapter.`);
  }
}

function buildOrganizationsUpstreamPath(upstreamBase, match) {
  const suffix = match?.[1]
    ? "/" + match[1]
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/")
    : "";
  return upstreamBase + suffix;
}

function matchOrganizationsProxyRoute(pathname) {
  for (const route of ORGANIZATIONS_PROXY_ROUTES) {
    const match = pathname.match(route.pattern);
    if (match) return { match, upstreamBase: route.upstreamBase };
  }
  return null;
}

/** Creates the Organizations API proxy service from host transport adapters. */
export function createOrganizationsService(adapters = {}) {
  ["proxyUpstreamGet", "proxyUpstreamJsonRequest"]
    .forEach((name) => assertAdapter(adapters, name));

  return Object.freeze({
    handleRequest(req, res, url) {
      const route = matchOrganizationsProxyRoute(url.pathname);
      if (!route || !ORGANIZATIONS_PROXY_METHODS.has(req.method || "")) {
        return false;
      }
      const upstreamPath = buildOrganizationsUpstreamPath(
        route.upstreamBase,
        route.match,
      );
      if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath + (url.search || ""));
      } else {
        void adapters.proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
      }
      return true;
    },
  });
}
