import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlatformOwnerIdentity } from "./platform-owner-selector.js";

export interface PlatformOrganizationOwnerCandidate extends PlatformOwnerIdentity<string> {
  id: string;
  userId: string;
  source: unknown;
}

export type PlatformOrganizationMemberDirectoryStatus = "idle" | "loading" | "ready" | "error";

export interface PlatformOrganizationMemberDirectoryValue {
  organizationId: string;
  candidates: readonly PlatformOrganizationOwnerCandidate[];
  status: PlatformOrganizationMemberDirectoryStatus;
  error: string;
  ensureLoaded: (options?: { force?: boolean }) => Promise<readonly PlatformOrganizationOwnerCandidate[]>;
}

export interface PlatformOrganizationMemberDirectoryProviderProps {
  organizationId?: string;
  apiBaseUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
  children: ReactNode;
}

interface DirectoryCacheEntry {
  candidates: readonly PlatformOrganizationOwnerCandidate[];
  loadedAt: number;
}

const DIRECTORY_CACHE_TTL_MS = 30_000;
const directoryCache = new Map<string, DirectoryCacheEntry>();
const directoryRequests = new Map<string, Promise<readonly PlatformOrganizationOwnerCandidate[]>>();

const emptyDirectory: PlatformOrganizationMemberDirectoryValue = {
  organizationId: "",
  candidates: [],
  status: "idle",
  error: "",
  ensureLoaded: async () => [],
};

const PlatformOrganizationMemberDirectoryContext = createContext<PlatformOrganizationMemberDirectoryValue>(
  emptyDirectory,
);

function normalizeBaseUrl(value: string | undefined): string {
  return String(value || "/api/real").trim().replace(/\/$/, "") || "/api/real";
}

function getDirectoryCacheKey(apiBaseUrl: string, organizationId: string): string {
  return `${apiBaseUrl}::${organizationId}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getIdentitySources(value: unknown): Record<string, unknown>[] {
  const source = asRecord(value);
  return [
    source,
    asRecord(source.user),
    asRecord(source.profile),
    asRecord(source.account),
    asRecord(source.identity),
    asRecord(source.member),
  ];
}

function readIdentityString(value: unknown, keys: readonly string[]): string {
  for (const source of getIdentitySources(value)) {
    for (const key of keys) {
      const candidate = String(source[key] || "").replace(/\s+/g, " ").trim();
      if (candidate) return candidate;
    }
  }
  return "";
}

function getIdentityKeys(value: unknown): string[] {
  const keys = [
    readIdentityString(value, ["userId", "user_id", "uid", "localId", "local_id"]),
    readIdentityString(value, ["id", "memberId", "member_id"]),
    readIdentityString(value, ["email", "emailAddress", "email_address", "mail"]),
  ];
  return Array.from(new Set(keys.map((entry) => entry.trim().toLowerCase()).filter(Boolean)));
}

function collectMemberRecords(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const source = asRecord(payload);
  const data = source.data;
  if (Array.isArray(data)) return data;
  const nestedData = asRecord(data);
  for (const candidate of [
    nestedData.members,
    nestedData.organizationMembers,
    nestedData.organization_members,
    source.members,
    source.organizationMembers,
    source.organization_members,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function collectProfileRecords(payload: unknown): unknown[] {
  const records: unknown[] = [];
  const visited = new Set<unknown>();
  const visit = (value: unknown, depth: number) => {
    if (value == null || depth > 3 || visited.has(value)) return;
    if (Array.isArray(value)) {
      visited.add(value);
      value.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    const source = asRecord(value);
    if (!Object.keys(source).length) return;
    visited.add(value);
    if (
      getIdentityKeys(source).length > 0
      && Boolean(
        readIdentityString(source, ["displayName", "display_name", "name", "fullName", "full_name"])
        || readIdentityString(source, ["avatarUrl", "avatar_url", "photoUrl", "photoURL", "picture", "imageUrl"])
        || readIdentityString(source, ["email", "emailAddress", "email_address", "mail"])
      )
    ) records.push(source);
    [
      "data",
      "profile",
      "profiles",
      "memberProfiles",
      "member_profiles",
      "users",
      "accounts",
      "items",
      "results",
      "included",
    ].forEach((key) => visit(source[key], depth + 1));
  };
  visit(payload, 0);
  return records;
}

function isActiveOrganizationMember(value: unknown): boolean {
  const status = readIdentityString(value, ["status", "membershipStatus", "membership_status"])
    .toLowerCase();
  return !["disabled", "inactive", "invited", "pending", "removed", "suspended"].includes(status);
}

function normalizeOrganizationOwnerCandidate(
  member: unknown,
  profile: unknown,
): PlatformOrganizationOwnerCandidate | null {
  const merged = {
    ...asRecord(member),
    ...(Object.keys(asRecord(profile)).length ? { profile: asRecord(profile) } : {}),
  };
  const userId = readIdentityString(merged, ["userId", "user_id", "uid", "localId", "local_id"]);
  const id = userId || readIdentityString(merged, ["id", "memberId", "member_id"]);
  const email = readIdentityString(merged, ["email", "emailAddress", "email_address", "mail"])
    .toLowerCase();
  const value = userId || id || email;
  if (!value) return null;
  const explicitName = readIdentityString(merged, [
    "displayName",
    "display_name",
    "name",
    "fullName",
    "full_name",
  ]);
  const trustedName = explicitName
    && !explicitName.includes("@")
    && (!email || explicitName.toLowerCase() !== email)
    ? explicitName
    : "";
  const emailPrefix = email.includes("@") ? email.split("@")[0] : "";
  const derivedName = emailPrefix
    .split(/[^a-zA-Z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const name = trustedName || derivedName || "Unknown user";
  const avatarUrl = readIdentityString(merged, [
    "avatarUrl",
    "avatar_url",
    "avatarURL",
    "photoUrl",
    "photoURL",
    "photo_url",
    "picture",
    "imageUrl",
    "imageURL",
    "profileImageUrl",
    "profile_image_url",
  ]);
  return {
    value,
    id: id || value,
    userId: userId || id || value,
    name,
    email,
    avatarUrl,
    source: member,
  };
}

function mergeDirectoryCandidates(
  candidates: readonly PlatformOrganizationOwnerCandidate[],
): PlatformOrganizationOwnerCandidate[] {
  const result: PlatformOrganizationOwnerCandidate[] = [];
  const indexByKey = new Map<string, number>();
  candidates.forEach((candidate) => {
    const keys = Array.from(new Set([
      candidate.value,
      candidate.id,
      candidate.userId,
      candidate.email,
    ].map((entry) => String(entry || "").trim().toLowerCase()).filter(Boolean)));
    const existingIndex = keys.map((key) => indexByKey.get(key)).find((index) => index !== undefined);
    if (existingIndex === undefined) {
      const nextIndex = result.length;
      result.push(candidate);
      keys.forEach((key) => indexByKey.set(key, nextIndex));
      return;
    }
    const existing = result[existingIndex];
    result[existingIndex] = {
      ...existing,
      ...candidate,
      name: candidate.name || existing.name,
      email: candidate.email || existing.email,
      avatarUrl: candidate.avatarUrl || existing.avatarUrl,
    };
    keys.forEach((key) => indexByKey.set(key, existingIndex));
  });
  return result;
}

export async function loadPlatformOrganizationOwnerDirectory(options: {
  organizationId: string;
  apiBaseUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
  force?: boolean;
  fetcher?: typeof fetch;
}): Promise<readonly PlatformOrganizationOwnerCandidate[]> {
  const organizationId = String(options.organizationId || "").trim();
  if (!organizationId) return [];
  const apiBaseUrl = normalizeBaseUrl(options.apiBaseUrl);
  const cacheKey = getDirectoryCacheKey(apiBaseUrl, organizationId);
  const cached = directoryCache.get(cacheKey);
  if (!options.force && cached && Date.now() - cached.loadedAt < DIRECTORY_CACHE_TTL_MS) {
    return cached.candidates;
  }
  const pending = directoryRequests.get(cacheKey);
  if (!options.force && pending) return pending;
  const fetcher = options.fetcher || fetch;
  const request = (async () => {
    const headers = {
      Accept: "application/json",
      ...options.requestHeaders,
      "x-computer-agents-organization": organizationId,
    };
    const memberResponse = await fetcher(
      `${apiBaseUrl}/organizations/${encodeURIComponent(organizationId)}/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers,
      },
    );
    const memberPayload = await memberResponse.json().catch(() => ({}));
    if (!memberResponse.ok) {
      throw new Error(String(
        asRecord(memberPayload).message
        || asRecord(memberPayload).error
        || "Failed to load organization members.",
      ));
    }
    const members = collectMemberRecords(memberPayload).filter(isActiveOrganizationMember);
    let profilePayload: unknown = null;
    if (members.length) {
      try {
        const profileResponse = await fetcher(
          `${apiBaseUrl}/organizations/${encodeURIComponent(organizationId)}/member-profiles/lookup`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId, members }),
          },
        );
        if (profileResponse.ok) profilePayload = await profileResponse.json().catch(() => null);
      } catch {
        profilePayload = null;
      }
    }
    const profilesByKey = new Map<string, unknown>();
    collectProfileRecords(memberPayload).concat(collectProfileRecords(profilePayload)).forEach((profile) => {
      getIdentityKeys(profile).forEach((key) => profilesByKey.set(key, profile));
    });
    const candidates = mergeDirectoryCandidates(members
      .map((member) => {
        const profile = getIdentityKeys(member).map((key) => profilesByKey.get(key)).find(Boolean);
        return normalizeOrganizationOwnerCandidate(member, profile);
      })
      .filter((candidate): candidate is PlatformOrganizationOwnerCandidate => Boolean(candidate)));
    directoryCache.set(cacheKey, { candidates, loadedAt: Date.now() });
    return candidates;
  })();
  directoryRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    if (directoryRequests.get(cacheKey) === request) directoryRequests.delete(cacheKey);
  }
}

export function PlatformOrganizationMemberDirectoryProvider({
  organizationId: organizationIdProp = "",
  apiBaseUrl: apiBaseUrlProp = "/api/real",
  requestHeaders = {},
  children,
}: PlatformOrganizationMemberDirectoryProviderProps) {
  const organizationId = String(organizationIdProp || "").trim();
  const apiBaseUrl = normalizeBaseUrl(apiBaseUrlProp);
  const cacheKey = organizationId ? getDirectoryCacheKey(apiBaseUrl, organizationId) : "";
  const cached = cacheKey ? directoryCache.get(cacheKey) : undefined;
  const [candidates, setCandidates] = useState<readonly PlatformOrganizationOwnerCandidate[]>(cached?.candidates || []);
  const [status, setStatus] = useState<PlatformOrganizationMemberDirectoryStatus>(cached ? "ready" : "idle");
  const [error, setError] = useState("");
  const headersRef = useRef(requestHeaders);
  const requestGenerationRef = useRef(0);
  headersRef.current = requestHeaders;

  useEffect(() => {
    requestGenerationRef.current += 1;
    const nextCached = cacheKey ? directoryCache.get(cacheKey) : undefined;
    setCandidates(nextCached?.candidates || []);
    setStatus(nextCached ? "ready" : "idle");
    setError("");
  }, [cacheKey]);

  const ensureLoaded = useCallback(async (options: { force?: boolean } = {}) => {
    if (!organizationId) return [];
    const generation = requestGenerationRef.current;
    setStatus("loading");
    setError("");
    try {
      const nextCandidates = await loadPlatformOrganizationOwnerDirectory({
        organizationId,
        apiBaseUrl,
        requestHeaders: headersRef.current,
        force: options.force,
      });
      if (requestGenerationRef.current === generation) {
        setCandidates(nextCandidates);
        setStatus("ready");
      }
      return nextCandidates;
    } catch (nextError) {
      if (requestGenerationRef.current === generation) {
        setStatus("error");
        setError(nextError instanceof Error ? nextError.message : "Failed to load organization members.");
      }
      return [];
    }
  }, [apiBaseUrl, organizationId]);

  const value = useMemo<PlatformOrganizationMemberDirectoryValue>(() => ({
    organizationId,
    candidates,
    status,
    error,
    ensureLoaded,
  }), [candidates, ensureLoaded, error, organizationId, status]);

  return (
    <PlatformOrganizationMemberDirectoryContext.Provider value={value}>
      {children}
    </PlatformOrganizationMemberDirectoryContext.Provider>
  );
}

export function usePlatformOrganizationMemberDirectory(): PlatformOrganizationMemberDirectoryValue {
  return useContext(PlatformOrganizationMemberDirectoryContext);
}
