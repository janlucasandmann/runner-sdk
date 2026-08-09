import {
  useEffect,
  useRef,
} from "react";

export interface PlatformVersionNavigationGuard {
  id: string;
  active: true;
  title: string;
  description: string;
  onDiscard: () => void;
}

export type PlatformVersionNavigationGuardRegistrar = (
  guard: PlatformVersionNavigationGuard | null,
) => void;

export interface PlatformVersionNavigationGuardOptions {
  dirty: boolean;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar | null;
  onDiscard?: (() => void) | null;
  enabled?: boolean;
  guardId?: string;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
  title?: string;
  description?: string;
}

function normalizeGuardToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPlatformVersionNavigationGuard({
  dirty,
  onDiscard,
  enabled = true,
  guardId = "",
  resourceId = "",
  resourceName = "",
  resourceType = "resource",
  title = "Leave without saving?",
  description = "",
}: Omit<PlatformVersionNavigationGuardOptions, "onNavigationGuardChange">): PlatformVersionNavigationGuard | null {
  if (!enabled || !dirty) return null;

  const normalizedResourceType = String(resourceType || "resource").trim() || "resource";
  const normalizedResourceName = String(resourceName || "").trim()
    || `this ${normalizedResourceType.toLowerCase()}`;
  const normalizedGuardId = String(guardId || "").trim()
    || [
      normalizeGuardToken(normalizedResourceType) || "resource",
      normalizeGuardToken(resourceId),
      "unsaved-version-changes",
    ].filter(Boolean).join("-");

  return {
    id: normalizedGuardId,
    active: true,
    title: String(title || "Leave without saving?").trim() || "Leave without saving?",
    description: String(description || "").trim()
      || `Your changes to ${normalizedResourceName} have not been saved. If you leave now, they will be lost.`,
    onDiscard: typeof onDiscard === "function" ? onDiscard : () => {},
  };
}

/**
 * Registers the standard unsaved-navigation guard for a versioned resource.
 *
 * Versioned detail surfaces should use this hook as soon as their editable
 * snapshot differs from the selected immutable version. The platform shell
 * owns the confirmation modal and navigation continuation; resource modules
 * only provide their dirty state and a local draft reset.
 */
export function usePlatformVersionNavigationGuard({
  onNavigationGuardChange,
  onDiscard,
  ...options
}: PlatformVersionNavigationGuardOptions): void {
  const onDiscardRef = useRef(onDiscard);

  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  useEffect(() => {
    if (typeof onNavigationGuardChange !== "function") return undefined;
    if (options.enabled === false) return undefined;

    const guard = buildPlatformVersionNavigationGuard({
      ...options,
      onDiscard: () => onDiscardRef.current?.(),
    });
    onNavigationGuardChange(guard);

    return () => onNavigationGuardChange(null);
  }, [
    onNavigationGuardChange,
    options.description,
    options.dirty,
    options.enabled,
    options.guardId,
    options.resourceId,
    options.resourceName,
    options.resourceType,
    options.title,
  ]);
}
