import {
  MARKETPLACE_TEMPLATE_CATALOG,
  MARKETPLACE_TEMPLATE_TYPES,
} from "../domain/index.mjs";

const MARKETPLACE_CATALOG_PATHS = new Set([
  "/api/real/marketplace",
  "/api/real/marketplace/templates",
  "/api/real/resource-templates",
]);

/** Creates the Marketplace catalog service from host transport adapters. */
export function createMarketplaceService(adapters = {}) {
  if (typeof adapters.sendJson !== "function") {
    throw new TypeError("Marketplace service requires the sendJson adapter.");
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (req.method !== "GET" || !MARKETPLACE_CATALOG_PATHS.has(url.pathname)) {
        return false;
      }
      adapters.sendJson(res, 200, {
        object: "list",
        data: MARKETPLACE_TEMPLATE_CATALOG,
        templates: MARKETPLACE_TEMPLATE_CATALOG,
        types: MARKETPLACE_TEMPLATE_TYPES,
      });
      return true;
    },
  });
}
