import assert from "node:assert/strict";
import test from "node:test";

import {
  extractPlatformOverviewItems,
  normalizePlatformOverviewServerKind,
  parsePlatformOverviewDurationMs,
  resolvePlatformOverviewDurationMs,
  resolvePlatformOverviewTimestampMs,
} from "./resource-overview-domain.mjs";

test("normalizes resource overview durations", () => {
  assert.equal(parsePlatformOverviewDurationMs("1.5m"), 90_000);
  assert.equal(parsePlatformOverviewDurationMs("-2s"), null);
  assert.equal(resolvePlatformOverviewDurationMs({ environmentMinutes: 2 }), 120_000);
  assert.equal(resolvePlatformOverviewDurationMs({
    startedAt: "2026-07-16T10:00:00.000Z",
    completedAt: "2026-07-16T10:00:03.000Z",
  }), 3_000);
});

test("normalizes overview record timestamps, kinds, and collection envelopes", () => {
  assert.equal(resolvePlatformOverviewTimestampMs({
    updatedAt: "2026-07-16T10:00:00.000Z",
  }), Date.parse("2026-07-16T10:00:00.000Z"));
  assert.equal(normalizePlatformOverviewServerKind("payment"), "payments");
  assert.equal(normalizePlatformOverviewServerKind("unknown"), "web_app");
  assert.deepEqual(extractPlatformOverviewItems({
    results: [{ id: 1 }],
  }, ["results"]), [{ id: 1 }]);
});
