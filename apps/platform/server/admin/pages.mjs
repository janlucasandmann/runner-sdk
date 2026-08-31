import { createAdminAccessDeniedPageRenderer } from "./admin-access-denied-page.mjs";
import { createEnvironmentGuiPageRenderer } from "./environment-gui-page.mjs";
import { createFeedbackSummaryPageRenderer } from "./feedback-summary-page.mjs";
import { createProductUsageSummaryPageRenderer } from "./product-usage-summary-page.mjs";
import { createProductUsageSummaryV2PageRenderer } from "./product-usage-summary-v2-page.mjs";

/** Composes the restricted operational-page renderers used by the platform host. */
export function createAdminPageRenderers({
  aiosOrigin,
  feedbackSummaryAllowedEmail,
}) {
  return Object.freeze({
    serveAdminAccessDeniedPage: createAdminAccessDeniedPageRenderer({ aiosOrigin }),
    serveEnvironmentGuiViewerPage: createEnvironmentGuiPageRenderer(),
    serveFeedbackSummaryPage: createFeedbackSummaryPageRenderer({
      aiosOrigin,
      feedbackSummaryAllowedEmail,
    }),
    serveProductUsageSummaryPage: createProductUsageSummaryPageRenderer({ aiosOrigin }),
    serveProductUsageSummaryPageV2: createProductUsageSummaryV2PageRenderer({ aiosOrigin }),
  });
}
