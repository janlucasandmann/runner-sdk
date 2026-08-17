import type {
  KnowledgeLibrary,
  KnowledgeLibraryCreateInput,
  KnowledgePersonIdentity,
  KnowledgeViewerIdentity,
} from "./knowledge-types.js";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return String(value || "").trim();
}

function identityKey(value: unknown) {
  return text(value).toLowerCase();
}

function isPlaceholderName(value: unknown) {
  return ["", "unknown", "unknown user", "you", "me", "current user"]
    .includes(identityKey(value));
}

function identityMatchesViewer(
  values: readonly unknown[],
  viewer: KnowledgePersonIdentity,
) {
  const viewerKeys = new Set([viewer.id, viewer.userId, viewer.email]
    .map(identityKey)
    .filter(Boolean));
  return values.map(identityKey).filter(Boolean).some((value) => viewerKeys.has(value));
}

export function resolveKnowledgeViewerIdentity(
  viewer: KnowledgeViewerIdentity,
): KnowledgePersonIdentity | null {
  const email = text(viewer.email).toLowerCase();
  const id = text(viewer.id) || email;
  const name = text(viewer.name) || email || id;
  if (!id) return null;
  return {
    id,
    userId: id,
    name,
    email,
    avatarUrl: text(viewer.avatarUrl),
  };
}

/**
 * A Knowledge library is always created for the authenticated actor. Persisting
 * the actor's presentation data beside the immutable owner IDs keeps resource
 * identity usable when a deployment's optional user directory is sparse.
 */
export function withKnowledgeLibraryCreatorIdentity(
  input: KnowledgeLibraryCreateInput,
  viewer: KnowledgeViewerIdentity,
): KnowledgeLibraryCreateInput {
  const identity = resolveKnowledgeViewerIdentity(viewer);
  if (!identity) return input;
  const metadata = asRecord(input.metadata);
  return {
    ...input,
    metadata: {
      ...metadata,
      creator: {
        ...asRecord(metadata.creator),
        ...identity,
      },
      owner: {
        ...asRecord(metadata.owner),
        ...identity,
      },
    },
  };
}

/**
 * Repairs presentation-only identity gaps on legacy records without changing
 * ownership. We only apply the viewer profile when an immutable ID or email
 * proves that the viewer is the stored creator/owner.
 */
export function withKnowledgeLibraryViewerIdentity(
  library: KnowledgeLibrary,
  viewer: KnowledgeViewerIdentity,
): KnowledgeLibrary {
  const identity = resolveKnowledgeViewerIdentity(viewer);
  if (!identity) return library;
  const metadata = asRecord(library.metadata);
  const creator = asRecord(metadata.creator);
  const owner = asRecord(metadata.owner);
  const creatorMatches = identityMatchesViewer([
    library.creatorId,
    library.creatorUserId,
    library.creatorEmail,
    creator.id,
    creator.userId,
    creator.email,
  ], identity);
  const ownerMatches = identityMatchesViewer([
    library.ownerId,
    library.ownerUserId,
    library.ownerEmail,
    owner.id,
    owner.userId,
    owner.email,
  ], identity);
  if (!creatorMatches && !ownerMatches) return library;
  return {
    ...library,
    ...(creatorMatches ? {
      creatorName: isPlaceholderName(library.creatorName)
        ? identity.name
        : library.creatorName,
      creatorEmail: text(library.creatorEmail) || text(identity.email),
      creatorAvatarUrl: text(library.creatorAvatarUrl) || text(identity.avatarUrl),
    } : {}),
    ...(ownerMatches ? {
      ownerName: isPlaceholderName(library.ownerName)
        ? identity.name
        : library.ownerName,
      ownerEmail: text(library.ownerEmail) || text(identity.email),
      ownerAvatarUrl: text(library.ownerAvatarUrl) || text(identity.avatarUrl),
    } : {}),
  };
}
