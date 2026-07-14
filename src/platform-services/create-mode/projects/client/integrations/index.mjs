import { PROJECTS_CONNECTOR_STATE_RUNTIME_SCRIPT } from "./connector-state.mjs";
import { PROJECTS_FILE_INDEX_RUNTIME_SCRIPT } from "./file-index.mjs";
import { PROJECTS_MARKDOWN_RUNTIME_SCRIPT } from "./markdown.mjs";
import { PROJECTS_PERMISSIONS_RUNTIME_SCRIPT } from "./permissions.mjs";
import { PROJECTS_STATUS_RUNTIME_SCRIPT } from "./status.mjs";

/** Project-owned helpers consumed by the surrounding platform shell. */
export const PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT = [
  PROJECTS_MARKDOWN_RUNTIME_SCRIPT,
  PROJECTS_CONNECTOR_STATE_RUNTIME_SCRIPT,
  PROJECTS_STATUS_RUNTIME_SCRIPT,
  PROJECTS_PERMISSIONS_RUNTIME_SCRIPT,
  PROJECTS_FILE_INDEX_RUNTIME_SCRIPT,
].join("\n");
