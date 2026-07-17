import assert from "node:assert/strict";

import { createAdminPageRenderers } from "./pages.mjs";
import { serializeAdminScriptValue } from "./render-admin-template.mjs";

function render(renderer) {
  const response = {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body = "") {
      this.body = String(body);
    },
  };
  renderer(response);
  return response;
}

const aiosOrigin = "https://computer-agents.example.test";
const renderers = createAdminPageRenderers({
  aiosOrigin,
  feedbackSummaryAllowedEmail: "operator@example.test",
});

for (const renderer of Object.values(renderers)) {
  const response = render(renderer);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "text/html; charset=utf-8");
  assert.match(response.body, /<!doctype html>/i);
  assert.doesNotMatch(response.body, /__PLATFORM_[A-Z_]+__/);
}

assert.match(
  render(renderers.serveFeedbackSummaryPage).body,
  /operator@example\.test/,
);
assert.equal(
  serializeAdminScriptValue("</script>\u2028"),
  "\"\\u003c/script>\\u2028\"",
);

console.log("Platform admin template isolation and safe substitution contracts passed.");
