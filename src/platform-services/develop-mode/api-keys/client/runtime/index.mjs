import { API_KEYS_CREATE_SCRIPT } from "./create.mjs";
import { API_KEYS_LOAD_LIFECYCLE_SCRIPT } from "./load-lifecycle.mjs";
import { API_KEYS_LOADING_SCRIPT } from "./loading.mjs";
import { API_KEYS_PROJECTION_SCRIPT } from "./projection.mjs";
import { API_KEYS_REVOKE_SCRIPT } from "./revoke.mjs";

export const API_KEYS_RUNTIME_SCRIPT_FRAGMENTS = Object.freeze({
  loading: API_KEYS_LOADING_SCRIPT,
  create: API_KEYS_CREATE_SCRIPT,
  revoke: API_KEYS_REVOKE_SCRIPT,
  loadLifecycle: API_KEYS_LOAD_LIFECYCLE_SCRIPT,
  projection: API_KEYS_PROJECTION_SCRIPT,
});
