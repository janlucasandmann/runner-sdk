export interface PlatformAgentListCacheScope {
  backendUrl: string;
  headers?: HeadersInit;
  identity?: string;
}

export interface CachedPlatformAgentList {
  agents: Record<string, unknown>[];
  loadedAt: number;
  isFresh: boolean;
}

interface PlatformAgentListCacheEntry {
  agents: Record<string, unknown>[];
  loadedAt: number;
}

const CACHE_TTL_MS = 30_000;
const MAX_STALE_AGE_MS = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "runner-playground:agent-list:";
const requestCache = new Map<string, PlatformAgentListCacheEntry>();

function asRecord(value: unknown): Record<string, unknown> {
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

function getResponseItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const root = asRecord(value);
  const envelopes = [
    root,
    asRecord(root.data),
    asRecord(root.result),
    asRecord(root.payload),
  ];
  for (const envelope of envelopes) {
    for (const key of ["data", "agents", "resources", "items"]) {
      if (Array.isArray(envelope[key])) return envelope[key];
    }
  }
  return [];
}

function readStoredEntry(scopeKey: string): PlatformAgentListCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const storageKey = STORAGE_PREFIX + hashScope(scopeKey);
    const stored = asRecord(JSON.parse(window.sessionStorage.getItem(storageKey) || "null"));
    if (
      stored.scopeKey !== scopeKey
      || !Array.isArray(stored.agents)
      || !Number.isFinite(Number(stored.loadedAt))
    ) {
      return null;
    }
    return {
      agents: normalizePlatformAgentListRecords(stored.agents),
      loadedAt: Number(stored.loadedAt),
    };
  } catch {
    return null;
  }
}

function removeStoredEntry(scopeKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_PREFIX + hashScope(scopeKey));
  } catch {
    // Memory caching remains available when storage is unavailable.
  }
}

export function normalizePlatformAgentListRecords(value: unknown): Record<string, unknown>[] {
  return getResponseItems(value).flatMap((item) => {
    const agent = asRecord(item);
    const id = String(
      agent.id
      || agent.agentId
      || agent.agent_id
      || agent.teamId
      || agent.team_id
      || ""
    ).trim();
    return id ? [{ ...agent, id }] : [];
  });
}

export function buildPlatformAgentListScopeKey(options: PlatformAgentListCacheScope): string {
  const backendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
  const organizationId = getHeaderValue(options.headers, [
    "x-computer-agents-organization",
    "x-organization-id",
    "x-organization",
    "organization-id",
  ]);
  const authenticationIdentity = String(options.identity || "").trim()
    || getHeaderValue(options.headers, ["x-api-key", "authorization"])
    || "session";
  return `${backendUrl}|${organizationId}|${hashScope(authenticationIdentity)}`;
}

export function readCachedPlatformAgentList(scopeKey: string): CachedPlatformAgentList | null {
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (!normalizedScopeKey) return null;
  let entry = requestCache.get(normalizedScopeKey) || null;
  if (!entry) {
    entry = readStoredEntry(normalizedScopeKey);
    if (entry) requestCache.set(normalizedScopeKey, entry);
  }
  if (!entry || Date.now() - entry.loadedAt > MAX_STALE_AGE_MS) {
    requestCache.delete(normalizedScopeKey);
    removeStoredEntry(normalizedScopeKey);
    return null;
  }
  return {
    agents: entry.agents,
    loadedAt: entry.loadedAt,
    isFresh: Date.now() - entry.loadedAt < CACHE_TTL_MS,
  };
}

export function writeCachedPlatformAgentList(scopeKey: string, value: unknown): void {
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (!normalizedScopeKey) return;
  const entry = {
    agents: normalizePlatformAgentListRecords(value),
    loadedAt: Date.now(),
  };
  requestCache.set(normalizedScopeKey, entry);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_PREFIX + hashScope(normalizedScopeKey),
      JSON.stringify({
        scopeKey: normalizedScopeKey,
        ...entry,
      }),
    );
  } catch {
    // Memory caching remains available when storage is unavailable or full.
  }
}

export function clearCachedPlatformAgentList(scopeKey?: string): void {
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (normalizedScopeKey) {
    requestCache.delete(normalizedScopeKey);
    removeStoredEntry(normalizedScopeKey);
    return;
  }
  requestCache.clear();
  if (typeof window === "undefined") return;
  try {
    const storageKeys = Array.from(
      { length: window.sessionStorage.length },
      (_, index) => window.sessionStorage.key(index),
    ).filter((key): key is string => Boolean(key?.startsWith(STORAGE_PREFIX)));
    storageKeys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Memory cache clearing is still complete when storage is unavailable.
  }
}
