import { asAssuranceRecord } from "./assurance-types.js";

export interface AssurancePersonIdentity {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type AssurancePersonIdentityInput = Partial<AssurancePersonIdentity> & {
  displayName?: string;
  photoUrl?: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeAssurancePersonIdentity(value: unknown): AssurancePersonIdentity {
  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return {
      id: normalizedValue,
      userId: "",
      name: normalizedValue.includes("@") ? "" : normalizedValue,
      email: normalizedValue.includes("@") ? normalizedValue.toLowerCase() : "",
      avatarUrl: "",
    };
  }
  const source = asAssuranceRecord(value);
  const id = asString(source.id || source.userId || source.user_id || source.uid || source.email);
  const userId = asString(source.userId || source.user_id || source.uid);
  const email = asString(source.email || source.mail).toLowerCase();
  return {
    id: id || userId || email,
    userId,
    name: asString(
      source.name || source.displayName || source.display_name || source.label || source.title,
    ),
    email,
    avatarUrl: asString(
      source.avatarUrl ||
        source.avatar_url ||
        source.photoUrl ||
        source.photoURL ||
        source.photo_url ||
        source.imageUrl ||
        source.imageURL,
    ),
  };
}

export function resolveAssurancePersonIdentity(
  value: unknown,
  knownIdentities: readonly unknown[] = [],
): AssurancePersonIdentity {
  const identity = normalizeAssurancePersonIdentity(value);
  const identityKeys = new Set(
    [identity.userId, identity.email, identity.id]
      .map((key) => key.trim().toLowerCase())
      .filter(Boolean),
  );
  const matchingIdentity = knownIdentities
    .map(normalizeAssurancePersonIdentity)
    .filter((candidate) => candidate.id || candidate.userId || candidate.email || candidate.name)
    .find((candidate) => {
      const candidateKeys = [candidate.userId, candidate.email, candidate.id]
        .map((key) => key.trim().toLowerCase())
        .filter(Boolean);
      if (candidateKeys.some((key) => identityKeys.has(key))) return true;
      const identityName = identity.name.trim().toLowerCase();
      const candidateName = candidate.name.trim().toLowerCase();
      return Boolean(!identityKeys.size && identityName && identityName === candidateName);
    });
  if (!matchingIdentity) return identity;
  const identityName = identity.name.trim();
  const identityNameIsIdentifier = identityKeys.has(identityName.toLowerCase());
  return {
    id: identity.id || matchingIdentity.id,
    userId: identity.userId || matchingIdentity.userId,
    name: matchingIdentity.name || (identityNameIsIdentifier ? "" : identityName),
    email: matchingIdentity.email || identity.email,
    avatarUrl: matchingIdentity.avatarUrl || identity.avatarUrl,
  };
}

export function getAssurancePolicyCreatorIdentity(policy: unknown): AssurancePersonIdentity {
  const source = asAssuranceRecord(policy);
  const metadata = asAssuranceRecord(source.metadata);
  const nested =
    source.creator ||
    source.createdBy ||
    source.created_by ||
    metadata.creator ||
    metadata.createdBy ||
    metadata.created_by;
  const direct = normalizeAssurancePersonIdentity({
    id:
      source.creatorId ||
      source.creator_id ||
      source.createdById ||
      source.created_by_id ||
      metadata.creatorId ||
      metadata.creator_id ||
      metadata.createdById ||
      metadata.created_by_id,
    userId:
      source.creatorUserId ||
      source.creator_user_id ||
      source.createdByUserId ||
      source.created_by_user_id ||
      metadata.creatorUserId ||
      metadata.creator_user_id ||
      metadata.createdByUserId ||
      metadata.created_by_user_id,
    name:
      source.creatorName ||
      source.creator_name ||
      source.createdByName ||
      source.created_by_name ||
      metadata.creatorName ||
      metadata.creator_name ||
      metadata.createdByName ||
      metadata.created_by_name,
    email:
      source.creatorEmail ||
      source.creator_email ||
      source.createdByEmail ||
      source.created_by_email ||
      metadata.creatorEmail ||
      metadata.creator_email ||
      metadata.createdByEmail ||
      metadata.created_by_email,
    avatarUrl:
      source.creatorAvatarUrl ||
      source.creator_avatar_url ||
      source.createdByAvatarUrl ||
      source.created_by_avatar_url ||
      metadata.creatorAvatarUrl ||
      metadata.creator_avatar_url ||
      metadata.createdByAvatarUrl ||
      metadata.created_by_avatar_url,
  });
  const nestedIdentity = normalizeAssurancePersonIdentity(nested);
  return {
    id: nestedIdentity.id || direct.id,
    userId: nestedIdentity.userId || direct.userId,
    name: nestedIdentity.name || direct.name,
    email: nestedIdentity.email || direct.email,
    avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
  };
}

export function resolveAssurancePolicyCreatorIdentity(
  policy: unknown,
  knownIdentities: readonly unknown[] = [],
): AssurancePersonIdentity {
  return resolveAssurancePersonIdentity(
    getAssurancePolicyCreatorIdentity(policy),
    knownIdentities,
  );
}

export function initializeAssurancePolicyIdentityMetadata(
  value: Record<string, unknown> | null | undefined,
  viewer: AssurancePersonIdentityInput,
): Record<string, unknown> {
  const metadata = { ...asAssuranceRecord(value) };
  const identity = normalizeAssurancePersonIdentity(viewer);
  const persistedIdentity = { ...identity, type: "user" };
  const existingCreator = getAssurancePolicyCreatorIdentity({ metadata });
  if (
    !existingCreator.id &&
    !existingCreator.userId &&
    !existingCreator.email &&
    !existingCreator.name
  ) {
    metadata.creator = persistedIdentity;
    metadata.createdBy = persistedIdentity;
    if (identity.id) metadata.creatorId = identity.id;
    if (identity.userId) metadata.creatorUserId = identity.userId;
    if (identity.name) metadata.creatorName = identity.name;
    if (identity.email) metadata.creatorEmail = identity.email;
    if (identity.avatarUrl) metadata.creatorAvatarUrl = identity.avatarUrl;
  }
  if (!Object.keys(asAssuranceRecord(metadata.owner)).length) {
    metadata.owner = persistedIdentity;
  }
  return metadata;
}
