const INFERENCE_TEST_PATHS = new Set([
  "/api/real/inference/test",
  "/api/real/billing/inference/test",
]);

/** Creates the Inference proxy service from host transport adapters. */
export function createInferenceService(adapters = {}) {
  if (typeof adapters.proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Inference service requires the proxyUpstreamJsonRequest adapter.");
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method !== "POST" || !INFERENCE_TEST_PATHS.has(url.pathname)) {
        return false;
      }
      void adapters.proxyUpstreamJsonRequest(
        req,
        res,
        "/billing/inference/test",
        "POST",
      );
      return true;
    },
  });
}
