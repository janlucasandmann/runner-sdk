import type { KnowledgeLibrary } from "../domain/index.js";

export type KnowledgeOverviewScope = "all" | "created" | "shared";

export interface KnowledgeOverviewViewerIdentity {
  id?: string;
  name?: string;
  email?: string;
}

function normalizeIdentityKey(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function isKnowledgeLibraryCreatedByViewer(
  library: KnowledgeLibrary,
  viewer: KnowledgeOverviewViewerIdentity,
) {
  const viewerIdentityKeys = new Set(
    [viewer.id, viewer.email].map(normalizeIdentityKey).filter(Boolean),
  );
  const creatorIdentityKeys = [
    library.creatorUserId,
    library.creatorId,
    library.creatorEmail,
  ].map(normalizeIdentityKey).filter(Boolean);

  if (creatorIdentityKeys.some((key) => viewerIdentityKeys.has(key))) return true;
  if (creatorIdentityKeys.length) return false;

  const creatorName = normalizeIdentityKey(library.creatorName);
  const viewerName = normalizeIdentityKey(viewer.name);
  if (!creatorName || ["you", "me", "current user"].includes(creatorName)) {
    return true;
  }
  return Boolean(viewerName && creatorName === viewerName);
}

export function filterKnowledgeLibrariesByScope(
  libraries: readonly KnowledgeLibrary[],
  scope: KnowledgeOverviewScope,
  viewer: KnowledgeOverviewViewerIdentity,
) {
  if (scope === "all") return libraries;
  return libraries.filter((library) => {
    const isCreatedByViewer = isKnowledgeLibraryCreatedByViewer(library, viewer);
    return scope === "created" ? isCreatedByViewer : !isCreatedByViewer;
  });
}
