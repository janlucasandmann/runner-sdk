const INFERENCE_TEST_PATHS = new Set([
  "/api/real/inference/test",
  "/api/real/billing/inference/test",
]);
const INFERENCE_ENDPOINTS_PREFIX = "/api/real/inference/endpoints";

/** Creates the Inference proxy service from host transport adapters. */
export function createInferenceService(adapters = {}) {
  if (typeof adapters.proxyUpstreamGet !== "function") {
    throw new TypeError("Inference service requires the proxyUpstreamGet adapter.");
  }
  if (typeof adapters.proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Inference service requires the proxyUpstreamJsonRequest adapter.");
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method === "POST" && INFERENCE_TEST_PATHS.has(url.pathname)) {
        void adapters.proxyUpstreamJsonRequest(
          req,
          res,
          "/billing/inference/test",
          "POST",
        );
        return true;
      }

      if (
        url.pathname !== INFERENCE_ENDPOINTS_PREFIX
        && !url.pathname.startsWith(INFERENCE_ENDPOINTS_PREFIX + "/")
      ) {
        return false;
      }
      const suffix = url.pathname.slice(INFERENCE_ENDPOINTS_PREFIX.length);
      const upstreamPath = "/billing/inference/endpoints" + suffix;
      if (req.method === "GET" && !suffix) {
        void adapters.proxyUpstreamGet(req, res, upstreamPath);
        return true;
      }
      if (["POST", "PATCH", "DELETE"].includes(req.method)) {
        void adapters.proxyUpstreamJsonRequest(
          req,
          res,
          upstreamPath,
          req.method,
        );
        return true;
      }
      return false;
    },
  });
}
