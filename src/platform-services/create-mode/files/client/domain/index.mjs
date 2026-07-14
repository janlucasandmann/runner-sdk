import { FILES_FILENAME_DOMAIN_SCRIPT } from "./filename.mjs";
import { FILES_INVENTORY_DOMAIN_SCRIPT } from "./inventory.mjs";
import { FILES_LIST_URL_DOMAIN_SCRIPT } from "./list-url.mjs";
import { FILES_PREVIEW_DOMAIN_SCRIPT } from "./preview.mjs";
import { FILES_TRANSFER_DOMAIN_SCRIPT } from "./transfer.mjs";

/**
 * Files-owned domain fragments keyed by their required position in the legacy
 * inline browser runtime. The host composes them around shared thread and
 * environment foundations without taking ownership of their behavior.
 */
export const FILES_DOMAIN_FRAGMENTS = Object.freeze({
  preview: FILES_PREVIEW_DOMAIN_SCRIPT,
  listUrl: FILES_LIST_URL_DOMAIN_SCRIPT,
  inventory: FILES_INVENTORY_DOMAIN_SCRIPT,
  transfer: FILES_TRANSFER_DOMAIN_SCRIPT,
  filename: FILES_FILENAME_DOMAIN_SCRIPT,
});

