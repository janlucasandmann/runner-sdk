import type {
  PlatformAnalyticsModel,
} from "../../../../../../platform-ui/components/composite/analytics/index.js";
import type { InferenceEndpointRow } from "../inference-endpoint-model.js";

export type InferenceEndpointAnalyticsTimeframe = "day" | "week" | "month";

export interface InferenceEndpointUsageThread {
  id?: string;
  agentId?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheTokens?: number;
  totalTokens?: number;
  model?: string;
  modelId?: string;
  metadata?: Record<string, unknown> | null;
}

export interface InferenceEndpointUsageAgent {
  id?: string;
  model?: string;
  modelId?: string;
  metadata?: Record<string, unknown> | null;
}

export interface BuildInferenceEndpointAnalyticsOptions {
  endpoint: InferenceEndpointRow;
  threads?: readonly InferenceEndpointUsageThread[];
  agents?: readonly InferenceEndpointUsageAgent[];
  timeframe?: InferenceEndpointAnalyticsTimeframe;
  loading?: boolean;
  error?: string;
  now?: number;
}

interface AnalyticsBucket {
  key: string;
  label: string;
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

interface ParsedExternalModelReference {
  endpointId: string | null;
  providerType: string;
  modelId: string;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readCount(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function normalizeProvider(value: unknown): string {
  return readText(value).toLowerCase().replace(/-/g, "_");
}

function decodeReferencePart(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function parseExternalModelReference(value: unknown): ParsedExternalModelReference | null {
  const raw = readText(value);
  if (!raw.toLowerCase().startsWith("external:")) return null;
  const parts = raw.split(":");
  if (parts.length < 3) return null;
  const legacy = parts.length === 3;
  const endpointId = legacy ? null : decodeReferencePart(parts[1] || "") || null;
  const providerType = normalizeProvider(parts[legacy ? 1 : 2]);
  const modelId = decodeReferencePart(parts.slice(legacy ? 2 : 3).join(":"));
  if (!providerType || !modelId || (!legacy && !endpointId)) return null;
  return { endpointId, providerType, modelId };
}

function readNestedInferenceRecord(metadata: Record<string, unknown>): Record<string, unknown> {
  const runnerPlayground = readRecord(metadata.runnerPlayground);
  return {
    ...readRecord(metadata.inference),
    ...readRecord(runnerPlayground.inference),
  };
}

function readThreadEndpointId(thread: InferenceEndpointUsageThread): string {
  const metadata = readRecord(thread.metadata);
  const inference = readNestedInferenceRecord(metadata);
  return readText(
    inference.endpointId,
    inference.endpoint_id,
    metadata.inferenceEndpointId,
    metadata.inference_endpoint_id,
  );
}

function readThreadModel(
  thread: InferenceEndpointUsageThread,
  agentsById: ReadonlyMap<string, InferenceEndpointUsageAgent>,
): string {
  const metadata = readRecord(thread.metadata);
  const inference = readNestedInferenceRecord(metadata);
  const runnerPlayground = readRecord(metadata.runnerPlayground);
  const agent = agentsById.get(readText(thread.agentId));
  const agentMetadata = readRecord(agent?.metadata);
  return readText(
    thread.model,
    thread.modelId,
    inference.model,
    inference.modelId,
    inference.model_id,
    metadata.billingModel,
    metadata.executionModel,
    metadata.agentModel,
    metadata.model,
    metadata.modelId,
    metadata.model_id,
    runnerPlayground.billingModel,
    runnerPlayground.executionModel,
    runnerPlayground.agentModel,
    runnerPlayground.model,
    agent?.model,
    agent?.modelId,
    agentMetadata.model,
    agentMetadata.modelId,
  );
}

function threadUsesEndpoint(
  thread: InferenceEndpointUsageThread,
  endpoint: InferenceEndpointRow,
  agentsById: ReadonlyMap<string, InferenceEndpointUsageAgent>,
): boolean {
  const explicitEndpointId = readThreadEndpointId(thread);
  if (explicitEndpointId) {
    return explicitEndpointId === endpoint.id
      || (endpoint.id.startsWith("local-inference:")
        && explicitEndpointId === endpoint.id.slice("local-inference:".length));
  }

  const modelReference = readThreadModel(thread, agentsById);
  const externalReference = parseExternalModelReference(modelReference);
  if (externalReference?.endpointId) return externalReference.endpointId === endpoint.id;

  if (externalReference && endpoint.kind === "external" && endpoint.isDefault) {
    return normalizeProvider(endpoint.providerType) === externalReference.providerType
      && endpoint.models.includes(externalReference.modelId);
  }

  if (endpoint.deploymentManaged && modelReference) {
    return endpoint.models.some((modelId) => modelId === modelReference);
  }

  return false;
}

function readThreadTimestamp(thread: InferenceEndpointUsageThread): number {
  const value = readText(thread.completedAt, thread.updatedAt, thread.createdAt);
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function dateBucketKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function hourlyBucketKey(date: Date): string {
  const hour = date.getHours() - (date.getHours() % 2);
  return `${dateBucketKey(date)}-${String(hour).padStart(2, "0")}`;
}

function buildBuckets(
  timeframe: InferenceEndpointAnalyticsTimeframe,
  now: number,
): AnalyticsBucket[] {
  if (timeframe === "day") {
    const end = new Date(now);
    end.setMinutes(0, 0, 0);
    end.setHours(end.getHours() - (end.getHours() % 2));
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(end.getTime() - ((11 - index) * TWO_HOURS_MS));
      return {
        key: hourlyBucketKey(date),
        label: date.toLocaleTimeString("en-US", { hour: "numeric" }),
        requests: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
      };
    });
  }

  const length = timeframe === "week" ? 7 : 30;
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  return Array.from({ length }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (length - 1 - index));
    return {
      key: dateBucketKey(date),
      label: timeframe === "week"
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      requests: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
  });
}

function formatMetric(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function buildInferenceEndpointAnalytics({
  endpoint,
  threads = [],
  agents = [],
  timeframe = "month",
  loading = false,
  error = "",
  now = Date.now(),
}: BuildInferenceEndpointAnalyticsOptions): PlatformAnalyticsModel {
  const agentsById = new Map(
    agents
      .map((agent) => [readText(agent.id), agent] as const)
      .filter(([id]) => Boolean(id)),
  );
  const buckets = buildBuckets(timeframe, now);
  const bucketsByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const thread of threads) {
    if (!threadUsesEndpoint(thread, endpoint, agentsById)) continue;
    const timestamp = readThreadTimestamp(thread);
    if (!timestamp) continue;
    const date = new Date(timestamp);
    const key = timeframe === "day" ? hourlyBucketKey(date) : dateBucketKey(date);
    const bucket = bucketsByKey.get(key);
    if (!bucket) continue;
    const inputTokens = readCount(thread.inputTokens);
    const outputTokens = readCount(thread.outputTokens);
    const cacheTokens = readCount(thread.cacheTokens);
    bucket.requests += 1;
    bucket.inputTokens += inputTokens;
    bucket.outputTokens += outputTokens;
    bucket.totalTokens += Math.max(
      readCount(thread.totalTokens),
      inputTokens + outputTokens + cacheTokens,
    );
  }

  const requestCount = buckets.reduce((total, bucket) => total + bucket.requests, 0);
  const inputTokens = buckets.reduce((total, bucket) => total + bucket.inputTokens, 0);
  const outputTokens = buckets.reduce((total, bucket) => total + bucket.outputTokens, 0);
  const totalTokens = buckets.reduce((total, bucket) => total + bucket.totalTokens, 0);

  return {
    ariaLabel: "Inference endpoint activity",
    loading,
    error: error || undefined,
    hasData: requestCount > 0,
    metrics: [
      { id: "requests", label: "Requests", value: formatMetric(requestCount), color: "#8fc4ff" },
      { id: "tokens", label: "Total Tokens", value: formatMetric(totalTokens), color: "#7657ff" },
      { id: "input", label: "Input Tokens", value: formatMetric(inputTokens), color: "#7effff" },
      { id: "output", label: "Output Tokens", value: formatMetric(outputTokens), color: "#9ff6ce" },
    ],
    labels: buckets.map((bucket) => bucket.label),
    series: [
      {
        id: "tokens",
        label: "Tokens",
        values: buckets.map((bucket) => bucket.totalTokens),
        color: "#8fc4ff",
        valueKind: "tokens",
      },
      {
        id: "requests",
        label: "Requests",
        values: buckets.map((bucket) => bucket.requests),
        color: "#4da3ff",
        axis: "secondary",
        valueKind: "count",
      },
    ],
  };
}
