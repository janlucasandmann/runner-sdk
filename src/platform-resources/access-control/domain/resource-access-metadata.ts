import {
  createPlatformRolePermissionSet,
  normalizePlatformPermissionSet,
  normalizePlatformRolePermissionSet,
  type PlatformPermissionSet,
  type PlatformPermissionSubjectType,
} from "../../../platform-ui/pages/permissions/index.js";
import {
  getPlatformSharedTeamIds,
  normalizePlatformAccessPrincipalId,
} from "./access-principals.js";

export const PLATFORM_RESOURCE_ACCESS_ROLE_IDS = [
  "owner",
  "admin",
  "contributor",
  "member",
] as const;

export type PlatformResourceAccessRoleId =
  (typeof PLATFORM_RESOURCE_ACCESS_ROLE_IDS)[number] | string;

type PermissionSetMap = Record<string, PlatformPermissionSet>;
type TeamRolePermissionSetMap = Record<string, PermissionSetMap>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeTeamId(value: unknown): string {
  return normalizePlatformAccessPrincipalId(value);
}

export function getPlatformTeamPermissionSets(
  metadata: unknown,
): PermissionSetMap {
  return asRecord(asRecord(metadata).teamPermissionSets) as PermissionSetMap;
}

export function getPlatformTeamRolePermissionSetsMap(
  metadata: unknown,
): TeamRolePermissionSetMap {
  return asRecord(
    asRecord(metadata).teamRolePermissionSets,
  ) as TeamRolePermissionSetMap;
}

export function getPlatformTeamPermissionSet(
  metadata: unknown,
  teamId: unknown,
  subjectType: PlatformPermissionSubjectType,
  fallbackRoleId: PlatformResourceAccessRoleId = "member",
): PlatformPermissionSet {
  const normalizedTeamId = normalizeTeamId(teamId);
  return normalizePlatformRolePermissionSet(
    getPlatformTeamPermissionSets(metadata)[normalizedTeamId],
    subjectType,
    fallbackRoleId,
  );
}

export function getPlatformTeamRolePermissionSets(
  metadata: unknown,
  teamId: unknown,
  subjectType: PlatformPermissionSubjectType,
  roleIds: readonly PlatformResourceAccessRoleId[] =
    PLATFORM_RESOURCE_ACCESS_ROLE_IDS,
): PermissionSetMap {
  const normalizedTeamId = normalizeTeamId(teamId);
  const configured =
    getPlatformTeamRolePermissionSetsMap(metadata)[normalizedTeamId];
  const legacyPermissionSet =
    getPlatformTeamPermissionSets(metadata)[normalizedTeamId];

  return roleIds.reduce<PermissionSetMap>((sets, roleId) => {
    sets[roleId] =
      roleId === "owner"
        ? createPlatformRolePermissionSet(subjectType, roleId)
        : normalizePlatformRolePermissionSet(
            asRecord(configured)[roleId] || legacyPermissionSet,
            subjectType,
            roleId,
          );
    return sets;
  }, {});
}

export function getPlatformTeamRolePermissionSet(
  metadata: unknown,
  teamId: unknown,
  roleId: PlatformResourceAccessRoleId,
  subjectType: PlatformPermissionSubjectType,
  roleIds: readonly PlatformResourceAccessRoleId[] =
    PLATFORM_RESOURCE_ACCESS_ROLE_IDS,
): PlatformPermissionSet {
  const normalizedRoleId =
    String(roleId || "member")
      .trim()
      .toLowerCase() || "member";
  return (
    getPlatformTeamRolePermissionSets(
      metadata,
      teamId,
      subjectType,
      roleIds,
    )[normalizedRoleId] ||
    createPlatformRolePermissionSet(subjectType, normalizedRoleId)
  );
}

export function buildPlatformTeamAccessMetadata(
  metadata: unknown,
  teamId: unknown,
  included: boolean,
  subjectType: PlatformPermissionSubjectType,
  roleIds: readonly PlatformResourceAccessRoleId[] =
    PLATFORM_RESOURCE_ACCESS_ROLE_IDS,
): Record<string, unknown> {
  const metadataRecord = asRecord(metadata);
  const normalizedTeamId = normalizeTeamId(teamId);
  if (!normalizedTeamId) return { ...metadataRecord };

  const teamPermissionSets = {
    ...getPlatformTeamPermissionSets(metadataRecord),
  };
  const teamRolePermissionSets = {
    ...getPlatformTeamRolePermissionSetsMap(metadataRecord),
  };
  const sharedTeamIds = getPlatformSharedTeamIds(metadataRecord).filter(
    (id) => id !== normalizedTeamId,
  );

  if (included) {
    sharedTeamIds.push(normalizedTeamId);
    teamPermissionSets[normalizedTeamId] = getPlatformTeamPermissionSet(
      metadataRecord,
      normalizedTeamId,
      subjectType,
    );
    teamRolePermissionSets[normalizedTeamId] =
      getPlatformTeamRolePermissionSets(
        metadataRecord,
        normalizedTeamId,
        subjectType,
        roleIds,
      );
  } else {
    delete teamPermissionSets[normalizedTeamId];
    delete teamRolePermissionSets[normalizedTeamId];
  }

  const uniqueTeamIds = Array.from(new Set(sharedTeamIds.filter(Boolean)));
  return {
    ...metadataRecord,
    sharedTeamIds: uniqueTeamIds,
    teamAccessIds: uniqueTeamIds,
    teamPermissionSets,
    teamRolePermissionSets,
  };
}

export function buildPlatformTeamRolePermissionMetadata(
  metadata: unknown,
  teamId: unknown,
  roleId: PlatformResourceAccessRoleId,
  permissionSet: PlatformPermissionSet,
  subjectType: PlatformPermissionSubjectType,
  roleIds: readonly PlatformResourceAccessRoleId[] =
    PLATFORM_RESOURCE_ACCESS_ROLE_IDS,
): Record<string, unknown> {
  const metadataRecord = asRecord(metadata);
  const normalizedTeamId = normalizeTeamId(teamId);
  const normalizedRoleId =
    String(roleId || "member")
      .trim()
      .toLowerCase() || "member";
  if (!normalizedTeamId || normalizedRoleId === "owner") {
    return { ...metadataRecord };
  }

  const rolePermissionSets = getPlatformTeamRolePermissionSets(
    metadataRecord,
    normalizedTeamId,
    subjectType,
    roleIds,
  );
  rolePermissionSets[normalizedRoleId] = normalizePlatformPermissionSet(
    permissionSet,
    subjectType,
  );

  return {
    ...buildPlatformTeamAccessMetadata(
      metadataRecord,
      normalizedTeamId,
      true,
      subjectType,
      roleIds,
    ),
    teamRolePermissionSets: {
      ...getPlatformTeamRolePermissionSetsMap(metadataRecord),
      [normalizedTeamId]: rolePermissionSets,
    },
  };
}
