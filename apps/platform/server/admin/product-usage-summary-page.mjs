import {
  createAdminHtmlRenderer,
  serializeAdminScriptValue,
} from "./render-admin-template.mjs";

export function createProductUsageSummaryPageRenderer({ aiosOrigin }) {
  const serveProductUsageSummaryPage = createAdminHtmlRenderer(
    "product-usage-summary.html",
    {
      PLATFORM_AIOS_ORIGIN_JSON: serializeAdminScriptValue(aiosOrigin),
    },
  );
  return serveProductUsageSummaryPage;
}
