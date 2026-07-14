import {
  MARKETPLACE_TEMPLATE_CATALOG,
  MARKETPLACE_TEMPLATE_TYPES,
} from "../../domain/index.mjs";

export function createMarketplaceCatalogRuntimeScript({ serialize = JSON.stringify } = {}) {
  if (typeof serialize !== "function") {
    throw new TypeError("Marketplace catalog runtime requires a serialize function.");
  }
  return `      const PLAYGROUND_RESOURCE_TEMPLATE_DATA = ${serialize(MARKETPLACE_TEMPLATE_CATALOG)};
      const PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA = ${serialize(MARKETPLACE_TEMPLATE_TYPES)};
      const PLAYGROUND_RESOURCE_TEMPLATE_PREVIEW_TYPES = new Set(["web_app", "function", "database"]);

`;
}
