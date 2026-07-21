type UnknownRecord = Record<string, unknown>;

export interface DevelopResourceIdentity {
  type: "user";
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type DevelopResourceIdentityInput = Partial<DevelopResourceIdentity> & {
  displayName?: string;
  photoUrl?: string;
};

const CREATOR_OBJECT_KEYS = ["creator", "createdBy", "created_by"] as const;
const OWNER_OBJECT_KEYS = ["owner"] as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstString(values: readonly unknown[]): string {
  for (const value of values) {
    const normalized = asString(value);
    if (normalized) return normalized;
  }
  return "";
}

function firstRecord(source: UnknownRecord, metadata: UnknownRecord, keys: readonly string[]): UnknownRecord {
  for (const key of keys) {
    const direct = asRecord(source[key]);
    if (Object.keys(direct).length > 0) return direct;
    const nested = asRecord(metadata[key]);
    if (Object.keys(nested).length > 0) return nested;
  }
  return {};
}

function identityMatches(left: DevelopResourceIdentityInput, rightId: string): boolean {
  const normalizedRightId = rightId.toLowerCase();
  if (!normalizedRightId) return true;
  return [left.id, left.userId, left.email]
    .map((value) => asString(value).toLowerCase())
    .filter(Boolean)
    .includes(normalizedRightId);
}

function normalizeIdentity(
  nested: UnknownRecord,
  values: {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl: string;
  },
  fallback: DevelopResourceIdentityInput,
): DevelopResourceIdentity {
  const explicitUserId = firstString([
    nested.userId,
    nested.user_id,
    nested.uid,
    values.userId,
  ]);
  const explicitEmail = firstString([
    nested.email,
    nested.emailAddress,
    nested.email_address,
    nested.mail,
    values.email,
  ]).toLowerCase();
  const explicitId = firstString([
    nested.id,
    nested.memberId,
    nested.member_id,
    values.id,
    explicitUserId,
    explicitEmail,
  ]);
  const canUseFallbackProfile = !explicitId || identityMatches(fallback, explicitId);
  const fallbackName = canUseFallbackProfile
    ? firstString([fallback.name, fallback.displayName])
    : "";
  const fallbackEmail = canUseFallbackProfile ? asString(fallback.email).toLowerCase() : "";
  const fallbackAvatarUrl = canUseFallbackProfile
    ? firstString([fallback.avatarUrl, fallback.photoUrl])
    : "";
  const email = explicitEmail || fallbackEmail;
  const userId = explicitUserId || (canUseFallbackProfile ? asString(fallback.userId) : "");
  const id = explicitId || userId || email || (canUseFallbackProfile ? asString(fallback.id) : "");
  const name = firstString([
    nested.name,
    nested.displayName,
    nested.display_name,
    nested.fullName,
    nested.full_name,
    values.name,
    fallbackName,
    email,
    userId,
    id,
  ]) || "Unknown";
  const avatarUrl = firstString([
    nested.avatarUrl,
    nested.avatar_url,
    nested.photoUrl,
    nested.photoURL,
    nested.photo_url,
    nested.picture,
    nested.imageUrl,
    nested.image_url,
    values.avatarUrl,
    fallbackAvatarUrl,
  ]);

  return { type: "user", id, userId, name, email, avatarUrl };
}

export function normalizeDevelopResourceIdentity(
  value: unknown,
  fallback: DevelopResourceIdentityInput = {},
): DevelopResourceIdentity {
  return normalizeIdentity(asRecord(value), {
    id: "",
    userId: "",
    name: "",
    email: "",
    avatarUrl: "",
  }, fallback);
}

export function getDevelopResourceCreatorIdentity(
  value: unknown,
  fallback: DevelopResourceIdentityInput = {},
): DevelopResourceIdentity {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const nested = firstRecord(source, metadata, CREATOR_OBJECT_KEYS);
  return normalizeIdentity(nested, {
    id: firstString([
      source.creatorId,
      source.creator_id,
      source.createdById,
      source.created_by_id,
      metadata.creatorId,
      metadata.creator_id,
      metadata.createdById,
      metadata.created_by_id,
      source.userId,
      source.user_id,
    ]),
    userId: firstString([
      source.creatorUserId,
      source.creator_user_id,
      source.createdByUserId,
      source.created_by_user_id,
      metadata.creatorUserId,
      metadata.creator_user_id,
      metadata.createdByUserId,
      metadata.created_by_user_id,
      source.userId,
      source.user_id,
    ]),
    name: firstString([
      source.creatorName,
      source.creator_name,
      source.createdByName,
      source.created_by_name,
      metadata.creatorName,
      metadata.creator_name,
      metadata.createdByName,
      metadata.created_by_name,
    ]),
    email: firstString([
      source.creatorEmail,
      source.creator_email,
      source.createdByEmail,
      source.created_by_email,
      metadata.creatorEmail,
      metadata.creator_email,
      metadata.createdByEmail,
      metadata.created_by_email,
    ]),
    avatarUrl: firstString([
      source.creatorAvatarUrl,
      source.creator_avatar_url,
      source.createdByAvatarUrl,
      source.created_by_avatar_url,
      metadata.creatorAvatarUrl,
      metadata.creator_avatar_url,
      metadata.createdByAvatarUrl,
      metadata.created_by_avatar_url,
    ]),
  }, fallback);
}

export function getDevelopResourceOwnerIdentity(
  value: unknown,
  fallback: DevelopResourceIdentityInput = {},
): DevelopResourceIdentity {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const nested = firstRecord(source, metadata, OWNER_OBJECT_KEYS);
  return normalizeIdentity(nested, {
    id: firstString([
      source.ownerId,
      source.owner_id,
      metadata.ownerId,
      metadata.owner_id,
      source.userId,
      source.user_id,
    ]),
    userId: firstString([
      source.ownerUserId,
      source.owner_user_id,
      metadata.ownerUserId,
      metadata.owner_user_id,
      source.userId,
      source.user_id,
    ]),
    name: firstString([
      source.ownerName,
      source.owner_name,
      metadata.ownerName,
      metadata.owner_name,
    ]),
    email: firstString([
      source.ownerEmail,
      source.owner_email,
      metadata.ownerEmail,
      metadata.owner_email,
    ]),
    avatarUrl: firstString([
      source.ownerAvatarUrl,
      source.owner_avatar_url,
      metadata.ownerAvatarUrl,
      metadata.owner_avatar_url,
    ]),
  }, fallback);
}

function assignIdentityMetadata(
  metadata: UnknownRecord,
  role: "creator" | "owner",
  identity: DevelopResourceIdentity,
) {
  const next: UnknownRecord = { ...metadata, [role]: identity };
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
    next.createdBy = identity;
    next.created_by = identity;
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

export function initializeDevelopResourceIdentityMetadata<T extends UnknownRecord>(
  value: T,
  identityInput: DevelopResourceIdentityInput,
  options: { force?: boolean } = {},
): T {
  const identity = normalizeDevelopResourceIdentity(identityInput);
  const source = asRecord(value);
  let metadata = { ...asRecord(source.metadata) };
  const hasCreator = CREATOR_OBJECT_KEYS.some((key) => (
    Object.keys(asRecord(source[key])).length > 0
    || Object.keys(asRecord(metadata[key])).length > 0
  )) || Boolean(firstString([
    source.creatorId,
    source.creator_id,
    source.createdById,
    source.created_by_id,
    metadata.creatorId,
    metadata.creator_id,
    metadata.createdById,
    metadata.created_by_id,
  ]));
  const hasOwner = OWNER_OBJECT_KEYS.some((key) => (
    Object.keys(asRecord(source[key])).length > 0
    || Object.keys(asRecord(metadata[key])).length > 0
  )) || Boolean(firstString([
    source.ownerId,
    source.owner_id,
    metadata.ownerId,
    metadata.owner_id,
  ]));

  if (options.force || !hasCreator) metadata = assignIdentityMetadata(metadata, "creator", identity);
  if (options.force || !hasOwner) metadata = assignIdentityMetadata(metadata, "owner", identity);

  return { ...value, metadata };
}
