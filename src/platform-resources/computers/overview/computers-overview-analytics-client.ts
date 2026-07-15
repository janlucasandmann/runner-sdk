export type ComputersOverviewAnalyticsPeriod = "day" | "week" | "month";

export interface ComputerOverviewAnalyticsBucket {
  label: string;
  runCount: number;
  computerCostUsd: number;
}

export interface ComputersOverviewAnalyticsSnapshot {
  period: ComputersOverviewAnalyticsPeriod;
  generatedAt: string;
  totalRuns: number;
  totalComputerCostUsd: number;
  buckets: ComputerOverviewAnalyticsBucket[];
}

export interface CachedComputersOverviewAnalytics {
  data: ComputersOverviewAnalyticsSnapshot;
  loadedAt: number;
  isFresh: boolean;
}

export class ComputersOverviewAnalyticsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ComputersOverviewAnalyticsRequestError";
    this.status = status;
  }
}

export interface ComputersOverviewAnalyticsRequestOptions {
  backendUrl: string;
  headers?: HeadersInit;
  identity?: string;
  period: ComputersOverviewAnalyticsPeriod;
  force?: boolean;
  signal?: AbortSignal;
}

interface CacheEntry {
  data: ComputersOverviewAnalyticsSnapshot | null;
  loadedAt: number;
  promise: Promise<ComputersOverviewAnalyticsSnapshot> | null;
}

const CACHE_TTL_MS = 60_000;
const MAX_STALE_AGE_MS = 15 * 60_000;
const STORAGE_PREFIX = "runner-playground:computers-overview-analytics:";
const requestCache = new Map<string, CacheEntry>();

function normalizePeriod(value: unknown): ComputersOverviewAnalyticsPeriod {
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

function buildCacheKey(options: ComputersOverviewAnalyticsRequestOptions): string {
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

function formatBucketLabel(bucketStart: string, period: ComputersOverviewAnalyticsPeriod): string {
  const date = new Date(bucketStart);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", period === "day"
    ? { hour: "numeric" }
    : period === "week"
      ? { weekday: "short" }
      : { month: "short", day: "numeric" }).format(date);
}

export function normalizeComputersOverviewAnalyticsPayload(
  value: unknown,
  requestedPeriod: ComputersOverviewAnalyticsPeriod,
): ComputersOverviewAnalyticsSnapshot {
  const envelope = readRecord(value);
  const analytics = readRecord(envelope.analytics || envelope);
  const charts = readRecord(analytics.charts);
  const summary = readRecord(analytics.summary);
  const period = normalizePeriod(analytics.period || requestedPeriod);
  const sourceBuckets = Array.isArray(charts.usage)
    ? charts.usage
    : Array.isArray(analytics.buckets)
      ? analytics.buckets
      : [];
  const buckets = sourceBuckets.map((entry) => {
    const bucket = readRecord(entry);
    const bucketStart = String(bucket.bucketStart || bucket.bucket_start || "").trim();
    return {
      label: formatBucketLabel(bucketStart, period),
      runCount: nonNegativeNumber(bucket.runCount ?? bucket.run_count),
      computerCostUsd: nonNegativeNumber(bucket.computerCostUsd ?? bucket.computer_cost_usd ?? bucket.costUsd ?? bucket.cost_usd),
    };
  });
  return {
    period,
    generatedAt: String(analytics.generatedAt || analytics.generated_at || "").trim(),
    totalRuns: nonNegativeNumber(summary.totalRuns ?? summary.total_runs)
      || buckets.reduce((sum, bucket) => sum + bucket.runCount, 0),
    totalComputerCostUsd: nonNegativeNumber(summary.totalComputerCostUsd ?? summary.total_computer_cost_usd)
      || buckets.reduce((sum, bucket) => sum + bucket.computerCostUsd, 0),
    buckets,
  };
}

function readSessionEntry(cacheKey: string): CacheEntry | null {
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
      data: stored.data as ComputersOverviewAnalyticsSnapshot,
      loadedAt,
      promise: null,
    };
  } catch {
    return null;
  }
}

function writeSessionEntry(cacheKey: string, entry: CacheEntry): void {
  if (typeof window === "undefined" || !entry.data) return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + hashScope(cacheKey), JSON.stringify({
      cacheKey,
      data: entry.data,
      loadedAt: entry.loadedAt,
    }));
  } catch {
    // Memory caching remains available when session storage is unavailable.
  }
}

function getCacheEntry(cacheKey: string): CacheEntry | null {
  const memoryEntry = requestCache.get(cacheKey);
  if (memoryEntry) return memoryEntry;
  const sessionEntry = readSessionEntry(cacheKey);
  if (sessionEntry) requestCache.set(cacheKey, sessionEntry);
  return sessionEntry;
}

export function readCachedComputersOverviewAnalytics(
  options: ComputersOverviewAnalyticsRequestOptions,
): CachedComputersOverviewAnalytics | null {
  const entry = getCacheEntry(buildCacheKey(options));
  if (!entry?.data) return null;
  return {
    data: entry.data,
    loadedAt: entry.loadedAt,
    isFresh: Date.now() - entry.loadedAt < CACHE_TTL_MS,
  };
}

export async function fetchComputersOverviewAnalytics(
  options: ComputersOverviewAnalyticsRequestOptions,
): Promise<ComputersOverviewAnalyticsSnapshot> {
  const period = normalizePeriod(options.period);
  const normalizedBackendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
  if (!normalizedBackendUrl) {
    throw new ComputersOverviewAnalyticsRequestError("Backend URL is required.", 0);
  }
  const cacheKey = buildCacheKey({ ...options, period });
  const cached = getCacheEntry(cacheKey);
  const cacheAge = cached ? Date.now() - cached.loadedAt : Infinity;
  if (!options.force && cached?.data && cacheAge >= 0 && cacheAge < CACHE_TTL_MS) return cached.data;
  if (!options.force && cached?.promise) return cached.promise;

  const request = (async () => {
    const response = await fetch(`${normalizedBackendUrl}/environments/analytics/overview?period=${encodeURIComponent(period)}`, {
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
          ? "Computer analytics endpoint is not available on this backend yet."
          : "Failed to load computer analytics.";
      throw new ComputersOverviewAnalyticsRequestError(safeMessage, response.status);
    }
    const data = normalizeComputersOverviewAnalyticsPayload(payload, period);
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
    if (current?.promise === request) requestCache.set(cacheKey, { ...current, promise: null });
  }
}

export function invalidateComputersOverviewAnalytics(
  options: Pick<ComputersOverviewAnalyticsRequestOptions, "backendUrl" | "headers" | "identity">,
): void {
  const basePrefix = `${String(options.backendUrl || "").replace(/\/+$/, "")}|`;
  const organizationId = getHeaderValue(options.headers, ["x-computer-agents-organization", "x-organization-id", "x-organization", "organization-id"]);
  const authIdentity = String(options.identity || "").trim()
    || getHeaderValue(options.headers, ["x-api-key", "authorization"])
    || "session";
  const scopePrefix = `${basePrefix}${organizationId}|${hashScope(authIdentity)}|`;
  for (const [key, entry] of requestCache) {
    if (key.startsWith(scopePrefix)) requestCache.set(key, { ...entry, loadedAt: 0 });
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
