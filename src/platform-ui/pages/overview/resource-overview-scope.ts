export type PlatformResourceOverviewScope = "all" | "created" | "shared";

export interface PlatformResourceOverviewIdentity {
  id?: unknown;
  userId?: unknown;
  user_id?: unknown;
  uid?: unknown;
  name?: unknown;
  displayName?: unknown;
  display_name?: unknown;
  email?: unknown;
}

function normalizeIdentityValue(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getIdentityKeys(identity: PlatformResourceOverviewIdentity): string[] {
  return Array.from(
    new Set(
      [identity.id, identity.userId, identity.user_id, identity.uid, identity.email]
        .map(normalizeIdentityValue)
        .filter(Boolean),
    ),
  );
}

function getIdentityName(identity: PlatformResourceOverviewIdentity): string {
  return normalizeIdentityValue(identity.name || identity.displayName || identity.display_name);
}

export function normalizePlatformResourceOverviewScope(
  value: unknown,
): PlatformResourceOverviewScope {
  return value === "created" || value === "shared" ? value : "all";
}

export function isPlatformResourceCreatedByViewer(
  creator: PlatformResourceOverviewIdentity,
  viewer: PlatformResourceOverviewIdentity,
): boolean {
  const viewerKeys = new Set(getIdentityKeys(viewer));
  const creatorKeys = getIdentityKeys(creator);
  if (creatorKeys.some((key) => viewerKeys.has(key))) return true;
  if (creatorKeys.length) return false;

  const creatorName = getIdentityName(creator);
  if (!creatorName || ["unknown", "you", "me", "current user"].includes(creatorName)) {
    // Resources created before creator metadata was persisted belong to the
    // viewer's private catalog, so retain them in the personal scope.
    return true;
  }
  return Boolean(getIdentityName(viewer) && creatorName === getIdentityName(viewer));
}

export function filterPlatformResourcesByOverviewScope<T>(
  resources: readonly T[],
  scope: PlatformResourceOverviewScope,
  viewer: PlatformResourceOverviewIdentity,
  getCreator: (resource: T) => PlatformResourceOverviewIdentity,
): readonly T[] {
  if (scope === "all") return resources;
  return resources.filter((resource) => {
    const createdByViewer = isPlatformResourceCreatedByViewer(getCreator(resource), viewer);
    return scope === "created" ? createdByViewer : !createdByViewer;
  });
}
