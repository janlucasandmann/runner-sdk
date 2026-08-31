import type {
  TestTargetType,
  TestWorkspaceLinkedResource,
  TestWorkspaceResourceOption,
} from "./test-types.js";

const TARGET_RESOURCE_TYPES: Readonly<Record<TestTargetType, ReadonlySet<string>>> = {
  function: new Set(["function"]),
  workflow: new Set(["workflow", "metronome", "metronome_workflow"]),
  web_app: new Set(["web_app", "webapp"]),
  repository: new Set(["repository", "security_repository", "github_repository"]),
  agent: new Set(["agent", "agent_runtime"]),
  project: new Set(["project"]),
  custom: new Set(),
};

function normalizeResourceType(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function resourceMatchesTarget(
  resource: TestWorkspaceLinkedResource,
  targetType: TestTargetType,
  targetId: string,
): boolean {
  return resource.id === targetId
    && TARGET_RESOURCE_TYPES[targetType].has(normalizeResourceType(resource.type));
}

export interface InferTestTargetProjectIdInput {
  targetType: TestTargetType;
  targetId: string | null | undefined;
  targetResource?: TestWorkspaceResourceOption | null;
  projects: readonly TestWorkspaceResourceOption[];
  preferredProjectId?: string | null;
}

/**
 * Resolves Test project context from the protected resource. Direct resource
 * scope is authoritative; Project-linked resources provide the compatibility
 * path for resources attached through a Project's Resources tab.
 */
export function inferTestTargetProjectId({
  targetType,
  targetId,
  targetResource,
  projects,
  preferredProjectId,
}: InferTestTargetProjectIdInput): string | null {
  const normalizedTargetId = String(targetId || "").trim();
  if (targetType === "project") return normalizedTargetId || null;
  if (targetType === "custom" || !normalizedTargetId) return null;

  const candidates: string[] = [];
  const addCandidate = (value: unknown) => {
    const projectId = String(value || "").trim();
    if (projectId && !candidates.includes(projectId)) candidates.push(projectId);
  };

  for (const projectId of targetResource?.projectIds || []) addCandidate(projectId);
  for (const project of projects) {
    if ((project.linkedResources || []).some((resource) => (
      resourceMatchesTarget(resource, targetType, normalizedTargetId)
    ))) {
      addCandidate(project.id);
    }
  }

  const preferred = String(preferredProjectId || "").trim();
  return (preferred && candidates.includes(preferred) ? preferred : candidates[0]) || null;
}
