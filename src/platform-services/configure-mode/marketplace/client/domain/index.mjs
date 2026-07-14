import { createMarketplaceCatalogRuntimeScript } from "./catalog-runtime.mjs";
import { MARKETPLACE_PREVIEW_DATABASE_SCRIPT } from "./preview-database.mjs";
import { MARKETPLACE_PREVIEW_METADATA_SCRIPT } from "./preview-metadata.mjs";
import { MARKETPLACE_PREVIEW_RESOURCES_SCRIPT } from "./preview-resources.mjs";
import { MARKETPLACE_PREVIEW_SERVER_FILES_SCRIPT } from "./preview-server-files.mjs";

export function createMarketplaceDomainScriptFragments(options = {}) {
  return Object.freeze({
    catalog: createMarketplaceCatalogRuntimeScript(options),
    metadata: MARKETPLACE_PREVIEW_METADATA_SCRIPT,
    serverFiles: MARKETPLACE_PREVIEW_SERVER_FILES_SCRIPT,
    database: MARKETPLACE_PREVIEW_DATABASE_SCRIPT,
    resources: MARKETPLACE_PREVIEW_RESOURCES_SCRIPT,
  });
}
