import assert from "node:assert/strict";
import test from "node:test";

import {
  extractFineTuningThreadSummaryFromRecords,
} from "./thread-data.mjs";

test("optimizer thread summaries use the shared fine-tuning sanitizer", () => {
  const summary = extractFineTuningThreadSummaryFromRecords([{
    type: "run_summary",
    timestamp: "2026-08-01T22:00:00.000Z",
    summary: "Improved extraction instructions.\n\ndata: {\"type\":\"raw_provider_event\"}",
  }]);

  assert.equal(summary, "Improved extraction instructions.");
});
