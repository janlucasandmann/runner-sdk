export interface InferenceEndpointIdentity {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type InferenceEndpointIdentityInput = Partial<InferenceEndpointIdentity> & {
  displayName?: string;
  photoUrl?: string;
};

type UnknownRecord = Record<string, unknown>;

const NESTED_IDENTITY_KEYS = [
  "user",
  "profile",
  "account",
  "member",
  "identity",
  "metadata",
] as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function collectSources(
  value: unknown,
  depth = 0,
  seen = new Set<unknown>(),
): UnknownRecord[] {
  const source = asRecord(value);
  if (!Object.keys(source).length || seen.has(source) || depth > 3) return [];
  seen.add(source);
  return [
    source,
    ...NESTED_IDENTITY_KEYS.flatMap((key) => (
      collectSources(source[key], depth + 1, seen)
    )),
  ];
}

function firstString(sources: readonly UnknownRecord[], keys: readonly string[]): string {
  for (const source of sources) {
    for (const key of keys) {
      const value = asString(source[key]);
      if (value) return value;
    }
  }
  return "";
}

function isPlaceholderName(value: string): boolean {
  return ["", "unknown", "unknown user", "you", "me", "current user"]
    .includes(value.trim().toLowerCase());
}

export function normalizeInferenceEndpointIdentity(
  value: unknown,
  fallback: InferenceEndpointIdentityInput = {},
): InferenceEndpointIdentity {
  const sources = collectSources(value);
  const fallbackSources = collectSources(fallback);
  const explicitUserId = firstString(sources, ["userId", "user_id", "uid", "accountId", "account_id"]);
  const explicitEmail = firstString(sources, ["email", "emailAddress", "email_address", "mail"])
    .toLowerCase();
  const explicitId = firstString(sources, ["id", "memberId", "member_id"]);
  const explicitKeys = [explicitId, explicitUserId, explicitEmail]
    .map((value) => value.toLowerCase())
    .filter(Boolean);
  const fallbackKeys = [
    firstString(fallbackSources, ["id"]),
    firstString(fallbackSources, ["userId", "user_id", "uid"]),
    firstString(fallbackSources, ["email", "emailAddress", "email_address"]),
  ].map((value) => value.toLowerCase()).filter(Boolean);
  const canUseFallback = explicitKeys.length === 0
    || explicitKeys.some((key) => fallbackKeys.includes(key));
  const usableFallbackSources = canUseFallback ? fallbackSources : [];
  const userId = explicitUserId
    || firstString(usableFallbackSources, ["userId", "user_id", "uid"]);
  const email = (explicitEmail
    || firstString(usableFallbackSources, ["email", "emailAddress", "email_address"]))
    .toLowerCase();
  const id = explicitId
    || userId
    || email
    || firstString(usableFallbackSources, ["id"]);
  const candidateName = firstString(sources, [
    "name",
    "displayName",
    "display_name",
    "fullName",
    "full_name",
    "username",
  ]);
  const fallbackName = firstString(usableFallbackSources, [
    "name",
    "displayName",
    "display_name",
    "fullName",
    "full_name",
  ]);
  const name = (!isPlaceholderName(candidateName) ? candidateName : "")
    || (!isPlaceholderName(fallbackName) ? fallbackName : "")
    || email
    || userId
    || id
    || "Unknown";
  const avatarUrl = firstString(sources, [
    "avatarUrl",
    "avatar_url",
    "photoUrl",
    "photoURL",
    "photo_url",
    "picture",
    "imageUrl",
    "image_url",
  ]) || firstString(usableFallbackSources, [
    "avatarUrl",
    "avatar_url",
    "photoUrl",
    "photoURL",
    "photo_url",
    "picture",
  ]);

  return { id, userId, name, email, avatarUrl };
}

function roleIdentity(
  endpoint: unknown,
  role: "creator" | "owner",
  fallback: InferenceEndpointIdentityInput,
): InferenceEndpointIdentity {
  const source = asRecord(endpoint);
  const nested = asRecord(source[role]);
  const prefix = role === "creator" ? "creator" : "owner";
  return normalizeInferenceEndpointIdentity({
    id: source[`${prefix}Id`] || source[`${prefix}_id`],
    userId: source[`${prefix}UserId`] || source[`${prefix}_user_id`],
    name: source[`${prefix}Name`] || source[`${prefix}_name`],
    email: source[`${prefix}Email`] || source[`${prefix}_email`],
    avatarUrl: source[`${prefix}AvatarUrl`] || source[`${prefix}_avatar_url`],
    ...nested,
  }, fallback);
}

export function getInferenceEndpointCreatorIdentity(
  endpoint: unknown,
  fallback: InferenceEndpointIdentityInput = {},
): InferenceEndpointIdentity {
  return roleIdentity(endpoint, "creator", fallback);
}

export function getInferenceEndpointOwnerIdentity(
  endpoint: unknown,
  fallback: InferenceEndpointIdentityInput = {},
): InferenceEndpointIdentity {
  return roleIdentity(endpoint, "owner", fallback);
}

export function getInferenceEndpointIdentityKeys(
  identity: InferenceEndpointIdentityInput,
): string[] {
  return [...new Set([identity.id, identity.userId, identity.email]
    .map((value) => asString(value).toLowerCase())
    .filter(Boolean))];
}

export function getInferenceEndpointOwnerKey(
  identity: InferenceEndpointIdentityInput,
): string {
  return getInferenceEndpointIdentityKeys(identity)[0]
    || asString(identity.name || identity.displayName).toLowerCase();
}

export function mergeInferenceEndpointOwnerCandidates(
  candidates: readonly unknown[],
): InferenceEndpointIdentity[] {
  const merged: InferenceEndpointIdentity[] = [];
  candidates.forEach((candidate) => {
    const normalized = normalizeInferenceEndpointIdentity(candidate);
    const candidateKeys = new Set(getInferenceEndpointIdentityKeys(normalized));
    const existingIndex = merged.findIndex((existing) => (
      getInferenceEndpointIdentityKeys(existing).some((key) => candidateKeys.has(key))
    ));
    if (existingIndex < 0) {
      if (getInferenceEndpointOwnerKey(normalized)) merged.push(normalized);
      return;
    }
    const existing = merged[existingIndex];
    merged[existingIndex] = {
      id: existing.id || normalized.id,
      userId: existing.userId || normalized.userId,
      name: !isPlaceholderName(existing.name) ? existing.name : normalized.name,
      email: existing.email || normalized.email,
      avatarUrl: existing.avatarUrl || normalized.avatarUrl,
    };
  });
  return merged.sort((left, right) => (
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  ));
}
