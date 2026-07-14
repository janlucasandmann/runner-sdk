const REQUIRED_ADAPTERS = ["proxyUpstreamGet"];

/** Creates the Models service from host transport adapters. */
export function createModelsService(adapters = {}) {
  for (const adapterName of REQUIRED_ADAPTERS) {
    if (typeof adapters[adapterName] !== "function") {
      throw new TypeError(`Models service requires the ${adapterName} adapter.`);
    }
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method !== "GET" || url.pathname !== "/api/real/agents/models") {
        return false;
      }
      void adapters.proxyUpstreamGet(req, res, "/agents/models");
      return true;
    },
  });
}
