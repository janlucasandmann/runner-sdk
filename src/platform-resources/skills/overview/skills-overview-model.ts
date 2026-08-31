import type { SkillOverviewRow } from "./skills-overview-page.js";
import {
  formatPlatformResourceUpdatedAt,
  getPlatformResourceUpdatedTimestamp,
} from "../../../platform-ui/formatting/index.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstString(values: readonly unknown[]): string {
  return values.map(asString).find(Boolean) || "";
}

function normalizeSkillIconColor(value: unknown): string {
  const color = asString(value);
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#ffffff";
}

export function normalizeSkillOverviewRows(
  records: readonly unknown[],
): SkillOverviewRow[] {
  return records.flatMap((rawSkill) => {
    const skill = asRecord(rawSkill);
    const id = asString(skill.id)
      || asString(skill.skillId)
      || asString(skill.skill_id);
    if (!id) return [];
    const name = asString(skill.name)
      || asString(skill.label)
      || id;
    const explicitlySystem = skill.isSystem === true
      || skill.isDefault === true
      || asString(skill.source).toLowerCase() === "system";
    const explicitlyCustom = skill.isCustom === true
      || asString(skill.source).toLowerCase() === "custom";
    const metadata = asRecord(skill.metadata);
    const creator = Object.keys(asRecord(skill.creator)).length
      ? asRecord(skill.creator)
      : Object.keys(asRecord(skill.createdBy)).length
        ? asRecord(skill.createdBy)
        : Object.keys(asRecord(metadata.creator)).length
          ? asRecord(metadata.creator)
          : asRecord(metadata.createdBy);
    const owner = Object.keys(asRecord(skill.owner)).length
      ? asRecord(skill.owner)
      : asRecord(metadata.owner);
    const isCustom = explicitlyCustom || !explicitlySystem;
    const creatorName = isCustom
      ? firstString([
          creator.name,
          creator.displayName,
          creator.display_name,
          skill.creatorName,
          skill.creator_name,
          skill.createdByName,
          skill.created_by_name,
          metadata.creatorName,
          metadata.creator_name,
          metadata.createdByName,
          metadata.created_by_name,
        ]) || "You"
      : "Computer Agents";
    const creatorAvatarUrl = isCustom
      ? firstString([
          creator.avatarUrl,
          creator.avatar_url,
          creator.photoUrl,
          creator.photoURL,
          skill.creatorAvatarUrl,
          skill.creator_avatar_url,
          skill.createdByAvatarUrl,
          skill.created_by_avatar_url,
          metadata.creatorAvatarUrl,
          metadata.creator_avatar_url,
          metadata.createdByAvatarUrl,
          metadata.created_by_avatar_url,
        ])
      : "/img/agent-profile-pics/ca-profilepic.jpg";
    const ownerName = isCustom
      ? firstString([
          owner.name,
          owner.displayName,
          owner.display_name,
          skill.ownerName,
          skill.owner_name,
          metadata.ownerName,
          metadata.owner_name,
        ]) || creatorName
      : "Computer Agents";
    const ownerAvatarUrl = isCustom
      ? firstString([
          owner.avatarUrl,
          owner.avatar_url,
          owner.photoUrl,
          owner.photoURL,
          skill.ownerAvatarUrl,
          skill.owner_avatar_url,
          metadata.ownerAvatarUrl,
          metadata.owner_avatar_url,
        ]) || creatorAvatarUrl
      : "/img/agent-profile-pics/ca-profilepic.jpg";
    const parsedUpdatedAt = isCustom
      ? getPlatformResourceUpdatedTimestamp(firstString([
          skill.updatedAt,
          skill.updated_at,
          skill.modifiedAt,
          skill.modified_at,
          skill.createdAt,
          skill.created_at,
        ]))
      : Number.NaN;
    const updatedAt = Number.isFinite(parsedUpdatedAt) ? parsedUpdatedAt : 0;
    return [{
      id,
      name,
      description: asString(skill.description),
      searchText: [
        name,
        asString(skill.description),
        id,
        asString(skill.category),
      ].join(" "),
      isComputerAgents:
        firstString([skill.systemFamilyId, skill.system_family_id, id])
          .toLowerCase() === "computer_agents",
      isActive: skill.isActive !== false && skill.enabled !== false,
      isCustom,
      iconColor: isCustom
        ? normalizeSkillIconColor(metadata.iconColor || metadata.skillIconColor)
        : undefined,
      creatorName,
      creatorAvatarUrl,
      ownerName,
      ownerAvatarUrl,
      updatedAt,
      updatedLabel: formatPlatformResourceUpdatedAt(updatedAt),
      updatedTitle: updatedAt ? new Date(updatedAt).toLocaleString() : "",
    }];
  });
}
