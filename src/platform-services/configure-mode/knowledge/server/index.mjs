const KNOWLEDGE_PATH = "/api/real/knowledge";
const KNOWLEDGE_UPSTREAM_PATH = "/knowledge";
const KNOWLEDGE_PROXY_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Knowledge service requires the ${name} adapter.`);
  }
}

function buildUpstreamPath(url) {
  const suffix = url.pathname.slice(KNOWLEDGE_PATH.length);
  const encodedSuffix = suffix
    ? suffix.split("/").map((segment) => encodeURIComponent(decodeURIComponent(segment))).join("/")
    : "";
  return KNOWLEDGE_UPSTREAM_PATH + encodedSuffix + url.search;
}

/** Deployment-neutral proxy for the authoritative Knowledge control API. */
export function createKnowledgeService(adapters = {}) {
  [
    "proxyUpstreamBinaryGet",
    "proxyUpstreamGet",
    "proxyUpstreamJsonRequest",
    "proxyUpstreamRawRequest",
  ]
    .forEach((name) => assertAdapter(adapters, name));

  return Object.freeze({
    handleRequest(req, res, url) {
      if (
        (url.pathname !== KNOWLEDGE_PATH && !url.pathname.startsWith(`${KNOWLEDGE_PATH}/`))
        || !KNOWLEDGE_PROXY_METHODS.has(req.method || "")
      ) {
        return false;
      }
      const upstreamPath = buildUpstreamPath(url);
      const isCoverImageRead = req.method === "GET"
        && /^\/api\/real\/knowledge\/[^/]+\/cover\/image$/.test(url.pathname);
      const isMultipartWrite = req.method === "POST"
        && (
          url.pathname === `${KNOWLEDGE_PATH}/parse`
          || /^\/api\/real\/knowledge\/[^/]+\/cover$/.test(url.pathname)
        );
      if (isCoverImageRead) {
        void adapters.proxyUpstreamBinaryGet(req, res, upstreamPath, {
          contentType: "image/webp",
        });
      } else if (req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, upstreamPath);
      } else if (isMultipartWrite) {
        // Preserve the browser-generated multipart boundary and file bytes.
        void adapters.proxyUpstreamRawRequest(req, res, upstreamPath, req.method);
      } else {
        void adapters.proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
      }
      return true;
    },
  });
}
