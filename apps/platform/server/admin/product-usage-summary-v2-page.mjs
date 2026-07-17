import {
  createAdminHtmlRenderer,
  serializeAdminScriptValue,
} from "./render-admin-template.mjs";

export function createProductUsageSummaryV2PageRenderer({ aiosOrigin }) {
  const serveProductUsageSummaryPageV2 = createAdminHtmlRenderer(
    "product-usage-summary-v2.html",
    {
      PLATFORM_AIOS_ORIGIN_JSON: serializeAdminScriptValue(aiosOrigin),
    },
  );
  return serveProductUsageSummaryPageV2;
}
