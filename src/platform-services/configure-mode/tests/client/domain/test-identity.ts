type UnknownRecord = Record<string, unknown>;

export interface TestPersonIdentity {
  type: "user";
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type TestPersonIdentityInput = Partial<TestPersonIdentity> & {
  displayName?: string;
  photoUrl?: string;
};

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

function collectIdentitySources(
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
      collectIdentitySources(source[key], depth + 1, seen)
    )),
  ];
}

function firstSourceString(
  sources: readonly UnknownRecord[],
  keys: readonly string[],
): string {
  for (const source of sources) {
    for (const key of keys) {
      const value = asString(source[key]);
      if (value) return value;
    }
  }
  return "";
}

function firstRoleRecord(
  source: UnknownRecord,
  metadata: UnknownRecord,
  keys: readonly string[],
): UnknownRecord {
  for (const key of keys) {
    const direct = asRecord(source[key]);
    if (Object.keys(direct).length) return direct;
    const nested = asRecord(metadata[key]);
    if (Object.keys(nested).length) return nested;
  }
  return {};
}

function identitiesOverlap(
  left: TestPersonIdentityInput,
  rightKeys: readonly string[],
): boolean {
  const leftKeys = [left.id, left.userId, left.email]
    .map((value) => asString(value).toLowerCase())
    .filter(Boolean);
  return !rightKeys.length || leftKeys.some((key) => rightKeys.includes(key));
}

export function normalizeTestPersonIdentity(
  value: unknown,
  fallback: TestPersonIdentityInput = {},
): TestPersonIdentity {
  const sources = collectIdentitySources(value);
  const fallbackSources = collectIdentitySources(fallback);
  const explicitUserId = firstSourceString(sources, [
    "userId",
    "user_id",
    "uid",
    "accountId",
    "account_id",
  ]);
  const explicitEmail = firstSourceString(sources, [
    "email",
    "emailAddress",
    "email_address",
    "mail",
    "primaryEmail",
    "primary_email",
  ]).toLowerCase();
  const explicitId = firstSourceString(sources, [
    "id",
    "memberId",
    "member_id",
  ]);
  const explicitKeys = [explicitId, explicitUserId, explicitEmail]
    .map((entry) => entry.toLowerCase())
    .filter(Boolean);
  const canUseFallback = identitiesOverlap(fallback, explicitKeys);
  const fallbackUserId = canUseFallback
    ? firstSourceString(fallbackSources, ["userId", "user_id", "uid"])
    : "";
  const fallbackEmail = canUseFallback
    ? firstSourceString(fallbackSources, ["email", "emailAddress", "email_address"])
      .toLowerCase()
    : "";
  const userId = explicitUserId || fallbackUserId;
  const email = explicitEmail || fallbackEmail;
  const id = explicitId || userId || email || (
    canUseFallback ? firstSourceString(fallbackSources, ["id"]) : ""
  );
  const name = firstSourceString(sources, [
    "name",
    "displayName",
    "display_name",
    "fullName",
    "full_name",
    "username",
    "userName",
  ]) || (
    canUseFallback
      ? firstSourceString(fallbackSources, [
          "name",
          "displayName",
          "display_name",
          "fullName",
          "full_name",
        ])
      : ""
  ) || email || userId || id || "Unknown";
  const avatarUrl = firstSourceString(sources, [
    "avatarUrl",
    "avatar_url",
    "photoUrl",
    "photoURL",
    "photo_url",
    "picture",
    "imageUrl",
    "imageURL",
    "image_url",
  ]) || (
    canUseFallback
      ? firstSourceString(fallbackSources, [
          "avatarUrl",
          "avatar_url",
          "photoUrl",
          "photoURL",
          "photo_url",
          "picture",
        ])
      : ""
  );

  return { type: "user", id, userId, name, email, avatarUrl };
}

function roleIdentity(
  value: unknown,
  role: "creator" | "owner",
  fallback: TestPersonIdentityInput,
): TestPersonIdentity {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const roleKeys = role === "creator"
    ? ["creator", "createdBy", "created_by"]
    : ["owner"];
  const nested = firstRoleRecord(source, metadata, roleKeys);
  const prefix = role === "creator" ? "creator" : "owner";
  const aliases: UnknownRecord = {
    id: source[`${prefix}Id`] || source[`${prefix}_id`]
      || metadata[`${prefix}Id`] || metadata[`${prefix}_id`],
    userId: source[`${prefix}UserId`] || source[`${prefix}_user_id`]
      || metadata[`${prefix}UserId`] || metadata[`${prefix}_user_id`],
    name: source[`${prefix}Name`] || source[`${prefix}_name`]
      || metadata[`${prefix}Name`] || metadata[`${prefix}_name`],
    email: source[`${prefix}Email`] || source[`${prefix}_email`]
      || metadata[`${prefix}Email`] || metadata[`${prefix}_email`],
    avatarUrl: source[`${prefix}AvatarUrl`] || source[`${prefix}_avatar_url`]
      || metadata[`${prefix}AvatarUrl`] || metadata[`${prefix}_avatar_url`],
  };
  if (role === "creator") {
    aliases.id = aliases.id || source.createdById || source.created_by_id
      || metadata.createdById || metadata.created_by_id;
    aliases.userId = aliases.userId || source.createdByUserId || source.created_by_user_id
      || metadata.createdByUserId || metadata.created_by_user_id;
    aliases.name = aliases.name || source.createdByName || source.created_by_name
      || metadata.createdByName || metadata.created_by_name;
    aliases.email = aliases.email || source.createdByEmail || source.created_by_email
      || metadata.createdByEmail || metadata.created_by_email;
    aliases.avatarUrl = aliases.avatarUrl
      || source.createdByAvatarUrl || source.created_by_avatar_url
      || metadata.createdByAvatarUrl || metadata.created_by_avatar_url;
  }
  return normalizeTestPersonIdentity({ ...aliases, ...nested }, fallback);
}

export function getTestPlanCreatorIdentity(
  plan: unknown,
  fallback: TestPersonIdentityInput = {},
): TestPersonIdentity {
  return roleIdentity(plan, "creator", fallback);
}

export function getTestPlanOwnerIdentity(
  plan: unknown,
  fallback: TestPersonIdentityInput = {},
): TestPersonIdentity {
  return roleIdentity(plan, "owner", fallback);
}

export function getTestPersonIdentityKeys(
  identity: TestPersonIdentityInput,
): string[] {
  return [...new Set([identity.id, identity.userId, identity.email]
    .map((value) => asString(value).toLowerCase())
    .filter(Boolean))];
}

export function getTestOwnerCandidateKey(
  identity: TestPersonIdentityInput,
): string {
  return getTestPersonIdentityKeys(identity)[0]
    || asString(identity.name || identity.displayName).toLowerCase();
}

export function mergeTestOwnerCandidates(
  candidates: readonly unknown[],
): TestPersonIdentity[] {
  const merged: TestPersonIdentity[] = [];
  candidates.forEach((candidate) => {
    const normalized = normalizeTestPersonIdentity(candidate);
    const keys = new Set(getTestPersonIdentityKeys(normalized));
    const existingIndex = merged.findIndex((existing) => (
      getTestPersonIdentityKeys(existing).some((key) => keys.has(key))
    ));
    if (existingIndex < 0) {
      if (getTestOwnerCandidateKey(normalized)) merged.push(normalized);
      return;
    }
    const existing = merged[existingIndex];
    merged[existingIndex] = {
      type: "user",
      id: existing.id || normalized.id,
      userId: existing.userId || normalized.userId,
      name: existing.name && existing.name !== "Unknown"
        ? existing.name
        : normalized.name,
      email: existing.email || normalized.email,
      avatarUrl: existing.avatarUrl || normalized.avatarUrl,
    };
  });
  return merged.sort((left, right) => (
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  ));
}

function hasRoleIdentity(metadata: UnknownRecord, role: "creator" | "owner"): boolean {
  const keys = role === "creator"
    ? ["creator", "createdBy", "created_by"]
    : ["owner"];
  const aliasKeys = [
      `${role}Id`,
      `${role}_id`,
      `${role}UserId`,
      `${role}_user_id`,
      `${role}Email`,
      `${role}_email`,
    ];
  if (role === "creator") {
    aliasKeys.push(
      "createdById",
      "created_by_id",
      "createdByUserId",
      "created_by_user_id",
      "createdByEmail",
      "created_by_email",
    );
  }
  return keys.some((key) => Object.keys(asRecord(metadata[key])).length > 0)
    || aliasKeys.some((key) => Boolean(asString(metadata[key])));
}

function assignIdentityMetadata(
  metadata: UnknownRecord,
  role: "creator" | "owner",
  identity: TestPersonIdentity,
): UnknownRecord {
  const persistedIdentity = {
    type: identity.type,
    id: identity.id,
    userId: identity.userId,
    name: identity.name,
    email: identity.email,
    avatarUrl: identity.avatarUrl,
  };
  const next: UnknownRecord = { ...metadata, [role]: persistedIdentity };
  if (identity.id) {
    next[`${role}Id`] = identity.id;
    next[`${role}_id`] = identity.id;
  }
  if (identity.userId) {
    next[`${role}UserId`] = identity.userId;
    next[`${role}_user_id`] = identity.userId;
  }
  if (identity.name) {
    next[`${role}Name`] = identity.name;
    next[`${role}_name`] = identity.name;
  }
  if (identity.email) {
    next[`${role}Email`] = identity.email;
    next[`${role}_email`] = identity.email;
  }
  if (identity.avatarUrl) {
    next[`${role}AvatarUrl`] = identity.avatarUrl;
    next[`${role}_avatar_url`] = identity.avatarUrl;
  }
  if (role === "creator") {
    next.createdBy = persistedIdentity;
    next.created_by = persistedIdentity;
    if (identity.id) {
      next.createdById = identity.id;
      next.created_by_id = identity.id;
    }
    if (identity.userId) {
      next.createdByUserId = identity.userId;
      next.created_by_user_id = identity.userId;
    }
    if (identity.name) {
      next.createdByName = identity.name;
      next.created_by_name = identity.name;
    }
    if (identity.email) {
      next.createdByEmail = identity.email;
      next.created_by_email = identity.email;
    }
    if (identity.avatarUrl) {
      next.createdByAvatarUrl = identity.avatarUrl;
      next.created_by_avatar_url = identity.avatarUrl;
    }
  }
  return next;
}

export function initializeTestPlanIdentityMetadata(
  value: Record<string, unknown> | null | undefined,
  identityInput: TestPersonIdentityInput,
): Record<string, unknown> {
  const identity = normalizeTestPersonIdentity(identityInput);
  let metadata = { ...asRecord(value) };
  if (!hasRoleIdentity(metadata, "creator")) {
    metadata = assignIdentityMetadata(metadata, "creator", identity);
  }
  if (!hasRoleIdentity(metadata, "owner")) {
    metadata = assignIdentityMetadata(metadata, "owner", identity);
  }
  return metadata;
}

export function setTestPlanOwnerMetadata(
  value: Record<string, unknown> | null | undefined,
  ownerInput: TestPersonIdentityInput,
  creatorInput?: TestPersonIdentityInput,
): Record<string, unknown> {
  let metadata = { ...asRecord(value) };
  if (creatorInput && !hasRoleIdentity(metadata, "creator")) {
    metadata = assignIdentityMetadata(
      metadata,
      "creator",
      normalizeTestPersonIdentity(creatorInput),
    );
  }
  return assignIdentityMetadata(
    metadata,
    "owner",
    normalizeTestPersonIdentity(ownerInput),
  );
}
