import { getPlatformAccessPrincipalProfileImageUrl } from "../../../../../platform-resources/access-control/domain/access-principals.js";
import {
  createPlatformRolePermissionSet,
  normalizePlatformRolePermissionSet,
  type PlatformPermissionSet,
} from "../../../../../platform-ui/pages/permissions/index.js";
import {
  normalizeDevelopResourceIdentity,
  type DevelopResourceIdentity,
  type DevelopResourceIdentityInput,
} from "../../../shared/client/domain/index.js";
import type { SecurityRepository } from "./security-types.js";

export type SecurityTeamRoleId = "owner" | "member" | "contributor" | "admin";

export interface SecurityTeamRoleDefinition {
  id: SecurityTeamRoleId;
  label: string;
  description: string;
}

export interface SecurityWorkspaceTeam {
  id: string;
  name: string;
  profileImageUrl?: string;
  roleId: SecurityTeamRoleId;
  roleLabel: string;
  createdAt: string;
  memberCount?: number;
}

export interface SecurityRepositoryOwnerCandidate extends DevelopResourceIdentity {
  teamNames: string[];
}

export type SecurityTeamRolePermissionSets = Record<
  SecurityTeamRoleId,
  PlatformPermissionSet
>;

export interface SecurityTeamResourceShare {
  id: string;
  teamId: string;
  resourceType: "security_repository";
  resourceId: string;
  accessLevel: "use" | "edit" | "manage";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const SECURITY_TEAM_ROLE_DEFINITIONS: readonly SecurityTeamRoleDefinition[] =
  [
    {
      id: "owner",
      label: "Owner",
      description:
        "Has permanent full control of repository security, access, and publication decisions.",
    },
    {
      id: "member",
      label: "Member",
      description:
        "Can review shared security work, with elevated operations routed through approval.",
    },
    {
      id: "contributor",
      label: "Contributor",
      description:
        "Can run scans and triage findings while administrative and publication controls remain protected.",
    },
    {
      id: "admin",
      label: "Admin",
      description:
        "Can manage repository security, team access, policies, and protected decisions.",
    },
  ] as const;

const SECURITY_TEAM_ROLE_IDS = new Set<SecurityTeamRoleId>(
  SECURITY_TEAM_ROLE_DEFINITIONS.map((role) => role.id),
);

const LEGACY_TEAM_ROLE_MAP: Readonly<Record<string, SecurityTeamRoleId>> = {
  create: "member",
  member: "member",
  viewer: "member",
  configure: "contributor",
  develop: "contributor",
  contributor: "contributor",
  editor: "contributor",
  admin: "admin",
  owner: "owner",
  manage: "admin",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(
  source: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = String(source[key] || "").trim();
    if (value) return value;
  }
  return "";
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

const SECURITY_OWNER_NESTED_IDENTITY_KEYS = [
  "user",
  "profile",
  "authProfile",
  "auth_profile",
  "account",
  "member",
  "identity",
  "userProfile",
  "user_profile",
  "accountProfile",
  "account_profile",
  "publicProfile",
  "public_profile",
] as const;

function getSecurityOwnerIdentitySources(value: unknown): {
  source: Record<string, unknown>;
  nested: Record<string, unknown>[];
  all: Record<string, unknown>[];
} {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const nested = SECURITY_OWNER_NESTED_IDENTITY_KEYS.flatMap((key) => {
    const direct = asRecord(source[key]);
    const metadataValue = asRecord(metadata[key]);
    return [direct, metadataValue].filter(
      (candidate) => Object.keys(candidate).length > 0,
    );
  });
  return {
    source,
    nested,
    all: [...nested, source, metadata],
  };
}

function readSecurityOwnerString(
  sources: readonly Record<string, unknown>[],
  keys: readonly string[],
): string {
  for (const source of sources) {
    const value = readString(source, keys);
    if (value) return value;
  }
  return "";
}

export function normalizeSecurityRepositoryOwnerCandidate(
  value: unknown,
): SecurityRepositoryOwnerCandidate | null {
  const { source, nested, all } = getSecurityOwnerIdentitySources(value);
  const status = readSecurityOwnerString(
    [source],
    ["status", "membershipStatus", "membership_status"],
  ).toLowerCase();
  if (status === "removed" || status === "revoked") return null;

  const email = readSecurityOwnerString(all, [
    "email",
    "emailAddress",
    "email_address",
    "mail",
  ]).toLowerCase();
  const userId =
    readSecurityOwnerString(all, [
      "userId",
      "user_id",
      "uid",
      "accountId",
      "account_id",
      "localId",
      "local_id",
    ]) || readSecurityOwnerString(nested, ["id"]);
  const id =
    userId ||
    email ||
    readSecurityOwnerString(all, [
      "ownerId",
      "owner_id",
      "id",
      "memberId",
      "member_id",
    ]);
  const firstName = readSecurityOwnerString(all, ["firstName", "first_name"]);
  const lastName = readSecurityOwnerString(all, ["lastName", "last_name"]);
  const name =
    readSecurityOwnerString(all, [
      "name",
      "displayName",
      "display_name",
      "fullName",
      "full_name",
      "username",
      "login",
    ]) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    email ||
    userId ||
    id;
  const avatarUrl = readSecurityOwnerString(all, [
    "avatarUrl",
    "avatar_url",
    "photoUrl",
    "photoURL",
    "photo_url",
    "imageUrl",
    "imageURL",
    "image_url",
    "picture",
  ]);
  if (!id && !userId && !email && !name) return null;

  const identity = normalizeDevelopResourceIdentity({
    id,
    userId,
    name,
    email,
    avatarUrl,
  });
  if (
    !identity.id &&
    !identity.userId &&
    !identity.email &&
    (!identity.name || identity.name === "Unknown")
  ) {
    return null;
  }

  const teamNames = Array.from(
    new Set(
      [
        ...readStringArray(source.teamNames),
        ...readStringArray(source.team_names),
        readString(source, ["teamName", "team_name"]),
      ].filter(Boolean),
    ),
  );
  return { ...identity, teamNames };
}

export function getSecurityRepositoryOwnerIdentityKeys(
  value: unknown,
): string[] {
  const identity = normalizeSecurityRepositoryOwnerCandidate(value);
  if (!identity) return [];
  return Array.from(
    new Set(
      [identity.userId, identity.email, identity.id]
        .map((candidate) =>
          String(candidate || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  );
}

export function getSecurityRepositoryOwnerCandidateKey(value: unknown): string {
  const identity = normalizeSecurityRepositoryOwnerCandidate(value);
  if (!identity) return "";
  return (
    getSecurityRepositoryOwnerIdentityKeys(identity)[0] ||
    String(identity.name || "")
      .trim()
      .toLowerCase()
  );
}

export function mergeSecurityRepositoryOwnerCandidates(
  values: readonly unknown[],
): SecurityRepositoryOwnerCandidate[] {
  const candidates: SecurityRepositoryOwnerCandidate[] = [];
  values.forEach((value) => {
    const candidate = normalizeSecurityRepositoryOwnerCandidate(value);
    if (!candidate || !getSecurityRepositoryOwnerCandidateKey(candidate))
      return;
    const candidateKeys = new Set(
      getSecurityRepositoryOwnerIdentityKeys(candidate),
    );
    const existingIndex = candidates.findIndex((existing) =>
      getSecurityRepositoryOwnerIdentityKeys(existing).some((key) =>
        candidateKeys.has(key),
      ),
    );
    if (existingIndex < 0) {
      candidates.push(candidate);
      return;
    }
    const existing = candidates[existingIndex];
    if (!existing) return;
    const userId = existing.userId || candidate.userId;
    const email = existing.email || candidate.email;
    candidates[existingIndex] = {
      ...existing,
      id: userId || existing.id || candidate.id || email,
      userId,
      name:
        existing.name && existing.name !== "Unknown"
          ? existing.name
          : candidate.name,
      email,
      avatarUrl: existing.avatarUrl || candidate.avatarUrl,
      teamNames: Array.from(
        new Set([...existing.teamNames, ...candidate.teamNames]),
      ),
    };
  });
  return candidates.sort((left, right) =>
    (left.name || left.email).localeCompare(right.name || right.email),
  );
}

export function buildSecurityRepositoryOwnerMetadata(
  repository: Pick<SecurityRepository, "metadata">,
  value: DevelopResourceIdentityInput,
): Record<string, unknown> {
  const owner = normalizeSecurityRepositoryOwnerCandidate(value);
  if (!owner) return getSecurityRepositoryAccessMetadata(repository);
  const identity: DevelopResourceIdentity = {
    type: "user",
    id: owner.id,
    userId: owner.userId,
    name: owner.name,
    email: owner.email,
    avatarUrl: owner.avatarUrl,
  };
  return {
    ...getSecurityRepositoryAccessMetadata(repository),
    owner: identity,
    ownerId: identity.id,
    owner_id: identity.id,
    ownerUserId: identity.userId,
    owner_user_id: identity.userId,
    ownerName: identity.name,
    owner_name: identity.name,
    ownerEmail: identity.email,
    owner_email: identity.email,
    ownerAvatarUrl: identity.avatarUrl,
    owner_avatar_url: identity.avatarUrl,
  };
}

export function normalizeSecurityTeamRoleId(
  value: unknown,
  fallback: SecurityTeamRoleId = "member",
): SecurityTeamRoleId {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  const mapped = LEGACY_TEAM_ROLE_MAP[normalized] || normalized;
  return SECURITY_TEAM_ROLE_IDS.has(mapped as SecurityTeamRoleId)
    ? (mapped as SecurityTeamRoleId)
    : fallback;
}

export function normalizeSecurityWorkspaceTeam(
  value: unknown,
): SecurityWorkspaceTeam | null {
  const source = asRecord(value);
  const id = readString(source, ["id", "teamId", "team_id"]);
  if (!id) return null;
  const name =
    readString(source, ["name", "title", "displayName", "display_name"]) ||
    "Team";
  const roleId = normalizeSecurityTeamRoleId(
    readString(source, [
      "roleId",
      "role",
      "membershipRole",
      "membership_role",
      "currentUserRole",
      "current_user_role",
    ]),
    "admin",
  );
  const createdAt = readString(source, ["createdAt", "created_at"]);
  const memberCountValue = Number(source.memberCount ?? source.member_count);
  const profileImageUrl = getPlatformAccessPrincipalProfileImageUrl(source);
  return {
    id,
    name,
    ...(profileImageUrl ? { profileImageUrl } : {}),
    roleId,
    roleLabel: roleId.charAt(0).toUpperCase() + roleId.slice(1),
    createdAt,
    ...(Number.isFinite(memberCountValue)
      ? { memberCount: Math.max(0, memberCountValue) }
      : {}),
  };
}

export function getSecurityRepositoryAccessMetadata(
  repository: Pick<SecurityRepository, "metadata">,
): Record<string, unknown> {
  return asRecord(repository.metadata);
}

function getTeamPermissionSetsMap(
  repository: Pick<SecurityRepository, "metadata">,
): Record<string, unknown> {
  return asRecord(
    getSecurityRepositoryAccessMetadata(repository).teamPermissionSets,
  );
}

export function getSecurityRepositoryTeamRolePermissionSetsMap(
  repository: Pick<SecurityRepository, "metadata">,
): Record<string, unknown> {
  return asRecord(
    getSecurityRepositoryAccessMetadata(repository).teamRolePermissionSets,
  );
}

export function getSecurityRepositorySharedTeamIds(
  repository: Pick<SecurityRepository, "metadata">,
): string[] {
  const metadata = getSecurityRepositoryAccessMetadata(repository);
  const teamPermissionSets = getTeamPermissionSetsMap(repository);
  const teamRolePermissionSets =
    getSecurityRepositoryTeamRolePermissionSetsMap(repository);
  return Array.from(
    new Set(
      [
        ...readStringArray(metadata.sharedTeamIds),
        ...readStringArray(metadata.teamAccessIds),
        ...Object.keys(teamPermissionSets),
        ...Object.keys(teamRolePermissionSets),
      ]
        .map((teamId) => teamId.trim())
        .filter(Boolean),
    ),
  );
}

export function getSecurityRepositoryTeamRolePermissionSets(
  repository: Pick<SecurityRepository, "metadata">,
  teamId: string,
): SecurityTeamRolePermissionSets {
  const normalizedTeamId = String(teamId || "").trim();
  const configured = asRecord(
    getSecurityRepositoryTeamRolePermissionSetsMap(repository)[
      normalizedTeamId
    ],
  );
  const legacyPermissionSet =
    getTeamPermissionSetsMap(repository)[normalizedTeamId];
  return SECURITY_TEAM_ROLE_DEFINITIONS.reduce<SecurityTeamRolePermissionSets>(
    (result, role) => {
      result[role.id] = normalizePlatformRolePermissionSet(
        configured[role.id] || legacyPermissionSet,
        "security_repository",
        role.id,
      );
      return result;
    },
    {} as SecurityTeamRolePermissionSets,
  );
}

export function getSecurityRepositoryTeamRolePermissionSet(
  repository: Pick<SecurityRepository, "metadata">,
  teamId: string,
  roleId: SecurityTeamRoleId,
): PlatformPermissionSet {
  return getSecurityRepositoryTeamRolePermissionSets(repository, teamId)[
    normalizeSecurityTeamRoleId(roleId)
  ];
}

export function buildSecurityRepositoryTeamAccessMetadata(
  repository: Pick<SecurityRepository, "metadata">,
  teamId: string,
  shouldInclude: boolean,
): Record<string, unknown> {
  const normalizedTeamId = String(teamId || "").trim();
  if (!normalizedTeamId) return getSecurityRepositoryAccessMetadata(repository);
  const metadata = getSecurityRepositoryAccessMetadata(repository);
  const teamPermissionSets = { ...getTeamPermissionSetsMap(repository) };
  const teamRolePermissionSets = {
    ...getSecurityRepositoryTeamRolePermissionSetsMap(repository),
  };
  const teamIds = getSecurityRepositorySharedTeamIds(repository).filter(
    (id) => id !== normalizedTeamId,
  );
  if (shouldInclude) {
    teamIds.push(normalizedTeamId);
    const rolePermissionSets = getSecurityRepositoryTeamRolePermissionSets(
      repository,
      normalizedTeamId,
    );
    teamPermissionSets[normalizedTeamId] = rolePermissionSets.member;
    teamRolePermissionSets[normalizedTeamId] = rolePermissionSets;
  } else {
    delete teamPermissionSets[normalizedTeamId];
    delete teamRolePermissionSets[normalizedTeamId];
  }
  const uniqueTeamIds = Array.from(new Set(teamIds));
  return {
    ...metadata,
    sharedTeamIds: uniqueTeamIds,
    teamAccessIds: uniqueTeamIds,
    teamPermissionSets,
    teamRolePermissionSets,
  };
}

export function buildSecurityRepositoryTeamRolePermissionMetadata(
  repository: Pick<SecurityRepository, "metadata">,
  teamId: string,
  roleId: SecurityTeamRoleId,
  permissionSet: PlatformPermissionSet,
): Record<string, unknown> {
  const normalizedTeamId = String(teamId || "").trim();
  if (!normalizedTeamId) return getSecurityRepositoryAccessMetadata(repository);
  const normalizedRoleId = normalizeSecurityTeamRoleId(roleId);
  const metadata = buildSecurityRepositoryTeamAccessMetadata(
    repository,
    normalizedTeamId,
    true,
  );
  const rolePermissionSetsMap = asRecord(metadata.teamRolePermissionSets);
  const currentRolePermissionSets = getSecurityRepositoryTeamRolePermissionSets(
    { metadata },
    normalizedTeamId,
  );
  const nextRolePermissionSets: SecurityTeamRolePermissionSets = {
    ...currentRolePermissionSets,
    [normalizedRoleId]: normalizePlatformRolePermissionSet(
      permissionSet ||
        createPlatformRolePermissionSet(
          "security_repository",
          normalizedRoleId,
        ),
      "security_repository",
      normalizedRoleId,
    ),
  };
  const teamPermissionSets = asRecord(metadata.teamPermissionSets);
  return {
    ...metadata,
    teamPermissionSets: {
      ...teamPermissionSets,
      [normalizedTeamId]: nextRolePermissionSets.member,
    },
    teamRolePermissionSets: {
      ...rolePermissionSetsMap,
      [normalizedTeamId]: nextRolePermissionSets,
    },
  };
}

export function buildSecurityTeamResourceShareMetadata(
  repository: Pick<SecurityRepository, "id" | "fullName" | "metadata">,
  teamId: string,
  teamName: string,
): Record<string, unknown> {
  return {
    resourceType: "security_repository",
    resourceKind: "security_repository",
    resourceName: repository.fullName,
    sharedTeamId: String(teamId || "").trim(),
    sharedTeamName: String(teamName || "").trim(),
    rolePermissionSets: getSecurityRepositoryTeamRolePermissionSets(
      repository,
      teamId,
    ),
  };
}
