import {
  createPlatformRolePermissionSet,
  createPlatformFullAccessPermissionSet,
  normalizePlatformPermissionSet,
  normalizePlatformRolePermissionSet,
  type PlatformPermissionSet,
  type PlatformPermissionSubjectType,
} from "../../../platform-ui/pages/permissions/index.js";

export const PLATFORM_ALL_AGENTS_PRINCIPAL_ID = "all_agents";
export const PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID =
  "all_organization_members";
export const PLATFORM_RESOURCE_ACCESS_CONTROL_VERSION = 1;

export type PlatformSystemAccessPrincipalId =
  | typeof PLATFORM_ALL_AGENTS_PRINCIPAL_ID
  | typeof PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID;

export type PlatformAccessPrincipalKind = "system" | "team";

export interface PlatformAccessPrincipal {
  id: string;
  name: string;
  kind: PlatformAccessPrincipalKind;
  profileImageUrl?: string;
  locked?: boolean;
  description?: string;
  roleId?: string;
  roleLabel?: string;
  createdAt?: string;
  memberCount?: number;
}

export interface PlatformSystemAccessPrincipal
  extends PlatformAccessPrincipal {
  id: PlatformSystemAccessPrincipalId;
  kind: "system";
  locked: true;
}

export interface PlatformResourceAccessControl {
  version: typeof PLATFORM_RESOURCE_ACCESS_CONTROL_VERSION;
  systemPrincipalPermissionSets: Partial<
    Record<PlatformSystemAccessPrincipalId, PlatformPermissionSet>
  >;
  systemPrincipalRolePermissionSets: Partial<
    Record<PlatformSystemAccessPrincipalId, Record<string, PlatformPermissionSet>>
  >;
}

const SYSTEM_PRINCIPAL_ALIASES = new Map<string, PlatformSystemAccessPrincipalId>([
  [PLATFORM_ALL_AGENTS_PRINCIPAL_ID, PLATFORM_ALL_AGENTS_PRINCIPAL_ID],
  ["all-agents", PLATFORM_ALL_AGENTS_PRINCIPAL_ID],
  ["system:all-agents", PLATFORM_ALL_AGENTS_PRINCIPAL_ID],
  [
    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  ],
  [
    "all-organization-members",
    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  ],
  [
    "system:all-organization-members",
    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  ],
]);

export const PLATFORM_SYSTEM_ACCESS_PRINCIPALS: readonly PlatformSystemAccessPrincipal[] = [
  {
    id: PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
    name: "All Agents",
    kind: "system",
    locked: true,
    description: "Every agent in this organization",
    roleId: "default",
    roleLabel: "Default",
    createdAt: "",
  },
  {
    id: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
    name: "All Organization Members",
    kind: "system",
    locked: true,
    description: "Every active member of this organization",
    roleId: "default",
    roleLabel: "Default",
    createdAt: "",
  },
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readFirstString(
  sources: readonly Record<string, unknown>[],
  keys: readonly string[],
): string {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

export function getPlatformAccessPrincipalProfileImageUrl(
  value: unknown,
): string {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const sourceProfile = asRecord(source.profile);
  const metadataProfile = asRecord(metadata.profile);
  return readFirstString(
    [source, sourceProfile, metadata, metadataProfile],
    [
      "profileImageUrl",
      "profile_image_url",
      "avatarUrl",
      "avatar_url",
      "photoURL",
      "photoUrl",
      "photo_url",
      "imageUrl",
      "image_url",
      "logoUrl",
      "logo_url",
      "picture",
    ],
  );
}

function formatPlatformAccessPrincipalRoleLabel(value: string): string {
  const normalized = value.trim();
  if (!normalized) return "";
  if (/\s/.test(normalized) || /[A-Z]/.test(normalized.slice(1))) {
    return normalized;
  }
  return normalized
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

/**
 * Resolves the viewer's membership role from the normalized team record and
 * legacy organization-team response shapes. This role describes the current
 * user's place in the team, not the team's policy on the selected resource.
 */
export function getPlatformAccessPrincipalRoleLabel(value: unknown): string {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const membership = asRecord(source.membership);
  const currentMembership = asRecord(source.currentMembership);
  const metadataMembership = asRecord(metadata.membership);
  return formatPlatformAccessPrincipalRoleLabel(
    readFirstString(
      [source, membership, currentMembership, metadata, metadataMembership],
      [
        "roleLabel",
        "role_label",
        "currentUserRoleLabel",
        "current_user_role_label",
        "membershipRoleLabel",
        "membership_role_label",
        "role",
        "roleId",
        "role_id",
        "currentUserRole",
        "current_user_role",
        "membershipRole",
        "membership_role",
      ],
    ),
  );
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

export function normalizePlatformAccessPrincipalId(
  value: unknown,
): string {
  const normalized = String(value || "").trim().toLowerCase();
  return SYSTEM_PRINCIPAL_ALIASES.get(normalized) || String(value || "").trim();
}

export function isPlatformSystemAccessPrincipalId(
  value: unknown,
): value is PlatformSystemAccessPrincipalId {
  const normalized = normalizePlatformAccessPrincipalId(value);
  return (
    normalized === PLATFORM_ALL_AGENTS_PRINCIPAL_ID ||
    normalized === PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID
  );
}

export function isPlatformRoleScopedSystemAccessPrincipalId(
  value: unknown,
): value is typeof PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID {
  return (
    normalizePlatformAccessPrincipalId(value) ===
    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID
  );
}

export function getPlatformSystemAccessPrincipal(
  value: unknown,
): PlatformSystemAccessPrincipal | null {
  const id = normalizePlatformAccessPrincipalId(value);
  return (
    PLATFORM_SYSTEM_ACCESS_PRINCIPALS.find((principal) => principal.id === id) ||
    null
  );
}

export function createPlatformSystemAccessPrincipalRows(): PlatformSystemAccessPrincipal[] {
  return PLATFORM_SYSTEM_ACCESS_PRINCIPALS.map((principal) => ({ ...principal }));
}

export function normalizePlatformResourceAccessControl(
  metadata: unknown,
  subjectType: PlatformPermissionSubjectType,
): PlatformResourceAccessControl {
  const metadataRecord = asRecord(metadata);
  const configured = asRecord(metadataRecord.accessControl);
  const configuredSets = asRecord(configured.systemPrincipalPermissionSets);
  const configuredRoleSets = asRecord(
    configured.systemPrincipalRolePermissionSets,
  );
  const legacyOrganizationMemberPermissionSet =
    metadataRecord.organizationMemberPermissionSet ||
    metadataRecord.organization_member_permission_set;
  const organizationMemberPermissionSet =
    configuredSets[PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID] ||
    configuredSets["all-organization-members"] ||
    configuredSets["system:all-organization-members"] ||
    legacyOrganizationMemberPermissionSet ||
    createPlatformFullAccessPermissionSet(subjectType);

  return {
    version: PLATFORM_RESOURCE_ACCESS_CONTROL_VERSION,
    systemPrincipalPermissionSets: {
      [PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID]:
        normalizePlatformPermissionSet(
          organizationMemberPermissionSet as PlatformPermissionSet,
          subjectType,
        ),
    },
    systemPrincipalRolePermissionSets: Object.entries(configuredRoleSets).reduce<
      PlatformResourceAccessControl["systemPrincipalRolePermissionSets"]
    >((permissionSets, [principalId, rolePermissionSets]) => {
      const normalizedPrincipalId =
        normalizePlatformAccessPrincipalId(principalId);
      if (!isPlatformSystemAccessPrincipalId(normalizedPrincipalId)) {
        return permissionSets;
      }
      permissionSets[normalizedPrincipalId] = {
        ...(asRecord(rolePermissionSets) as Record<
          string,
          PlatformPermissionSet
        >),
      };
      return permissionSets;
    }, {}),
  };
}

export function getPlatformSystemPrincipalPermissionSet(
  metadata: unknown,
  principalId: unknown,
  subjectType: PlatformPermissionSubjectType,
  allAgentsPermissionSet?: PlatformPermissionSet | null,
): PlatformPermissionSet {
  const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
  if (normalizedPrincipalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID) {
    return normalizePlatformPermissionSet(
      allAgentsPermissionSet || asRecord(metadata).permissionSet,
      subjectType,
    );
  }
  const accessControl = normalizePlatformResourceAccessControl(
    metadata,
    subjectType,
  );
  return normalizePlatformPermissionSet(
    accessControl.systemPrincipalPermissionSets[
      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID
    ],
    subjectType,
  );
}

export function buildPlatformSystemPrincipalPermissionMetadata(
  metadata: unknown,
  principalId: unknown,
  permissionSet: PlatformPermissionSet,
  subjectType: PlatformPermissionSubjectType,
): Record<string, unknown> {
  const metadataRecord = asRecord(metadata);
  const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
  const normalizedPermissionSet = normalizePlatformPermissionSet(
    permissionSet,
    subjectType,
  );
  if (normalizedPrincipalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID) {
    return {
      ...metadataRecord,
      permissionSet: normalizedPermissionSet,
    };
  }

  const accessControl = normalizePlatformResourceAccessControl(
    metadataRecord,
    subjectType,
  );
  return {
    ...metadataRecord,
    accessControl: {
      ...accessControl,
      version: PLATFORM_RESOURCE_ACCESS_CONTROL_VERSION,
      systemPrincipalPermissionSets: {
        ...accessControl.systemPrincipalPermissionSets,
        [PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID]:
          normalizedPermissionSet,
      },
    },
    // Kept during the migration window for older clients that do not yet read
    // the versioned access-control envelope.
    organizationMemberPermissionSet: normalizedPermissionSet,
  };
}

export function getPlatformSystemPrincipalRolePermissionSet(
  metadata: unknown,
  principalId: unknown,
  roleId: unknown,
  subjectType: PlatformPermissionSubjectType,
): PlatformPermissionSet {
  const normalizedPrincipalId =
    normalizePlatformAccessPrincipalId(principalId);
  const normalizedRoleId =
    String(roleId || "member")
      .trim()
      .toLowerCase() || "member";
  if (
    !isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId) ||
    normalizedRoleId === "owner"
  ) {
    return createPlatformRolePermissionSet(subjectType, normalizedRoleId);
  }

  const accessControl = asRecord(asRecord(metadata).accessControl);
  const principalRolePermissionSets = asRecord(
    asRecord(accessControl.systemPrincipalRolePermissionSets)[
      normalizedPrincipalId
    ],
  );
  return normalizePlatformRolePermissionSet(
    principalRolePermissionSets[normalizedRoleId],
    subjectType,
    normalizedRoleId,
  );
}

export function buildPlatformSystemPrincipalRolePermissionMetadata(
  metadata: unknown,
  principalId: unknown,
  roleId: unknown,
  permissionSet: PlatformPermissionSet,
  subjectType: PlatformPermissionSubjectType,
): Record<string, unknown> {
  const metadataRecord = asRecord(metadata);
  const normalizedPrincipalId =
    normalizePlatformAccessPrincipalId(principalId);
  const normalizedRoleId =
    String(roleId || "member")
      .trim()
      .toLowerCase() || "member";
  if (
    !isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId) ||
    normalizedRoleId === "owner"
  ) {
    return { ...metadataRecord };
  }

  const configuredAccessControl = asRecord(metadataRecord.accessControl);
  const configuredPermissionSets = asRecord(
    configuredAccessControl.systemPrincipalPermissionSets,
  );
  const configuredRolePermissionSets = asRecord(
    configuredAccessControl.systemPrincipalRolePermissionSets,
  );
  const principalRolePermissionSets = asRecord(
    configuredRolePermissionSets[normalizedPrincipalId],
  );
  const normalizedPermissionSet = normalizePlatformRolePermissionSet(
    permissionSet,
    subjectType,
    normalizedRoleId,
  );

  return {
    ...metadataRecord,
    accessControl: {
      ...configuredAccessControl,
      version: PLATFORM_RESOURCE_ACCESS_CONTROL_VERSION,
      systemPrincipalPermissionSets: {
        ...configuredPermissionSets,
      },
      systemPrincipalRolePermissionSets: {
        ...configuredRolePermissionSets,
        [normalizedPrincipalId]: {
          ...principalRolePermissionSets,
          [normalizedRoleId]: normalizedPermissionSet,
        },
      },
    },
  };
}

export function getPlatformSharedTeamIds(metadata: unknown): string[] {
  const source = asRecord(metadata);
  const teamPermissionSets = asRecord(source.teamPermissionSets);
  const teamRolePermissionSets = asRecord(source.teamRolePermissionSets);
  return Array.from(
    new Set(
      [
        ...readStringArray(source.sharedTeamIds),
        ...readStringArray(source.teamAccessIds),
        ...Object.keys(teamPermissionSets),
        ...Object.keys(teamRolePermissionSets),
      ]
        .map(normalizePlatformAccessPrincipalId)
        .filter((id) => id && !isPlatformSystemAccessPrincipalId(id)),
    ),
  );
}

export function composePlatformAccessPrincipalRows<T extends PlatformAccessPrincipal>(
  teamRows: readonly T[],
): Array<PlatformSystemAccessPrincipal | T> {
  const seen = new Set<string>();
  const normalizedTeams = teamRows.reduce<T[]>((rows, team) => {
    const id = normalizePlatformAccessPrincipalId(team.id);
    if (!id || isPlatformSystemAccessPrincipalId(id) || seen.has(id)) return rows;
    seen.add(id);
    rows.push({ ...team, id, kind: "team" } as T);
    return rows;
  }, []);
  return [...createPlatformSystemAccessPrincipalRows(), ...normalizedTeams];
}
