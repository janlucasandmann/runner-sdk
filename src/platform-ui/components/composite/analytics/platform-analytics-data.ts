import type { PlatformAnalyticsModel } from "./platform-analytics-types.js";

export function resolvePlatformAnalyticsHasData(analytics: PlatformAnalyticsModel): boolean {
  const labels = Array.from(analytics.labels || []);
  const series = Array.from(analytics.series || []).filter(
    (entry) => entry.values.length === labels.length,
  );

  if (typeof analytics.hasData === "boolean") {
    return analytics.hasData && labels.length > 0 && series.length > 0;
  }

  return labels.length > 0
    && series.some((entry) => entry.values.some((value) => Number(value) !== 0));
}
