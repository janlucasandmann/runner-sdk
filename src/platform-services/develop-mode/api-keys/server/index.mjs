function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`API Keys service requires the ${name} adapter.`);
  }
}

/** Creates the API Keys proxy from the host's authenticated AIOS transport. */
export function createApiKeysService(adapters = {}) {
  assertAdapter(adapters, "proxyAiosJsonRequest");
  assertAdapter(adapters, "proxyUpstreamGet");

  return Object.freeze({
    handleRequest(req, res, url) {
      if (url.pathname === "/api/real/api-keys/analytics/overview" && req.method === "GET") {
        void adapters.proxyUpstreamGet(req, res, "/api-keys/analytics/overview");
        return true;
      }

      if (url.pathname === "/api/aios/user/api-keys" && (req.method === "GET" || req.method === "POST")) {
        void adapters.proxyAiosJsonRequest(req, res, "/api/user/api-keys", req.method);
        return true;
      }

      const mutationMatch = url.pathname.match(/^\/api\/aios\/user\/api-keys\/([^/]+)\/(revoke|reveal)$/);
      if (!mutationMatch) {
        return false;
      }

      const [, rawKeyId, operation] = mutationMatch;
      if (operation === "revoke" && req.method === "POST") {
        void adapters.proxyAiosJsonRequest(
          req,
          res,
          `/api/user/api-keys/${rawKeyId}/revoke`,
          "POST",
        );
        return true;
      }
      if (operation === "reveal" && req.method === "GET") {
        void adapters.proxyAiosJsonRequest(
          req,
          res,
          `/api/user/api-keys/${rawKeyId}/reveal`,
          "GET",
        );
        return true;
      }
      return false;
    },
  });
}
