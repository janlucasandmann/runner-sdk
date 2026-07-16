export type ApiKeysOverviewAnalyticsPeriod = "day" | "week" | "month";

export interface ApiKeysOverviewAnalyticsBucket {
  label: string;
  requestCount: number;
  tokenCount: number;
}

export interface ApiKeysOverviewAnalyticsSnapshot {
  period: ApiKeysOverviewAnalyticsPeriod;
  generatedAt: string;
  summary: {
    requestCount: number;
    tokenCount: number;
    totalKeyCount: number;
    usedKeyCount: number;
  };
  buckets: ApiKeysOverviewAnalyticsBucket[];
}

export interface CachedApiKeysOverviewAnalytics {
  data: ApiKeysOverviewAnalyticsSnapshot;
  loadedAt: number;
  isFresh: boolean;
}

export class ApiKeysOverviewAnalyticsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiKeysOverviewAnalyticsRequestError";
    this.status = status;
  }
}

export interface ApiKeysOverviewAnalyticsRequestOptions {
  backendUrl: string;
  headers?: HeadersInit;
  identity?: string;
  period: ApiKeysOverviewAnalyticsPeriod;
  force?: boolean;
  signal?: AbortSignal;
}

interface ApiKeysOverviewAnalyticsCacheEntry {
  data: ApiKeysOverviewAnalyticsSnapshot | null;
  loadedAt: number;
  promise: Promise<ApiKeysOverviewAnalyticsSnapshot> | null;
}

const CACHE_TTL_MS = 60_000;
const MAX_STALE_AGE_MS = 15 * 60_000;
const STORAGE_PREFIX = "runner-playground:api-keys-overview-analytics:";
const requestCache = new Map<string, ApiKeysOverviewAnalyticsCacheEntry>();

function normalizePeriod(value: unknown): ApiKeysOverviewAnalyticsPeriod {
  return value === "day" || value === "week" ? value : "month";
}

function nonNegativeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getHeaderValue(headers: HeadersInit | undefined, names: readonly string[]): string {
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

function buildCacheKey(options: ApiKeysOverviewAnalyticsRequestOptions): string {
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

function formatBucketLabel(bucketStart: string, period: ApiKeysOverviewAnalyticsPeriod): string {
  const date = new Date(bucketStart);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", period === "day"
    ? { hour: "numeric" }
    : period === "week"
      ? { weekday: "short" }
      : { month: "short", day: "numeric" }).format(date);
}

export function normalizeApiKeysOverviewAnalyticsPayload(
  value: unknown,
  requestedPeriod: ApiKeysOverviewAnalyticsPeriod,
): ApiKeysOverviewAnalyticsSnapshot {
  const envelope = readRecord(value);
  const analytics = readRecord(envelope.analytics || envelope);
  const summary = readRecord(analytics.summary);
  const charts = readRecord(analytics.charts);
  const period = normalizePeriod(analytics.period || requestedPeriod);
  const sourceBuckets = Array.isArray(charts.usage)
    ? charts.usage
    : Array.isArray(analytics.buckets)
      ? analytics.buckets
      : [];

  return {
    period,
    generatedAt: String(analytics.generatedAt || analytics.generated_at || "").trim(),
    summary: {
      requestCount: nonNegativeNumber(summary.requestCount ?? summary.request_count),
      tokenCount: nonNegativeNumber(summary.tokenCount ?? summary.token_count),
      totalKeyCount: nonNegativeNumber(summary.totalKeyCount ?? summary.total_key_count),
      usedKeyCount: nonNegativeNumber(summary.usedKeyCount ?? summary.used_key_count),
    },
    buckets: sourceBuckets.map((entry) => {
      const bucket = readRecord(entry);
      const bucketStart = String(bucket.bucketStart || bucket.bucket_start || "").trim();
      return {
        label: formatBucketLabel(bucketStart, period),
        requestCount: nonNegativeNumber(bucket.requestCount ?? bucket.request_count),
        tokenCount: nonNegativeNumber(bucket.tokenCount ?? bucket.token_count),
      };
    }),
  };
}

function readSessionEntry(cacheKey: string): ApiKeysOverviewAnalyticsCacheEntry | null {
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
      data: stored.data as ApiKeysOverviewAnalyticsSnapshot,
      loadedAt,
      promise: null,
    };
  } catch {
    return null;
  }
}

function writeSessionEntry(cacheKey: string, entry: ApiKeysOverviewAnalyticsCacheEntry): void {
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

function getCacheEntry(cacheKey: string): ApiKeysOverviewAnalyticsCacheEntry | null {
  const memoryEntry = requestCache.get(cacheKey);
  if (memoryEntry) return memoryEntry;
  const sessionEntry = readSessionEntry(cacheKey);
  if (sessionEntry) requestCache.set(cacheKey, sessionEntry);
  return sessionEntry;
}

export function readCachedApiKeysOverviewAnalytics(
  options: ApiKeysOverviewAnalyticsRequestOptions,
): CachedApiKeysOverviewAnalytics | null {
  const entry = getCacheEntry(buildCacheKey(options));
  if (!entry?.data) return null;
  return {
    data: entry.data,
    loadedAt: entry.loadedAt,
    isFresh: Date.now() - entry.loadedAt < CACHE_TTL_MS,
  };
}

export async function fetchApiKeysOverviewAnalytics(
  options: ApiKeysOverviewAnalyticsRequestOptions,
): Promise<ApiKeysOverviewAnalyticsSnapshot> {
  const period = normalizePeriod(options.period);
  const normalizedBackendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
  if (!normalizedBackendUrl) {
    throw new ApiKeysOverviewAnalyticsRequestError("Backend URL is required.", 0);
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
    const response = await fetch(
      `${normalizedBackendUrl}/api-keys/analytics/overview?period=${encodeURIComponent(period)}`,
      {
        method: "GET",
        headers: options.headers,
        cache: "no-store",
        signal: options.signal,
      },
    );
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
          ? "API key analytics endpoint is not available on this backend yet."
          : "Failed to load API key analytics.";
      throw new ApiKeysOverviewAnalyticsRequestError(safeMessage, response.status);
    }

    const data = normalizeApiKeysOverviewAnalyticsPayload(payload, period);
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

export function invalidateApiKeysOverviewAnalytics(
  options: Pick<ApiKeysOverviewAnalyticsRequestOptions, "backendUrl" | "headers" | "identity">,
): void {
  const basePrefix = `${String(options.backendUrl || "").replace(/\/+$/, "")}|`;
  const organizationId = getHeaderValue(options.headers, [
    "x-computer-agents-organization",
    "x-organization-id",
    "x-organization",
    "organization-id",
  ]);
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
