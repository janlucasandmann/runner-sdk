import {
  AudioLines,
  Bot,
  Code2,
  Database,
  FunctionSquare,
  Globe,
  ReceiptText,
  Shield,
  UsersRound,
} from "lucide-react";

import type {
  ResourceOverviewAnalyticsModel,
  ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";
import type {
  DevelopHomeResourceRow,
} from "../page/develop-home-overview-page.js";

type UnknownRecord = Record<string, unknown>;

type MetricKey =
  | "hostingRequests"
  | "apiRequests"
  | "functionCalls"
  | "databaseReads"
  | "databaseWrites"
  | "agentRuntimeRuns"
  | "voiceCalls"
  | "secretReads"
  | "authEvents"
  | "paymentCheckoutSessions"
  | "computeTokens"
  | "errors";

interface ResourceDefinition {
  id: string;
  kind: string;
  label: string;
  description: string;
  icon: DevelopHomeResourceRow["icon"];
  activityKeys: readonly MetricKey[];
}

interface MetricAggregate {
  labels: string[];
  series: Record<MetricKey, number[]>;
  totals: Record<MetricKey, number>;
}

export interface CreateDevelopHomeOverviewModelOptions {
  serverRecords: readonly unknown[];
  databaseRecords: readonly unknown[];
  serverAnalytics?: unknown;
  databaseAnalytics?: unknown;
  period: ResourceOverviewPeriod;
  loading?: boolean;
  error?: string;
}

export interface DevelopHomeOverviewModel {
  rows: DevelopHomeResourceRow[];
  analytics: ResourceOverviewAnalyticsModel;
  totalResourceCount: number;
}

const METRIC_KEYS: readonly MetricKey[] = [
  "hostingRequests",
  "apiRequests",
  "functionCalls",
  "databaseReads",
  "databaseWrites",
  "agentRuntimeRuns",
  "voiceCalls",
  "secretReads",
  "authEvents",
  "paymentCheckoutSessions",
  "computeTokens",
  "errors",
];

const SERVER_ACTIVITY_KEYS: readonly MetricKey[] = [
  "hostingRequests",
  "apiRequests",
  "functionCalls",
  "agentRuntimeRuns",
  "voiceCalls",
  "secretReads",
  "authEvents",
  "paymentCheckoutSessions",
];

const DATABASE_ACTIVITY_KEYS: readonly MetricKey[] = [
  "databaseReads",
  "databaseWrites",
];

const RESOURCE_DEFINITIONS: readonly ResourceDefinition[] = Object.freeze([
  {
    id: "web-apps",
    kind: "web_app",
    label: "Web Apps",
    description: "Deploy and operate browser applications.",
    icon: Globe,
    activityKeys: ["hostingRequests"],
  },
  {
    id: "apis",
    kind: "api",
    label: "APIs",
    description: "Publish programmatic service endpoints.",
    icon: Code2,
    activityKeys: ["apiRequests"],
  },
  {
    id: "functions",
    kind: "function",
    label: "Functions",
    description: "Run focused serverless handlers.",
    icon: FunctionSquare,
    activityKeys: ["functionCalls"],
  },
  {
    id: "databases",
    kind: "database",
    label: "Databases",
    description: "Persist structured application data.",
    icon: Database,
    activityKeys: DATABASE_ACTIVITY_KEYS,
  },
  {
    id: "authentication",
    kind: "auth",
    label: "Authentication",
    description: "Manage users, sessions, and access.",
    icon: UsersRound,
    activityKeys: ["authEvents"],
  },
  {
    id: "agent-runtime",
    kind: "agent_runtime",
    label: "Agent Runtime",
    description: "Host persistent agent execution services.",
    icon: Bot,
    activityKeys: ["agentRuntimeRuns"],
  },
  {
    id: "voice-agents",
    kind: "voice_agent",
    label: "Voice Agents",
    description: "Operate realtime conversational agents.",
    icon: AudioLines,
    activityKeys: ["voiceCalls"],
  },
  {
    id: "secrets",
    kind: "secrets",
    label: "Secrets",
    description: "Store credentials for deployed resources.",
    icon: Shield,
    activityKeys: ["secretReads"],
  },
  {
    id: "payments",
    kind: "payments",
    label: "Payments",
    description: "Accept and observe checkout activity.",
    icon: ReceiptText,
    activityKeys: ["paymentCheckoutSessions"],
  },
]);

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function canonicalizeKind(value: unknown): string {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
  if (normalized === "webapp") return "web_app";
  if (normalized === "agent") return "agent_runtime";
  if (normalized === "voice") return "voice_agent";
  if (normalized === "authentication") return "auth";
  if (normalized === "secret") return "secrets";
  if (normalized === "payment") return "payments";
  return normalized;
}

function unwrapResources(value: unknown): unknown[] {
  const envelope = asRecord(value);
  const analytics = asRecord(envelope.analytics || envelope.data);
  for (const candidate of [
    analytics.resources,
    asRecord(envelope.data).resources,
    envelope.resources,
    envelope.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function unwrapResourceRecord(value: unknown): UnknownRecord {
  const envelope = asRecord(value);
  return asRecord(
    envelope.server
      || envelope.database
      || envelope.resource
      || envelope,
  );
}

function isActiveResource(value: unknown): boolean {
  const record = unwrapResourceRecord(value);
  const id = String(record.id || "").trim();
  const status = String(record.status || record.state || "")
    .trim()
    .toLowerCase();
  return Boolean(id) && status !== "deleted";
}

function formatValue(value: unknown): string {
  const number = Math.max(0, Math.round(asNumber(value)));
  if (number >= 1_000_000) {
    return `${(number / 1_000_000)
      .toFixed(number >= 10_000_000 ? 0 : 1)
      .replace(".0", "")}M`;
  }
  if (number >= 1_000) {
    return `${(number / 1_000)
      .toFixed(number >= 10_000 ? 0 : 1)
      .replace(".0", "")}k`;
  }
  return number.toLocaleString("en-US");
}

function readFirstNumber(
  record: UnknownRecord,
  keys: readonly string[],
): number {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return asNumber(record[key]);
    }
  }
  return 0;
}

function getBucketTimestamp(bucket: UnknownRecord): string {
  return String(
    bucket.bucketStart
      || bucket.bucket_start
      || bucket.timestamp
      || bucket.time
      || bucket.createdAt
      || bucket.created_at
      || "",
  ).trim();
}

function formatBucketLabel(
  value: string,
  period: ResourceOverviewPeriod,
): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(
    "en-US",
    period === "day"
      ? { hour: "numeric" }
      : period === "week"
        ? { weekday: "short" }
        : { month: "short", day: "numeric" },
  ).format(date);
}

function getMetricKeyForKind(kind: string): MetricKey | null {
  switch (kind) {
    case "web_app": return "hostingRequests";
    case "api": return "apiRequests";
    case "function": return "functionCalls";
    case "agent_runtime": return "agentRuntimeRuns";
    case "voice_agent": return "voiceCalls";
    case "secrets": return "secretReads";
    case "auth": return "authEvents";
    case "payments": return "paymentCheckoutSessions";
    default: return null;
  }
}

function readChartBuckets(value: unknown): unknown[] {
  const envelope = asRecord(value);
  const resource = unwrapResourceRecord(value);
  const candidates = [
    asRecord(envelope.charts).traffic,
    asRecord(asRecord(envelope.analytics).charts).traffic,
    asRecord(asRecord(envelope.data).charts).traffic,
    asRecord(resource.charts).traffic,
    asRecord(asRecord(resource.analytics).charts).traffic,
    asRecord(envelope.charts).operations,
    asRecord(asRecord(envelope.analytics).charts).operations,
    asRecord(resource.charts).operations,
    envelope.traffic,
    envelope.traffic24h,
    envelope.operations,
    envelope.usage,
  ];
  return asArray(candidates.find(Array.isArray));
}

function createEmptyMetricMap(): Record<MetricKey, number> {
  return Object.fromEntries(
    METRIC_KEYS.map((key) => [key, 0]),
  ) as Record<MetricKey, number>;
}

function readDirectMetricAggregate(
  value: unknown,
): {
  labels: string[];
  series: Partial<Record<MetricKey, number[]>>;
  totals: Partial<Record<MetricKey, number>>;
} {
  const envelope = asRecord(value);
  const analytics = asRecord(envelope.analytics || envelope);
  const seriesSource = asRecord(analytics.series);
  const totalsSource = asRecord(analytics.totals);
  const labels = asArray(analytics.labels).map(String);
  const series: Partial<Record<MetricKey, number[]>> = {};
  const totals: Partial<Record<MetricKey, number>> = {};
  METRIC_KEYS.forEach((key) => {
    const values = asArray(seriesSource[key]).map(asNumber);
    if (values.length) series[key] = values;
    if (totalsSource[key] !== undefined) {
      totals[key] = asNumber(totalsSource[key]);
    }
  });
  return { labels, series, totals };
}

function aggregateMetrics(
  serverAnalytics: unknown,
  databaseAnalytics: unknown,
  period: ResourceOverviewPeriod,
): MetricAggregate {
  const labelOrder: string[] = [];
  const byTimestamp = new Map<string, Record<MetricKey, number>>();
  const addMetric = (
    timestamp: string,
    key: MetricKey,
    value: unknown,
  ) => {
    if (!timestamp) return;
    if (!byTimestamp.has(timestamp)) {
      byTimestamp.set(timestamp, createEmptyMetricMap());
      labelOrder.push(timestamp);
    }
    const metrics = byTimestamp.get(timestamp);
    if (metrics) metrics[key] += asNumber(value);
  };

  unwrapResources(serverAnalytics).forEach((entry) => {
    const record = unwrapResourceRecord(entry);
    const metricKey = getMetricKeyForKind(canonicalizeKind(record.kind));
    readChartBuckets(entry).forEach((rawBucket) => {
      const bucket = asRecord(rawBucket);
      const timestamp = getBucketTimestamp(bucket);
      if (metricKey) {
        addMetric(timestamp, metricKey, readFirstNumber(bucket, [
          "total",
          "requests",
          "requestCount",
          "request_count",
          "invocations",
          "invocationCount",
        ]));
      }
      addMetric(timestamp, "computeTokens", readFirstNumber(bucket, [
        "computeTokens",
        "compute_tokens",
        "costCT",
        "cost_ct",
        "ct",
      ]));
      addMetric(
        timestamp,
        "errors",
        readFirstNumber(bucket, [
          "errors",
          "errorCount",
          "error_count",
        ]) + readFirstNumber(bucket, [
          "clientErrors",
          "client_errors",
        ]) + readFirstNumber(bucket, [
          "serverErrors",
          "server_errors",
        ]),
      );
    });
  });

  unwrapResources(databaseAnalytics).forEach((entry) => {
    readChartBuckets(entry).forEach((rawBucket) => {
      const bucket = asRecord(rawBucket);
      const timestamp = getBucketTimestamp(bucket);
      addMetric(timestamp, "databaseReads", readFirstNumber(bucket, [
        "reads",
        "readCount",
        "read_count",
        "selects",
      ]));
      addMetric(timestamp, "databaseWrites", readFirstNumber(bucket, [
        "writes",
        "writeCount",
        "write_count",
        "mutations",
      ]));
      addMetric(timestamp, "computeTokens", readFirstNumber(bucket, [
        "computeTokens",
        "compute_tokens",
        "costCT",
        "cost_ct",
        "ct",
      ]));
      addMetric(timestamp, "errors", readFirstNumber(bucket, [
        "errors",
        "errorCount",
        "error_count",
      ]));
    });
  });

  const directAggregates = [
    readDirectMetricAggregate(serverAnalytics),
    readDirectMetricAggregate(databaseAnalytics),
  ];
  if (!labelOrder.length) {
    directAggregates.forEach((aggregate) => {
      aggregate.labels.forEach((label) => {
        if (!byTimestamp.has(label)) {
          byTimestamp.set(label, createEmptyMetricMap());
          labelOrder.push(label);
        }
      });
      Object.entries(aggregate.series).forEach(([rawKey, values]) => {
        const key = rawKey as MetricKey;
        values?.forEach((value, index) => {
          const label = aggregate.labels[index];
          if (label) addMetric(label, key, value);
        });
      });
    });
  }

  labelOrder.sort((left, right) => {
    const leftTime = Date.parse(left);
    const rightTime = Date.parse(right);
    return Number.isFinite(leftTime) && Number.isFinite(rightTime)
      ? leftTime - rightTime
      : 0;
  });
  const series = Object.fromEntries(METRIC_KEYS.map((key) => [
    key,
    labelOrder.map((label) => byTimestamp.get(label)?.[key] || 0),
  ])) as Record<MetricKey, number[]>;
  const totals = createEmptyMetricMap();
  METRIC_KEYS.forEach((key) => {
    totals[key] = series[key].reduce((sum, value) => sum + value, 0);
    directAggregates.forEach((aggregate) => {
      if (!series[key].length && aggregate.totals[key] !== undefined) {
        totals[key] += asNumber(aggregate.totals[key]);
      }
    });
  });

  return {
    labels: labelOrder.map((label) => formatBucketLabel(label, period)),
    series,
    totals,
  };
}

function sumMetrics(
  metrics: Record<MetricKey, number>,
  keys: readonly MetricKey[],
): number {
  return keys.reduce((sum, key) => sum + asNumber(metrics[key]), 0);
}

function sumSeries(
  series: Record<MetricKey, number[]>,
  keys: readonly MetricKey[],
  length: number,
): number[] {
  return Array.from({ length }, (_, index) => (
    keys.reduce((sum, key) => sum + asNumber(series[key][index]), 0)
  ));
}

export function createDevelopHomeOverviewModel({
  serverRecords,
  databaseRecords,
  serverAnalytics,
  databaseAnalytics,
  period,
  loading = false,
  error = "",
}: CreateDevelopHomeOverviewModelOptions): DevelopHomeOverviewModel {
  const activeServers = serverRecords.filter(isActiveResource);
  const activeDatabases = databaseRecords.filter(isActiveResource);
  const serverKindCounts = activeServers.reduce<Record<string, number>>(
    (counts, value) => {
      const kind = canonicalizeKind(unwrapResourceRecord(value).kind);
      counts[kind] = (counts[kind] || 0) + 1;
      return counts;
    },
    {},
  );
  const aggregate = aggregateMetrics(
    serverAnalytics,
    databaseAnalytics,
    period,
  );
  const rows = RESOURCE_DEFINITIONS.map((definition) => {
    const resourceCount = definition.kind === "database"
      ? activeDatabases.length
      : serverKindCounts[definition.kind] || 0;
    const operationCount = sumMetrics(
      aggregate.totals,
      definition.activityKeys,
    );
    return {
      ...definition,
      resourceCount,
      resourceCountLabel: formatValue(resourceCount),
      operationCount,
      operationCountLabel: formatValue(operationCount),
      searchText: [
        definition.label,
        definition.description,
        resourceCount > 0 ? "in use active" : "not in use empty",
      ].join(" "),
    };
  });
  const totalResourceCount = rows.reduce(
    (sum, row) => sum + row.resourceCount,
    0,
  );
  const serverOperations = sumMetrics(
    aggregate.totals,
    SERVER_ACTIVITY_KEYS,
  );
  const databaseOperations = sumMetrics(
    aggregate.totals,
    DATABASE_ACTIVITY_KEYS,
  );

  return {
    rows,
    totalResourceCount,
    analytics: {
      title: "Develop resource activity",
      ariaLabel: "Develop resource activity over time",
      loading,
      error: error || undefined,
      labels: aggregate.labels,
      metrics: [
        {
          id: "resources",
          label: "Resources",
          value: formatValue(totalResourceCount),
          color: "#7effff",
        },
        {
          id: "server-operations",
          label: "Server Operations",
          value: formatValue(serverOperations),
          color: "#8fc4ff",
        },
        {
          id: "database-operations",
          label: "Database Operations",
          value: formatValue(databaseOperations),
          color: "#6750ff",
        },
        {
          id: "errors",
          label: "Errors",
          value: formatValue(aggregate.totals.errors),
          color: "#f53b3a",
        },
        {
          id: "compute-tokens",
          label: "Compute Tokens",
          value: formatValue(aggregate.totals.computeTokens),
          color: "#9ff6ce",
        },
      ],
      series: [
        {
          id: "server-operations",
          label: "Server Operations",
          color: "#8fc4ff",
          values: sumSeries(
            aggregate.series,
            SERVER_ACTIVITY_KEYS,
            aggregate.labels.length,
          ),
          type: "line",
        },
        {
          id: "database-operations",
          label: "Database Operations",
          color: "#6750ff",
          values: sumSeries(
            aggregate.series,
            DATABASE_ACTIVITY_KEYS,
            aggregate.labels.length,
          ),
          type: "line",
        },
      ],
    },
  };
}
