import {
  createAdminHtmlRenderer,
  serializeAdminScriptValue,
} from "./render-admin-template.mjs";

export function createAdminAccessDeniedPageRenderer({ aiosOrigin }) {
  return createAdminHtmlRenderer(
    "admin-access-denied.html",
    {
      PLATFORM_AIOS_ORIGIN_JSON: serializeAdminScriptValue(aiosOrigin),
    },
    { statusCode: 403 },
  );
}
