import { API_KEYS_HELPERS_SCRIPT } from "./helpers.mjs";
import { API_KEYS_SCOPE_PRESETS_SCRIPT } from "./scopes.mjs";

export const API_KEYS_DOMAIN_SCRIPT_FRAGMENTS = Object.freeze({
  scopePresets: API_KEYS_SCOPE_PRESETS_SCRIPT,
  helpers: API_KEYS_HELPERS_SCRIPT,
});
