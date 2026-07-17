import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

export const COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/bootstrap-and-effects.js",
  "controller/routing-access-and-connections.js",
  "controller/mutations-and-data.js",
  "controller/environment-versioning.js",
  "controller/server-versioning-and-composers.js",
  "controller/server-detail-view.js",
  "controller/database-detail-view.js",
  "controller/computer-detail-view.js",
  "controller/resource-home-view.js",
  "controller/overview-and-composition.js",
]);

/**
 * Quarantined browser source for the legacy compute-resource controller.
 * New compute UI belongs in typed modules; this source exists to keep the
 * compatibility composition bounded while that migration proceeds.
 */
export const COMPUTE_RESOURCES_PAGE_SCRIPT =
  COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS
    .map((relativePath) => fs.readFileSync(
      path.join(domainRoot, relativePath),
      "utf8",
    ))
    .join("");
