import { CALENDAR_DATE_IMPORTS_SCRIPT } from "./date-imports.mjs";
import { CALENDAR_VENDOR_IMPORT_SCRIPT } from "./vendor-import.mjs";
import { CALENDAR_LOCALIZER_SCRIPT } from "./localizer.mjs";

export const CALENDAR_BROWSER_FOUNDATION_FRAGMENTS = Object.freeze({
  dateImports: CALENDAR_DATE_IMPORTS_SCRIPT,
  calendarImport: CALENDAR_VENDOR_IMPORT_SCRIPT,
  localizer: CALENDAR_LOCALIZER_SCRIPT,
});
