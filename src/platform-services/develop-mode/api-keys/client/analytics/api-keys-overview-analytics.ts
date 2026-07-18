import type { PlatformAnalyticsModel } from "../../../../../platform-ui/components/composite/analytics/index.js";
import type { ApiKeysOverviewAnalyticsSnapshot } from "./api-keys-overview-analytics-client.js";

export interface CreateApiKeysOverviewAnalyticsOptions {
  snapshot?: ApiKeysOverviewAnalyticsSnapshot | null;
  fallbackTotalKeyCount?: number;
  fallbackUsedKeyCount?: number;
  loading?: boolean;
  error?: string | null;
}

function nonNegativeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function formatCount(value: unknown): string {
  return Math.round(nonNegativeNumber(value)).toLocaleString("en-US");
}

export function createApiKeysOverviewAnalytics({
  snapshot = null,
  fallbackTotalKeyCount = 0,
  fallbackUsedKeyCount = 0,
  loading = false,
  error = null,
}: CreateApiKeysOverviewAnalyticsOptions): PlatformAnalyticsModel {
  const summary = snapshot?.summary;
  const buckets = snapshot?.buckets || [];

  return {
    title: "API activity",
    ariaLabel: "API requests and token consumption over time",
    loading,
    error: error || undefined,
    metrics: [
      {
        id: "requests",
        label: "Requests",
        value: formatCount(summary?.requestCount),
        color: "#8fc4ff",
      },
      {
        id: "tokens",
        label: "Tokens Consumed",
        value: formatCount(summary?.tokenCount),
        color: "#7effff",
      },
      {
        id: "keys",
        label: "API Keys",
        value: formatCount(summary?.totalKeyCount ?? fallbackTotalKeyCount),
        color: "#6750ff",
      },
      {
        id: "used-keys",
        label: "Used API Keys",
        value: formatCount(summary?.usedKeyCount ?? fallbackUsedKeyCount),
        color: "#9ff6ce",
      },
    ],
    labels: buckets.map((bucket) => bucket.label),
    series: [
      {
        id: "requests",
        label: "Requests",
        color: "#8fc4ff",
        values: buckets.map((bucket) => nonNegativeNumber(bucket.requestCount)),
        valueKind: "count",
        type: "bar",
      },
      {
        id: "tokens",
        label: "Tokens",
        color: "#7effff",
        values: buckets.map((bucket) => nonNegativeNumber(bucket.tokenCount)),
        valueKind: "tokens",
        type: "line",
        axis: "secondary",
      },
    ],
  };
}
