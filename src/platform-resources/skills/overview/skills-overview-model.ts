import type { SkillOverviewRow } from "./skills-overview-page.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
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
    const updatedValue = asString(skill.updatedAt)
      || asString(skill.updated_at)
      || asString(skill.createdAt)
      || asString(skill.created_at);
    const isCustom = explicitlyCustom || !explicitlySystem;
    return [{
      id,
      name,
      searchText: [
        name,
        asString(skill.description),
        id,
        asString(skill.category),
      ].join(" "),
      isActive: skill.isActive !== false && skill.enabled !== false,
      isCustom,
      updatedAt: parseTimestamp(updatedValue),
      updatedLabel: updatedValue
        ? formatDate(updatedValue)
        : isCustom ? "Recently" : "System",
      updatedTitle: updatedValue,
    }];
  });
}
