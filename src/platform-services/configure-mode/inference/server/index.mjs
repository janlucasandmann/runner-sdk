const INFERENCE_TEST_PATHS = new Set([
  "/api/real/inference/test",
  "/api/real/billing/inference/test",
]);
const INFERENCE_ENDPOINTS_PREFIX = "/api/real/inference/endpoints";

// The inference settings surface also exposes the execution runtime that hosts
// local runners.  These requests intentionally use the platform's same-origin
// `/api/real` gateway so session credentials and API-key based access are
// handled consistently with the rest of the settings page.
const RUNTIME_TARGETS_PATH = "/api/real/runtime-targets";
const DEVICES_PATH = "/api/real/devices";
const WORKSPACE_BINDINGS_PATH = "/api/real/workspace-bindings";
const LOCAL_RUNNER_PAIRING_TOKENS_PATH = "/api/real/local-runner-pairing-tokens";

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

      if (req.method === "GET" && url.pathname === RUNTIME_TARGETS_PATH) {
        void adapters.proxyUpstreamGet(req, res, "/runtime-targets");
        return true;
      }

      if (req.method === "GET" && url.pathname === DEVICES_PATH) {
        void adapters.proxyUpstreamGet(req, res, "/devices");
        return true;
      }

      if (url.pathname === WORKSPACE_BINDINGS_PATH) {
        if (req.method === "GET") {
          void adapters.proxyUpstreamGet(req, res, "/workspace-bindings");
          return true;
        }
        if (req.method === "POST") {
          void adapters.proxyUpstreamJsonRequest(
            req,
            res,
            "/workspace-bindings",
            "POST",
          );
          return true;
        }
      }

      if (
        url.pathname === LOCAL_RUNNER_PAIRING_TOKENS_PATH
        || url.pathname.startsWith(LOCAL_RUNNER_PAIRING_TOKENS_PATH + "/")
      ) {
        const suffix = url.pathname.slice(LOCAL_RUNNER_PAIRING_TOKENS_PATH.length);
        const upstreamPath = "/local-runner-pairing-tokens" + suffix;
        if (req.method === "GET") {
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
