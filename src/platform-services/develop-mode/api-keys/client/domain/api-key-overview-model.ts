import type { DevelopApiKeyOverviewRow } from "./api-key-overview-types.js";

type UnknownRecord = Record<string, unknown>;

const SCOPE_PRESETS = Object.freeze([
  {
    label: "Full Access",
    permissions: ["*"],
  },
  {
    label: "Execute Only",
    permissions: ["threads:read", "threads:write", "execute"],
  },
  {
    label: "Read Only",
    permissions: ["projects:read", "threads:read", "security:read", "evidence:read", "billing:read"],
  },
]);

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(timestamp: number, emptyLabel: string): string {
  if (!timestamp) return emptyLabel;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(timestamp);
}

function getInitials(value: string): string {
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")
    || "—";
}

function getPermissionsLabel(value: unknown): string {
  const permissions = Array.isArray(value)
    ? value.map(asString).filter(Boolean)
    : [];
  const preset = SCOPE_PRESETS.find((candidate) => (
    candidate.permissions.length === permissions.length
    && candidate.permissions.every((permission) => (
      permissions.includes(permission)
    ))
  ));
  if (preset) return preset.label;
  return permissions.length ? "Custom" : "Default";
}

function isSystemManaged(record: UnknownRecord): boolean {
  const metadata = asRecord(record.metadata);
  return (
    record.isCurrentDefault === true
    || metadata.isDefault === true
    || asString(metadata.createdBy).includes("provisioner")
  );
}

function getCreator(record: UnknownRecord, systemManaged: boolean) {
  if (systemManaged) {
    return {
      name: "Computer Agents",
      avatarUrl: "/img/logos/agentsappicon.png",
      fallback: "CA",
    };
  }
  const metadata = asRecord(record.metadata);
  const nested = asRecord(
    record.creator
      || (typeof record.createdBy === "object" ? record.createdBy : null)
      || metadata.creator
      || (typeof metadata.createdBy === "object" ? metadata.createdBy : null),
  );
  const name = asString(
    nested.name
      || nested.displayName
      || nested.display_name
      || record.creatorName
      || record.creator_name
      || record.createdByName
      || record.created_by_name
      || metadata.creatorName
      || metadata.creator_name
      || metadata.userName
      || record.createdByLabel
      || metadata.userEmail,
  ) || "Account";
  const avatarUrl = asString(
    nested.avatarUrl
      || nested.avatar_url
      || nested.photoUrl
      || nested.photoURL
      || record.creatorAvatarUrl
      || record.creator_avatar_url
      || metadata.creatorAvatarUrl
      || metadata.creator_avatar_url
      || metadata.photoURL,
  );
  return {
    name,
    avatarUrl,
    fallback: getInitials(name),
  };
}

export function normalizeApiKeyOverviewRows(
  records: readonly unknown[],
): DevelopApiKeyOverviewRow[] {
  return records.flatMap((value) => {
    const record = asRecord(value);
    const id = asString(record.id);
    if (
      !id
      || record.isActive === false
      || Boolean(asString(record.revokedAt))
    ) {
      return [];
    }
    const standard = isSystemManaged(record);
    const creator = getCreator(record, standard);
    const createdAt = readTimestamp(record.createdAt || record.created_at);
    const lastUsedAt = readTimestamp(
      record.lastUsedAt || record.last_used_at,
    );
    const name = asString(record.name) || "API Key";
    const keyPrefix = asString(record.keyPrefix || record.key_prefix) || "key";
    const permissionsLabel = getPermissionsLabel(record.permissions);
    return [{
      id,
      name,
      keyPrefix,
      createdAt,
      createdLabel: formatDate(createdAt, "—"),
      lastUsedAt,
      lastUsedLabel: formatDate(lastUsedAt, "Never"),
      creatorName: creator.name,
      ...(creator.avatarUrl ? { creatorAvatarUrl: creator.avatarUrl } : {}),
      creatorFallback: creator.fallback,
      permissionsLabel,
      isStandard: standard,
      canRevoke: record.canRevoke !== false,
      searchText: [
        name,
        keyPrefix,
        creator.name,
        permissionsLabel,
        standard ? "standard default" : "scoped custom",
      ].join(" "),
    }];
  });
}
