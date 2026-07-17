import { describe, expect, it } from "vitest";

import { createDevelopHomeOverviewModel } from "./develop-home-overview-model.js";

describe("Develop Home overview model", () => {
  it("combines resource catalogs and operational analytics", () => {
    const model = createDevelopHomeOverviewModel({
      period: "month",
      serverRecords: [
        { id: "web_1", kind: "web_app", status: "running" },
        { id: "api_1", kind: "api", status: "running" },
        { id: "old", kind: "api", status: "deleted" },
      ],
      databaseRecords: [{ id: "db_1", status: "ready" }],
      serverAnalytics: {
        analytics: {
          resources: [{
            server: { id: "web_1", kind: "web_app" },
            charts: {
              traffic: [{
                bucketStart: "2026-07-01T00:00:00.000Z",
                requests: 12,
                errors: 1,
              }],
            },
          }],
        },
      },
      databaseAnalytics: {
        analytics: {
          resources: [{
            database: { id: "db_1" },
            charts: {
              operations: [{
                bucketStart: "2026-07-01T00:00:00.000Z",
                reads: 5,
                writes: 3,
              }],
            },
          }],
        },
      },
    });

    expect(model.totalResourceCount).toBe(3);
    expect(model.rows.find((row) => row.kind === "web_app"))
      .toMatchObject({ resourceCount: 1, operationCount: 12 });
    expect(model.rows.find((row) => row.kind === "database"))
      .toMatchObject({ resourceCount: 1, operationCount: 8 });
    expect(model.analytics.metrics?.find((metric) => metric.id === "errors"))
      .toMatchObject({ value: "1" });
  });
});
