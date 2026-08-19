const IN_APP_NOTIFICATIONS_PATH = "/api/real/notifications/in-app";
const NOTIFICATION_PREFERENCES_PATH = "/api/real/notifications/preferences";

function assertAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Configure Home service requires the ${name} adapter.`);
  }
}

/** Creates the Configure Home notification proxy from host transport adapters. */
export function createConfigureHomeService(adapters = {}) {
  assertAdapter(adapters, "proxyUpstreamGet");
  assertAdapter(adapters, "proxyUpstreamJsonRequest");

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method === "GET" && url.pathname === IN_APP_NOTIFICATIONS_PATH) {
        void adapters.proxyUpstreamGet(req, res, "/notifications/in-app", { emptyOn404: true });
        return true;
      }
      if (url.pathname === NOTIFICATION_PREFERENCES_PATH) {
        if (req.method === "GET") {
          void adapters.proxyUpstreamGet(req, res, "/notifications/preferences");
          return true;
        }
        if (req.method === "PUT") {
          void adapters.proxyUpstreamJsonRequest(req, res, "/notifications/preferences", "PUT");
          return true;
        }
      }
      return false;
    },
  });
}
