import type {
  PlatformPermissionAccess,
  PlatformPermissionAccessOption,
  PlatformPermissionActionDefinition,
  PlatformPermissionActionPolicy,
  PlatformPermissionRingDefinition,
  PlatformPermissionRingPolicy,
  PlatformPermissionSet,
} from "./permission-types.js";

export const PLATFORM_PERMISSION_ACCESS_OPTIONS: readonly PlatformPermissionAccessOption[] = [
  { id: "full_access", label: "Full access", progress: 100 },
  { id: "ask_for_permission", label: "Ask permission", progress: 66 },
  { id: "read_only", label: "Read only", progress: 33 },
  { id: "no_access", label: "No access", progress: 0 },
];

export const PLATFORM_PERMISSION_RING_GRADIENTS: Readonly<Record<string, readonly [readonly [number, number, number], readonly [number, number, number]]>> = {
  ring_1: [[82, 188, 67], [29, 225, 163]],
  ring_2: [[17, 95, 251], [78, 162, 255]],
  ring_3: [[180, 8, 55], [226, 30, 82]],
};

export const PLATFORM_PERMISSION_MINI_RING_GRADIENTS: Readonly<Record<string, readonly [readonly [number, number, number], readonly [number, number, number]]>> = {
  ring_1: [[31, 130, 72], [29, 225, 163]],
  ring_2: [[7, 61, 188], [78, 162, 255]],
  ring_3: [[126, 4, 39], [226, 30, 82]],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizePlatformPermissionAccess(
  value: unknown,
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
  fallback: PlatformPermissionAccess = "full_access",
): PlatformPermissionAccess {
  return accessOptions.some((option) => option.id === value)
    ? String(value)
    : fallback;
}

export function getPlatformPermissionAccessLabel(
  access: PlatformPermissionAccess,
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
): string {
  return accessOptions.find((option) => option.id === access)?.label || "Custom";
}

export function getPlatformPermissionAccessProgress(
  access: PlatformPermissionAccess,
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
): number {
  const configuredProgress = accessOptions.find((option) => option.id === access)?.progress;
  if (Number.isFinite(configuredProgress)) {
    return Math.max(0, Math.min(100, Number(configuredProgress)));
  }
  switch (normalizePlatformPermissionAccess(access, accessOptions, "no_access")) {
    case "full_access":
      return 100;
    case "ask_for_permission":
      return 66;
    case "read_only":
      return 33;
    default:
      return 0;
  }
}

export function getPlatformPermissionRingGradientColors(
  ringId: string,
  gradients = PLATFORM_PERMISSION_RING_GRADIENTS,
): readonly [readonly [number, number, number], readonly [number, number, number]] {
  return gradients[ringId] || [[255, 255, 255], [255, 255, 255]];
}

export function getPlatformPermissionRingRgba(
  color: readonly [number, number, number],
  alpha: number,
): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

export function getPlatformPermissionRingStartColor(ringId: string, alpha = 1): string {
  return getPlatformPermissionRingRgba(getPlatformPermissionRingGradientColors(ringId)[0], alpha);
}

export function getPlatformPermissionRingEndColor(ringId: string, alpha = 1): string {
  return getPlatformPermissionRingRgba(getPlatformPermissionRingGradientColors(ringId)[1], alpha);
}

export function getPlatformPermissionRingAccess(
  permissionSet: PlatformPermissionSet | null | undefined,
  ring: PlatformPermissionRingDefinition,
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
): PlatformPermissionAccess {
  const rawPolicy = permissionSet?.rings?.[ring.id];
  const rawAccess = typeof rawPolicy === "string"
    ? rawPolicy
    : isRecord(rawPolicy)
      ? rawPolicy.defaultAccess
      : undefined;
  return normalizePlatformPermissionAccess(
    rawAccess,
    accessOptions,
    normalizePlatformPermissionAccess(permissionSet?.defaultAccess, accessOptions, ring.defaultAccess),
  );
}

export function getPlatformPermissionActionRingId(
  permissionSet: PlatformPermissionSet | null | undefined,
  action: PlatformPermissionActionDefinition,
  ringDefinitions: readonly PlatformPermissionRingDefinition[],
): string {
  const rawPolicy = permissionSet?.actions?.[action.id];
  const rawRingId = isRecord(rawPolicy) ? rawPolicy.ringId : undefined;
  return ringDefinitions.some((ring) => ring.id === rawRingId) ? String(rawRingId) : action.ringId;
}

export function getPlatformPermissionActionExplicitAccess(
  permissionSet: PlatformPermissionSet | null | undefined,
  action: PlatformPermissionActionDefinition,
  ringDefinitions: readonly PlatformPermissionRingDefinition[],
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
): PlatformPermissionAccess | "" {
  const rawPolicy = permissionSet?.actions?.[action.id];
  const rawAccess = typeof rawPolicy === "string"
    ? rawPolicy
    : isRecord(rawPolicy)
      ? rawPolicy.access
      : undefined;
  const explicitAccess = normalizePlatformPermissionAccess(rawAccess, accessOptions, "");
  if (!explicitAccess) return "";
  const actionRingId = getPlatformPermissionActionRingId(permissionSet, action, ringDefinitions);
  const ringDefinition = ringDefinitions.find((ring) => ring.id === actionRingId);
  if (!ringDefinition) return explicitAccess;
  const inheritedAccess = getPlatformPermissionRingAccess(permissionSet, ringDefinition, accessOptions);
  return explicitAccess === inheritedAccess ? "" : explicitAccess;
}

export function getPlatformPermissionActionAccess(
  permissionSet: PlatformPermissionSet | null | undefined,
  action: PlatformPermissionActionDefinition,
  ringDefinitions: readonly PlatformPermissionRingDefinition[],
  accessOptions: readonly PlatformPermissionAccessOption[] = PLATFORM_PERMISSION_ACCESS_OPTIONS,
): PlatformPermissionAccess {
  const explicitAccess = getPlatformPermissionActionExplicitAccess(
    permissionSet,
    action,
    ringDefinitions,
    accessOptions,
  );
  if (explicitAccess) return explicitAccess;
  const ringId = getPlatformPermissionActionRingId(permissionSet, action, ringDefinitions);
  const ring = ringDefinitions.find((definition) => definition.id === ringId);
  return ring
    ? getPlatformPermissionRingAccess(permissionSet, ring, accessOptions)
    : normalizePlatformPermissionAccess(permissionSet?.defaultAccess, accessOptions, "full_access");
}

export function getPlatformPermissionActionPolicy(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionId: string,
): PlatformPermissionActionPolicy {
  const rawPolicy = permissionSet?.actions?.[actionId];
  if (typeof rawPolicy === "string") return { access: rawPolicy };
  return isRecord(rawPolicy) ? rawPolicy as PlatformPermissionActionPolicy : {};
}

export function getPlatformPermissionRingPolicy(
  permissionSet: PlatformPermissionSet | null | undefined,
  ringId: string,
): PlatformPermissionRingPolicy {
  const rawPolicy = permissionSet?.rings?.[ringId];
  if (typeof rawPolicy === "string") return { defaultAccess: rawPolicy };
  return isRecord(rawPolicy) ? rawPolicy as PlatformPermissionRingPolicy : {};
}

export function shouldShowPlatformPermissionAction(
  action: PlatformPermissionActionDefinition,
  subjectType: string,
): boolean {
  const scopedOnlySubjectTypes = new Set(["team", "team_role", "organization_role", "database"]);
  if (scopedOnlySubjectTypes.has(subjectType)) {
    return Array.isArray(action.subjectTypes) && action.subjectTypes.includes(subjectType);
  }
  return !Array.isArray(action.subjectTypes) || action.subjectTypes.includes(subjectType);
}
