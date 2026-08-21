import type { BatchCreatorIdentity, BatchJob } from "./batches-types.js";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readIdentityValue(
  sources: readonly Record<string, unknown>[],
  keys: readonly string[],
) {
  for (const source of sources) {
    for (const key of keys) {
      const value = String(source[key] || "").replace(/\s+/g, " ").trim();
      if (value) return value;
    }
  }
  return "";
}

/** Resolves the durable creator snapshot while preferring the live current-user identity. */
export function getBatchCreatorIdentity(
  job: BatchJob,
  currentUser: BatchCreatorIdentity = { id: "", name: "" },
): BatchCreatorIdentity {
  const source = asRecord(job);
  const metadata = asRecord(job.metadata);
  const creator = asRecord(
    source.creator
    || source.createdBy
    || source.created_by
    || metadata.creator
    || metadata.createdBy
    || metadata.created_by,
  );
  const sources = [creator, source, metadata];
  const creatorId = String(
    job.createdByUserId
    || readIdentityValue(sources, [
      "userId",
      "user_id",
      "creatorUserId",
      "creator_user_id",
      "createdByUserId",
      "created_by_user_id",
      "id",
    ])
    || job.userId,
  ).trim();
  const isCurrentUser = Boolean(
    currentUser.id && creatorId && currentUser.id === creatorId,
  );
  const email = (
    (isCurrentUser ? currentUser.email : "")
    || readIdentityValue(sources, [
      "email",
      "creatorEmail",
      "creator_email",
      "createdByEmail",
      "created_by_email",
    ])
  ).trim();
  const name = (
    (isCurrentUser ? currentUser.name : "")
    || readIdentityValue(sources, [
      "name",
      "displayName",
      "display_name",
      "creatorName",
      "creator_name",
      "createdByName",
      "created_by_name",
    ])
    || email
    || "User"
  ).trim();
  const avatarUrl = (
    (isCurrentUser ? currentUser.avatarUrl : "")
    || readIdentityValue(sources, [
      "avatarUrl",
      "avatar_url",
      "photoURL",
      "photoUrl",
      "photo_url",
      "picture",
      "creatorAvatarUrl",
      "creator_avatar_url",
      "createdByAvatarUrl",
      "created_by_avatar_url",
    ])
  ).trim();
  return { id: creatorId, name, email, avatarUrl };
}

/** Resolves the durable Batch owner independently from the creating actor. */
export function getBatchOwnerIdentity(
  job: BatchJob,
  currentUser: BatchCreatorIdentity = { id: "", name: "" },
): BatchCreatorIdentity {
  const source = asRecord(job);
  const metadata = asRecord(job.metadata);
  const owner = asRecord(
    source.owner
    || source.ownedBy
    || source.owned_by
    || metadata.owner
    || metadata.ownedBy
    || metadata.owned_by,
  );
  const ownerId = String(
    readIdentityValue([owner], ["userId", "user_id", "id"])
    || readIdentityValue([source, metadata], [
      "ownerUserId",
      "owner_user_id",
      "ownedByUserId",
      "owned_by_user_id",
    ])
    || job.userId,
  ).trim();
  const isCurrentUser = Boolean(
    currentUser.id && ownerId && currentUser.id === ownerId,
  );
  const creator = getBatchCreatorIdentity(job, currentUser);
  const creatorIsOwner = Boolean(ownerId && creator.id && ownerId === creator.id);
  const email = (
    (isCurrentUser ? currentUser.email : "")
    || readIdentityValue([owner], ["email"])
    || readIdentityValue([source, metadata], [
      "ownerEmail",
      "owner_email",
      "ownedByEmail",
      "owned_by_email",
    ])
    || (creatorIsOwner ? creator.email : "")
    || ""
  ).trim();
  const name = (
    (isCurrentUser ? currentUser.name : "")
    || readIdentityValue([owner], ["name", "displayName", "display_name"])
    || readIdentityValue([source, metadata], [
      "ownerName",
      "owner_name",
      "ownedByName",
      "owned_by_name",
    ])
    || (creatorIsOwner ? creator.name : "")
    || email
    || "User"
  ).trim();
  const avatarUrl = (
    (isCurrentUser ? currentUser.avatarUrl : "")
    || readIdentityValue([owner], [
      "avatarUrl",
      "avatar_url",
      "photoURL",
      "photoUrl",
      "photo_url",
      "picture",
    ])
    || readIdentityValue([source, metadata], [
      "ownerAvatarUrl",
      "owner_avatar_url",
      "ownedByAvatarUrl",
      "owned_by_avatar_url",
    ])
    || (creatorIsOwner ? creator.avatarUrl : "")
    || ""
  ).trim();
  return { id: ownerId, name, email, avatarUrl };
}
