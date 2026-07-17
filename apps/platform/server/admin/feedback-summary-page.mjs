import {
  createAdminHtmlRenderer,
  serializeAdminScriptValue,
} from "./render-admin-template.mjs";

export function createFeedbackSummaryPageRenderer({ aiosOrigin, feedbackSummaryAllowedEmail }) {
  const serveFeedbackSummaryPage = createAdminHtmlRenderer(
    "feedback-summary.html",
    {
      PLATFORM_AIOS_ORIGIN_JSON: serializeAdminScriptValue(aiosOrigin),
      PLATFORM_ALLOWED_EMAIL_JSON: serializeAdminScriptValue(
        feedbackSummaryAllowedEmail,
      ),
    },
  );
  return serveFeedbackSummaryPage;
}
