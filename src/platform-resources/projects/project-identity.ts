import { normalizePlatformProjectIconId } from "./project-identity-icon.js";

export interface PlatformProjectIdentity {
  id: string;
  name: string;
  icon: string;
  color: string;
  projectType: string;
}

export interface PlatformProjectReference {
  projectId: string;
  projectName: string;
  projectIcon: string;
  projectColor: string;
  projectType: string;
}

const PROJECT_TYPE_VISUAL_DEFAULTS: Readonly<Record<string, { icon: string; color: string }>> = {
  blank: { icon: "emoji:🚀", color: "#5f6bdc" },
  software_development: { icon: "code", color: "#66a6ff" },
  research_knowledge: { icon: "telescope", color: "#8d83ff" },
  marketing_campaign: { icon: "sparkles", color: "#f67ab7" },
  business_operations: { icon: "layout-grid", color: "#55d8a5" },
  finance_analysis: { icon: "calculator", color: "#f4b85f" },
  customer_sales: { icon: "users", color: "#79d0ff" },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readString(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function normalizeProjectColor(value: unknown, fallback = "#79d0ff") {
  const normalized = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
}

export function getPlatformProjectReferenceFromKnowledgeMetadata(
  value: unknown,
): PlatformProjectReference | null {
  const metadata = asRecord(value);
  const projectId = readString(metadata, ["projectId", "project_id"]);
  // Project ownership is defined by the durable project reference itself. Do
  // not make visual identity depend on a purpose enum: legacy libraries and
  // future project-owned library types may use a different or missing purpose.
  if (!projectId) return null;
  const projectType = readString(metadata, ["projectType", "project_type", "blueprintId"]);
  const defaults = PROJECT_TYPE_VISUAL_DEFAULTS[projectType] || PROJECT_TYPE_VISUAL_DEFAULTS.blank;
  return {
    projectId,
    projectName: readString(metadata, ["projectName", "project_name"]),
    projectIcon: normalizePlatformProjectIconId(
      readString(metadata, ["projectIcon", "project_icon"]) || defaults.icon,
    ),
    projectColor: normalizeProjectColor(
      readString(metadata, ["projectColor", "project_color"]),
      defaults.color,
    ),
    projectType,
  };
}

export function normalizePlatformProjectIdentity(
  value: unknown,
  fallback?: PlatformProjectReference | null,
): PlatformProjectIdentity | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const id = readString(source, ["id", "projectId", "project_id"])
    || fallback?.projectId
    || "";
  if (!id) return null;
  const projectType = readString(source, ["projectType", "type"])
    || readString(metadata, ["projectType", "type", "blueprintId"])
    || fallback?.projectType
    || "blank";
  const defaults = PROJECT_TYPE_VISUAL_DEFAULTS[projectType] || PROJECT_TYPE_VISUAL_DEFAULTS.blank;
  const icon = readString(source, ["icon"])
    || readString(metadata, ["icon"])
    || fallback?.projectIcon
    || defaults.icon;
  const color = readString(source, ["color"])
    || readString(metadata, ["color"])
    || fallback?.projectColor
    || defaults.color;
  return {
    id,
    name: readString(source, ["name", "title"])
      || fallback?.projectName
      || "Project",
    icon: normalizePlatformProjectIconId(icon),
    color: normalizeProjectColor(color, defaults.color),
    projectType,
  };
}

export function createPlatformProjectIdentityFallback(
  reference: PlatformProjectReference | null,
): PlatformProjectIdentity | null {
  if (!reference) return null;
  return normalizePlatformProjectIdentity({}, reference);
}
