import type {
  ResourceOverviewAnalyticsModel,
  ResourceOverviewSeries,
} from "../../../../../platform-ui/pages/overview/index.js";
import type {
  DevelopResourceDateFormatters,
  DevelopResourceDefinition,
  DevelopResourceOperationalMetrics,
  DevelopResourceOverviewAnalyticsOptions,
  DevelopResourceOverviewRow,
} from "./resource-overview-types.js";

type UnknownRecord = Record<string, unknown>;

const SERIES_COLORS = ["#8fc4ff", "#6750ff", "#7effff", "#4da3ff"];
const KPI_COLORS = ["#7effff", "#8fc4ff", "#6750ff", "#f53b3a", "#9ff6ce"];

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
}

function parseTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatCompactNumber(value: unknown): string {
  const numericValue = Math.round(asPositiveNumber(value));
  if (numericValue >= 1_000_000) return `${(numericValue / 1_000_000).toFixed(numericValue >= 10_000_000 ? 0 : 1).replace(".0", "")}M`;
  if (numericValue >= 1_000) return `${(numericValue / 1_000).toFixed(numericValue >= 10_000 ? 0 : 1).replace(".0", "")}k`;
  return numericValue.toLocaleString("en-US");
}

function formatDefaultDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(timestamp);
}

function getMostRecentDate(record: UnknownRecord): string {
  const metadata = asRecord(record.metadata);
  const billing = asRecord(metadata.resourceBilling);
  const candidates = [
    record.lastUsedAt,
    record.lastRunAt,
    metadata.lastUsedAt,
    metadata.lastRunAt,
    record.lastDeployedAt,
    billing.activeSessionLastSettledAt,
    billing.activeSessionStartedAt,
    billing.lastSettledAt,
    billing.activeSince,
    record.updatedAt,
  ];
  return candidates.reduce<{ value: string; timestamp: number }>((latest, candidate) => {
    const value = asString(candidate);
    const timestamp = parseTimestamp(value);
    return timestamp > latest.timestamp ? { value, timestamp } : latest;
  }, { value: "", timestamp: 0 }).value;
}

function isPublished(record: UnknownRecord, definition: DevelopResourceDefinition): boolean {
  const status = asString(record.status).toLowerCase();
  if (definition.kind === "database") return status === "active";
  return status === "deployed" || Boolean(asString(record.serviceUrl) || asString(record.customDomain) || asString(record.cloudRunServiceName));
}

export function normalizeDevelopResourceOverviewRows(
  records: readonly unknown[],
  definition: DevelopResourceDefinition,
  formatters: DevelopResourceDateFormatters = {},
): DevelopResourceOverviewRow[] {
  const formatDate = formatters.formatDate || formatDefaultDate;
  const formatExactDate = formatters.formatExactDate || formatDefaultDate;

  return records.flatMap((rawRecord) => {
    const record = asRecord(rawRecord);
    const sourceId = asString(record.id);
    if (!sourceId) return [];
    const metadata = asRecord(record.metadata);
    const createdValue = asString(record.createdAt) || asString(metadata.createdAt);
    const lastUsedValue = getMostRecentDate(record);
    const resourceType = definition.kind === "database" || asString(record.resourceType) === "database" ? "database" : "server";
    const name = asString(record.name) || `Untitled ${definition.singular}`;
    const description = asString(record.description) || definition.singular;
    const published = isPublished(record, definition);
    return [{
      id: `${resourceType}:${sourceId}`,
      sourceId,
      resourceType,
      kind: definition.kind,
      name,
      description,
      typeLabel: definition.singular,
      published,
      createdAt: parseTimestamp(createdValue),
      createdLabel: createdValue ? formatDate(createdValue) : "-",
      createdTitle: createdValue ? formatExactDate(createdValue) : "",
      lastUsedAt: parseTimestamp(lastUsedValue),
      lastUsedLabel: lastUsedValue ? formatDate(lastUsedValue) : "Never",
      lastUsedTitle: lastUsedValue ? formatExactDate(lastUsedValue) : "",
      searchText: [name, description, definition.singular, published ? "published" : "draft"].join(" "),
      isDraft: sourceId.includes("draft"),
    }];
  });
}

function normalizeValues(values: readonly number[] | undefined, count: number): number[] {
  if (!Array.isArray(values) || values.length !== count) return Array.from({ length: count }, () => 0);
  return values.map(asPositiveNumber);
}

function buildChartSeries(
  definition: DevelopResourceDefinition,
  metrics: DevelopResourceOperationalMetrics | null | undefined,
  labels: readonly string[],
): ResourceOverviewSeries[] {
  const primaryMetric = definition.activityMetrics[0];
  const topSeries = primaryMetric ? metrics?.topResourceSeries?.[primaryMetric.key] : undefined;
  const normalizedTopSeries = Array.isArray(topSeries)
    ? topSeries.filter((entry) => asPositiveNumber(entry.total) > 0).slice(0, 4)
    : [];
  if (normalizedTopSeries.length > 0) {
    return normalizedTopSeries.map((entry, index) => ({
      id: asString(entry.id) || `${primaryMetric.id}-${index}`,
      label: asString(entry.label) || definition.singular,
      values: normalizeValues(entry.values, labels.length),
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      stack: primaryMetric.id,
      type: "line",
    }));
  }
  return definition.activityMetrics.slice(0, 2).map((activityMetric, index) => ({
    id: activityMetric.id,
    label: activityMetric.label,
    values: normalizeValues(metrics?.series?.[activityMetric.key], labels.length),
    color: activityMetric.color || SERIES_COLORS[index % SERIES_COLORS.length],
    type: "line",
  }));
}

export function createDevelopResourceOverviewAnalyticsModel(
  definition: DevelopResourceDefinition,
  metrics: DevelopResourceOperationalMetrics | null | undefined,
  options: DevelopResourceOverviewAnalyticsOptions = {},
): ResourceOverviewAnalyticsModel {
  const labels = Array.isArray(metrics?.labels) ? metrics.labels.map(String) : [];
  const activityMetrics = definition.activityMetrics.slice(0, 2);
  const resourceCount = asPositiveNumber(
    metrics?.resourceCounts?.[definition.resourceCountKey]
      ?? metrics?.resourceCount
      ?? options.resourceCount,
  );
  const publishedCount = asPositiveNumber(options.publishedCount);
  const primaryKpis = activityMetrics.map((activityMetric, index) => ({
    id: activityMetric.id,
    label: activityMetric.label,
    value: formatCompactNumber(metrics?.totals?.[activityMetric.key]),
    color: KPI_COLORS[index + 1],
  }));
  if (primaryKpis.length < 2) {
    primaryKpis.push({
      id: `${definition.kind}-published`,
      label: definition.kind === "voice_agent" ? "Enabled" : "Published",
      value: formatCompactNumber(publishedCount),
      color: KPI_COLORS[2],
    });
  }

  return {
    title: `${definition.singular} activity`,
    ariaLabel: `${definition.singular} activity over time`,
    loading: options.loading,
    error: options.error || undefined,
    emptyState: `No ${definition.singular.toLowerCase()} activity yet.`,
    metrics: [
      { id: `${definition.kind}-resources`, label: definition.plural, value: formatCompactNumber(resourceCount), color: KPI_COLORS[0] },
      ...primaryKpis,
      { id: `${definition.kind}-errors`, label: "Errors", value: formatCompactNumber(metrics?.totals?.errors), color: KPI_COLORS[3] },
      { id: `${definition.kind}-cost`, label: "Cost in CT", value: formatCompactNumber(metrics?.totals?.computeTokens), color: KPI_COLORS[4] },
    ],
    labels,
    series: buildChartSeries(definition, metrics, labels),
  };
}
