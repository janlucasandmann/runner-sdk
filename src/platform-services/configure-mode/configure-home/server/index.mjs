const IN_APP_NOTIFICATIONS_PATH = "/api/real/notifications/in-app";

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Configure Home service requires the ${name} adapter.`);
  }
}

/** Creates the Configure Home notification proxy from host transport adapters. */
export function createConfigureHomeService(adapters = {}) {
  assertAdapter(adapters, "proxyUpstreamGet");

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method !== "GET" || url.pathname !== IN_APP_NOTIFICATIONS_PATH) {
        return false;
      }
      void adapters.proxyUpstreamGet(req, res, "/notifications/in-app", { emptyOn404: true });
      return true;
    },
  });
}
