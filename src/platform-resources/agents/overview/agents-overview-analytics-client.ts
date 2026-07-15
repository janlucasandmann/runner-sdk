import type { AgentOverviewAnalyticsBucket } from "./agents-overview-analytics.js";

export type AgentsOverviewAnalyticsPeriod = "day" | "week" | "month";

export interface AgentsOverviewAnalyticsResource {
  agentId: string;
  runCount: number;
  tokenCount: number;
  costUsd: number;
  lastUsedAt: string | null;
}

export interface AgentsOverviewAnalyticsSnapshot {
  period: AgentsOverviewAnalyticsPeriod;
  generatedAt: string;
  buckets: AgentOverviewAnalyticsBucket[];
  resources: AgentsOverviewAnalyticsResource[];
}

export interface CachedAgentsOverviewAnalytics {
  data: AgentsOverviewAnalyticsSnapshot;
  loadedAt: number;
  isFresh: boolean;
}

export class AgentsOverviewAnalyticsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AgentsOverviewAnalyticsRequestError";
    this.status = status;
  }
}

export interface AgentsOverviewAnalyticsRequestOptions {
  backendUrl: string;
  headers?: HeadersInit;
  identity?: string;
  period: AgentsOverviewAnalyticsPeriod;
  force?: boolean;
  signal?: AbortSignal;
}

interface AgentsOverviewAnalyticsCacheEntry {
  data: AgentsOverviewAnalyticsSnapshot | null;
  loadedAt: number;
  promise: Promise<AgentsOverviewAnalyticsSnapshot> | null;
}

const CACHE_TTL_MS = 60_000;
const MAX_STALE_AGE_MS = 15 * 60_000;
const STORAGE_PREFIX = "runner-playground:agents-overview-analytics:";
const requestCache = new Map<string, AgentsOverviewAnalyticsCacheEntry>();

function normalizePeriod(value: unknown): AgentsOverviewAnalyticsPeriod {
  return value === "day" || value === "week" ? value : "month";
}

function nonNegativeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function getHeaderValue(headers: HeadersInit | undefined, names: string[]): string {
  try {
    const normalized = new Headers(headers || {});
    for (const name of names) {
      const value = String(normalized.get(name) || "").trim();
      if (value) return value;
    }
  } catch {
    return "";
  }
  return "";
}

function hashScope(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function buildCacheKey(options: AgentsOverviewAnalyticsRequestOptions): string {
  const backendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
  const organizationId = getHeaderValue(options.headers, [
    "x-computer-agents-organization",
    "x-organization-id",
    "x-organization",
    "organization-id",
  ]);
  const authIdentity = String(options.identity || "").trim()
    || getHeaderValue(options.headers, ["x-api-key", "authorization"])
    || "session";
  return `${backendUrl}|${organizationId}|${hashScope(authIdentity)}|${normalizePeriod(options.period)}`;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function formatBucketLabel(bucketStart: string, period: AgentsOverviewAnalyticsPeriod): string {
  const date = new Date(bucketStart);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", period === "day"
    ? { hour: "numeric" }
    : period === "week"
      ? { weekday: "short" }
      : { month: "short", day: "numeric" }).format(date);
}

export function normalizeAgentsOverviewAnalyticsPayload(
  value: unknown,
  requestedPeriod: AgentsOverviewAnalyticsPeriod,
): AgentsOverviewAnalyticsSnapshot {
  const envelope = readRecord(value);
  const analytics = readRecord(envelope.analytics || envelope);
  const charts = readRecord(analytics.charts);
  const period = normalizePeriod(analytics.period || requestedPeriod);
  const sourceBuckets = Array.isArray(charts.usage)
    ? charts.usage
    : Array.isArray(analytics.buckets)
      ? analytics.buckets
      : [];
  const sourceResources = Array.isArray(analytics.resources) ? analytics.resources : [];

  return {
    period,
    generatedAt: String(analytics.generatedAt || analytics.generated_at || "").trim(),
    buckets: sourceBuckets.map((entry) => {
      const bucket = readRecord(entry);
      const bucketStart = String(bucket.bucketStart || bucket.bucket_start || "").trim();
      return {
        label: formatBucketLabel(bucketStart, period),
        agentRuns: nonNegativeNumber(bucket.agentRuns ?? bucket.agent_runs),
        squadRuns: nonNegativeNumber(bucket.squadRuns ?? bucket.squad_runs),
        agentCostUsd: nonNegativeNumber(bucket.agentCostUsd ?? bucket.agent_cost_usd),
        squadCostUsd: nonNegativeNumber(bucket.squadCostUsd ?? bucket.squad_cost_usd),
        tokens: nonNegativeNumber(bucket.tokens ?? bucket.totalTokens ?? bucket.total_tokens),
      };
    }),
    resources: sourceResources.flatMap((entry) => {
      const resource = readRecord(entry);
      const agentId = String(resource.agentId || resource.agent_id || resource.id || "").trim();
      if (!agentId) return [];
      return [{
        agentId,
        runCount: nonNegativeNumber(resource.runCount ?? resource.run_count),
        tokenCount: nonNegativeNumber(resource.tokenCount ?? resource.token_count ?? resource.tokens),
        costUsd: nonNegativeNumber(resource.costUsd ?? resource.cost_usd),
        lastUsedAt: String(resource.lastUsedAt || resource.last_used_at || "").trim() || null,
      }];
    }),
  };
}

function readSessionEntry(cacheKey: string): AgentsOverviewAnalyticsCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const storageKey = STORAGE_PREFIX + hashScope(cacheKey);
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "null") as Record<string, unknown> | null;
    const loadedAt = Number(stored?.loadedAt || 0);
    if (stored?.cacheKey !== cacheKey || !stored?.data || !Number.isFinite(loadedAt)) return null;
    if (Date.now() - loadedAt > MAX_STALE_AGE_MS) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }
    return {
      data: stored.data as AgentsOverviewAnalyticsSnapshot,
      loadedAt,
      promise: null,
    };
  } catch {
    return null;
  }
}

function writeSessionEntry(cacheKey: string, entry: AgentsOverviewAnalyticsCacheEntry): void {
  if (typeof window === "undefined" || !entry.data) return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + hashScope(cacheKey), JSON.stringify({
      cacheKey,
      data: entry.data,
      loadedAt: entry.loadedAt,
    }));
  } catch {
    // Memory caching still works when storage is unavailable or full.
  }
}

function getCacheEntry(cacheKey: string): AgentsOverviewAnalyticsCacheEntry | null {
  const memoryEntry = requestCache.get(cacheKey);
  if (memoryEntry) return memoryEntry;
  const sessionEntry = readSessionEntry(cacheKey);
  if (sessionEntry) requestCache.set(cacheKey, sessionEntry);
  return sessionEntry;
}

export function readCachedAgentsOverviewAnalytics(
  options: AgentsOverviewAnalyticsRequestOptions,
): CachedAgentsOverviewAnalytics | null {
  const entry = getCacheEntry(buildCacheKey(options));
  if (!entry?.data) return null;
  return {
    data: entry.data,
    loadedAt: entry.loadedAt,
    isFresh: Date.now() - entry.loadedAt < CACHE_TTL_MS,
  };
}

export async function fetchAgentsOverviewAnalytics(
  options: AgentsOverviewAnalyticsRequestOptions,
): Promise<AgentsOverviewAnalyticsSnapshot> {
  const period = normalizePeriod(options.period);
  const normalizedBackendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
  if (!normalizedBackendUrl) {
    throw new AgentsOverviewAnalyticsRequestError("Backend URL is required.", 0);
  }
  const cacheKey = buildCacheKey({ ...options, period });
  const cached = getCacheEntry(cacheKey);
  const cacheAge = cached ? Date.now() - cached.loadedAt : Infinity;
  if (!options.force && cached?.data && cacheAge >= 0 && cacheAge < CACHE_TTL_MS) {
    return cached.data;
  }
  if (!options.force && cached?.promise) {
    return cached.promise;
  }

  const request = (async () => {
    const response = await fetch(`${normalizedBackendUrl}/agents/analytics/overview?period=${encodeURIComponent(period)}`, {
      method: "GET",
      headers: options.headers,
      cache: "no-store",
      signal: options.signal,
    });
    const responseText = await response.text();
    let payload: unknown = {};
    try {
      payload = responseText ? JSON.parse(responseText) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) {
      const record = readRecord(payload);
      const upstreamMessage = String(record.message || record.error || "").trim();
      const safeMessage = upstreamMessage && !/<(?:!doctype|html|head|body|pre)\b/i.test(upstreamMessage)
        ? upstreamMessage
        : response.status === 404 || response.status === 501
          ? "Agent analytics endpoint is not available on this backend yet."
          : "Failed to load agent analytics.";
      throw new AgentsOverviewAnalyticsRequestError(
        safeMessage,
        response.status,
      );
    }
    const data = normalizeAgentsOverviewAnalyticsPayload(payload, period);
    const entry = { data, loadedAt: Date.now(), promise: null };
    requestCache.set(cacheKey, entry);
    writeSessionEntry(cacheKey, entry);
    return data;
  })();

  requestCache.set(cacheKey, {
    data: cached?.data || null,
    loadedAt: cached?.loadedAt || 0,
    promise: request,
  });
  try {
    return await request;
  } finally {
    const current = requestCache.get(cacheKey);
    if (current?.promise === request) {
      requestCache.set(cacheKey, { ...current, promise: null });
    }
  }
}

export function invalidateAgentsOverviewAnalytics(
  options: Pick<AgentsOverviewAnalyticsRequestOptions, "backendUrl" | "headers" | "identity">,
): void {
  const basePrefix = `${String(options.backendUrl || "").replace(/\/+$/, "")}|`;
  const organizationId = getHeaderValue(options.headers, ["x-computer-agents-organization", "x-organization-id", "x-organization", "organization-id"]);
  const authIdentity = String(options.identity || "").trim()
    || getHeaderValue(options.headers, ["x-api-key", "authorization"])
    || "session";
  const scopePrefix = `${basePrefix}${organizationId}|${hashScope(authIdentity)}|`;
  for (const [key, entry] of requestCache) {
    if (key.startsWith(scopePrefix)) {
      requestCache.set(key, { ...entry, loadedAt: 0 });
    }
  }
  if (typeof window !== "undefined") {
    for (const period of ["day", "week", "month"] as const) {
      try {
        window.sessionStorage.removeItem(STORAGE_PREFIX + hashScope(scopePrefix + period));
      } catch {
        break;
      }
    }
  }
}
