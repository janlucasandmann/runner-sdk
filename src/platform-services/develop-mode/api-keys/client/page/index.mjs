import { API_KEYS_LEGACY_CARD_SCRIPT } from "./legacy-card.mjs";
import { API_KEYS_LEGACY_SETTINGS_CASE_SCRIPT } from "./legacy-settings-case.mjs";
import { API_KEYS_MANAGEMENT_PAGE_SCRIPT } from "./management.mjs";

export const API_KEYS_PAGE_SCRIPT_FRAGMENTS = Object.freeze({
  legacyCard: API_KEYS_LEGACY_CARD_SCRIPT,
  legacySettingsCase: API_KEYS_LEGACY_SETTINGS_CASE_SCRIPT,
  management: API_KEYS_MANAGEMENT_PAGE_SCRIPT,
});
