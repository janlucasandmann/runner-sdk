const PROMPTS_PATH = "/api/real/prompts";
const PROMPTS_UPSTREAM_PATH = "/prompts";
const PROMPTS_PROXY_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Prompts service requires the ${name} adapter.`);
  }
}

function buildUpstreamPath(pathname) {
  const suffix = pathname.slice(PROMPTS_PATH.length);
  if (!suffix) return PROMPTS_UPSTREAM_PATH;
  return PROMPTS_UPSTREAM_PATH + suffix
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

/**
 * Proxies the platform prompt surface to the authenticated control API.
 * Persistence belongs to the selected deployment's database; the platform
 * server deliberately keeps no prompt state of its own.
 */
export function createPromptsService(adapters = {}) {
  ["proxyUpstreamGet", "proxyUpstreamJsonRequest"]
    .forEach((name) => assertAdapter(adapters, name));

  return Object.freeze({
    handleRequest(req, res, url) {
      if (
        (url.pathname !== PROMPTS_PATH
          && !url.pathname.startsWith(`${PROMPTS_PATH}/`))
        || !PROMPTS_PROXY_METHODS.has(req.method || "")
      ) {
        return false;
      }

      const upstreamPath = buildUpstreamPath(url.pathname);
      if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath);
      } else {
        void adapters.proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
      }
      return true;
    },
  });
}
