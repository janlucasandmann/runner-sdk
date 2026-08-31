import type { PlatformProjectIdentity } from "./project-identity.js";

export const PLATFORM_PROJECT_SCOPE_SCHEMA_VERSION = "computer_agents_project_scope_v1" as const;

const PLATFORM_PROJECT_STRATEGY_KNOWLEDGE_PURPOSES = new Set([
  "project_knowledge",
  "project_strategy_and_documentation",
]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

export function getPlatformResourceProjectScopeIds(value: unknown): string[] {
  const metadata = asRecord(value);
  const projectScope = asRecord(metadata.projectScope || metadata.project_scope);
  const scopedIds = normalizeIds(projectScope.projectIds || projectScope.project_ids);
  if (scopedIds.length) return scopedIds;
  const rootIds = normalizeIds(metadata.projectIds || metadata.project_ids);
  if (rootIds.length) return rootIds;
  const legacyProjectId = String(metadata.projectId || metadata.project_id || "").trim();
  return legacyProjectId ? [legacyProjectId] : [];
}

/**
 * Strategy Knowledge libraries are lifecycle-owned by their Project. Their
 * Project scope is therefore descriptive, not user-editable.
 */
export function isPlatformProjectStrategyKnowledgeMetadata(value: unknown): boolean {
  const metadata = asRecord(value);
  const purpose = String(metadata.purpose || "")
    .trim()
    .toLowerCase();
  if (PLATFORM_PROJECT_STRATEGY_KNOWLEDGE_PURPOSES.has(purpose)) return true;
  return (
    metadata.isStrategyKnowledge === true ||
    (String(metadata.schemaVersion || metadata.schema_version || "").trim() ===
      "computer_agents_project_knowledge_v1" &&
      String(metadata.managedBy || metadata.managed_by || "")
        .trim()
        .toLowerCase() === "mission_control")
  );
}

/**
 * Persists the multi-project scope contract while retaining the first project
 * in legacy identity fields for older project-aware services.
 */
export function withPlatformResourceProjectScope(
  value: unknown,
  projects: readonly PlatformProjectIdentity[],
): Record<string, unknown> {
  const metadata = { ...asRecord(value) };
  const normalizedProjects = [
    ...new Map(
      projects
        .filter((project) => String(project.id || "").trim())
        .map((project) => [String(project.id).trim(), project]),
    ).values(),
  ];
  const projectIds = normalizedProjects.map((project) => project.id);

  metadata.projectScope = {
    schemaVersion: PLATFORM_PROJECT_SCOPE_SCHEMA_VERSION,
    projectIds,
  };
  metadata.projectIds = projectIds;
  delete metadata.project_ids;

  const primaryProject = normalizedProjects[0];
  if (!primaryProject) {
    for (const key of [
      "projectId",
      "project_id",
      "projectName",
      "project_name",
      "projectIcon",
      "project_icon",
      "projectColor",
      "project_color",
      "projectType",
      "project_type",
    ]) {
      delete metadata[key];
    }
    return metadata;
  }

  metadata.projectId = primaryProject.id;
  metadata.projectName = primaryProject.name;
  metadata.projectIcon = primaryProject.icon;
  metadata.projectColor = primaryProject.color;
  metadata.projectType = primaryProject.projectType;
  return metadata;
}
