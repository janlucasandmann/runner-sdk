import {
  PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  PLATFORM_PERMISSION_RING_DEFINITIONS,
  type PlatformPermissionSubjectType,
} from "./permission-catalog.js";
import {
  createPlatformDefaultPermissionSet,
  createPlatformFullAccessPermissionSet,
  isPlatformPermissionRecord,
  normalizePlatformPermissionSet,
} from "./permission-policy.js";
import type {
  PlatformPermissionAccess,
  PlatformPermissionSet,
} from "./permission-types.js";

export type PlatformPermissionRoleId =
  | "owner"
  | "admin"
  | "contributor"
  | "developer"
  | "member"
  | "billing"
  | "viewer"
  | string;

function getSubjectActionIds(subjectType: PlatformPermissionSubjectType): string[] {
  return PLATFORM_PERMISSION_ACTION_DEFINITIONS
    .filter((action) => action.subjectTypes?.includes(subjectType))
    .map((action) => action.id);
}

function setRingAccess(
  permissionSet: PlatformPermissionSet,
  ringId: string,
  access: PlatformPermissionAccess,
): void {
  permissionSet.rings = {
    ...(permissionSet.rings || {}),
    [ringId]: {
      ...(typeof permissionSet.rings?.[ringId] === "object" ? permissionSet.rings[ringId] : {}),
      defaultAccess: access,
    },
  };
}

function getConfiguredRingAccess(
  permissionSet: PlatformPermissionSet,
  ringId: string,
): PlatformPermissionAccess {
  const policy = permissionSet.rings?.[ringId];
  if (typeof policy === "string") return policy;
  return policy?.defaultAccess
    || PLATFORM_PERMISSION_RING_DEFINITIONS.find((ring) => ring.id === ringId)?.defaultAccess
    || "full_access";
}

function setActionAccess(
  permissionSet: PlatformPermissionSet,
  actionId: string,
  access: PlatformPermissionAccess,
): void {
  const action = PLATFORM_PERMISSION_ACTION_DEFINITIONS.find((candidate) => candidate.id === actionId);
  if (!action) return;
  const currentPolicy = permissionSet.actions?.[action.id];
  const ringId = typeof currentPolicy === "object" && currentPolicy?.ringId
    ? currentPolicy.ringId
    : action.ringId;
  const nextPolicy = { ringId } as { ringId: string; access?: PlatformPermissionAccess };
  if (access !== getConfiguredRingAccess(permissionSet, ringId)) nextPolicy.access = access;
  permissionSet.actions = {
    ...(permissionSet.actions || {}),
    [action.id]: nextPolicy,
  };
}

function applyAccess(
  permissionSet: PlatformPermissionSet,
  actionIds: readonly string[],
  access: PlatformPermissionAccess,
): void {
  actionIds.forEach((actionId) => setActionAccess(permissionSet, actionId, access));
}

function createAdminPermissionSet(subjectType: PlatformPermissionSubjectType): PlatformPermissionSet {
  const permissionSet = createPlatformFullAccessPermissionSet(subjectType);
  permissionSet.subjectType = subjectType;
  return permissionSet;
}

function createTeamRolePermissionSet(
  subjectType: "team" | "team_role",
  roleId: string,
): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet(subjectType);
  const permissionSet = createPlatformDefaultPermissionSet(subjectType);
  setRingAccess(permissionSet, "ring_1", roleId === "contributor" ? "full_access" : "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  setActionAccess(permissionSet, "team_workspace_view", roleId === "contributor" ? "full_access" : "read_only");
  setActionAccess(permissionSet, "team_shared_resource_manage", "ask_for_permission");
  applyAccess(permissionSet, [
    "team_member_invite",
    "team_member_remove",
    "team_role_update",
    "team_permission_request_review",
    "team_settings_update",
    "team_role_permissions_manage",
    "team_delete",
  ], "no_access");
  return permissionSet;
}

function createProjectRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet("project_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("project_team_role");
  const actionIds = getSubjectActionIds("project_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "no_access");
    applyAccess(permissionSet, actionIds.filter((id) => !id.endsWith("_access_manage") && !id.endsWith("_delete")), "full_access");
    applyAccess(permissionSet, ["project_access_manage", "project_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, actionIds.filter((id) => id.endsWith("_view")), "read_only");
  applyAccess(permissionSet, ["project_threads_create", "project_issues_manage"], "ask_for_permission");
  applyAccess(permissionSet, actionIds.filter((id) => !id.endsWith("_view") && !["project_threads_create", "project_issues_manage"].includes(id)), "no_access");
  return permissionSet;
}

function createOrganizationRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet("organization_role");
  const permissionSet = createPlatformDefaultPermissionSet("organization_role");
  const actionIds = getSubjectActionIds("organization_role");
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", roleId === "developer" ? "full_access" : "no_access");
  setRingAccess(permissionSet, "ring_3", roleId === "billing" ? "ask_for_permission" : "no_access");
  applyAccess(permissionSet, actionIds, "no_access");
  setActionAccess(permissionSet, "organization_workspace_view", "read_only");
  if (roleId === "developer") {
    setActionAccess(permissionSet, "organization_resource_manage", "full_access");
    setActionAccess(permissionSet, "organization_team_manage", "full_access");
  } else if (roleId === "member") {
    setActionAccess(permissionSet, "organization_resource_manage", "ask_for_permission");
  } else if (roleId === "billing") {
    setActionAccess(permissionSet, "organization_billing_manage", "full_access");
  }
  return permissionSet;
}

function createDatabaseRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet("database");
  const permissionSet = createPlatformDefaultPermissionSet("database");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(permissionSet, [
      "database_schema_read",
      "database_data_read",
      "database_query",
      "database_export",
      "database_document_create",
      "database_document_update",
    ], "full_access");
    applyAccess(permissionSet, ["database_connections_manage", "database_document_delete", "database_schema_manage"], "ask_for_permission");
    applyAccess(permissionSet, ["database_access_manage", "database_owner_transfer", "database_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, ["database_schema_read", "database_data_read", "database_query"], "read_only");
  applyAccess(permissionSet, ["database_export", "database_document_create", "database_document_update"], "ask_for_permission");
  applyAccess(permissionSet, [
    "database_connections_manage",
    "database_document_delete",
    "database_schema_manage",
    "database_access_manage",
    "database_owner_transfer",
    "database_delete",
  ], "no_access");
  return permissionSet;
}

function createManagedResourceRolePermissionSet(
  subjectType: PlatformPermissionSubjectType,
  roleId: string,
): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet(subjectType);
  const permissionSet = createPlatformDefaultPermissionSet(subjectType);
  const actionIds = getSubjectActionIds(subjectType);
  const invokeActionId = actionIds.find((id) => id.endsWith("_invoke"));
  const administrativeActionIds = actionIds.filter((id) => (
    id.endsWith("_owner_transfer") || id.endsWith("_access_manage") || id.endsWith("_delete")
  ));
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(permissionSet, actionIds.filter((id) => !administrativeActionIds.includes(id)), "full_access");
    applyAccess(permissionSet, actionIds.filter((id) => id.endsWith("_publish")), "ask_for_permission");
    applyAccess(permissionSet, administrativeActionIds, "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, actionIds.filter((id) => id.endsWith("_view")), "read_only");
  if (invokeActionId) setActionAccess(permissionSet, invokeActionId, "full_access");
  applyAccess(permissionSet, actionIds.filter((id) => id.endsWith("_manage") && !id.endsWith("_access_manage")), "ask_for_permission");
  applyAccess(permissionSet, actionIds.filter((id) => id.endsWith("_publish") || administrativeActionIds.includes(id)), "no_access");
  return permissionSet;
}

function createGuardrailRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet("guardrail_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("guardrail_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(permissionSet, ["guardrail_view", "guardrail_use", "guardrail_evaluate", "guardrail_edit", "guardrail_prompts_manage", "guardrail_versions_manage"], "full_access");
    setActionAccess(permissionSet, "guardrail_publish", "ask_for_permission");
    applyAccess(permissionSet, ["guardrail_access_manage", "guardrail_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  setActionAccess(permissionSet, "guardrail_view", "read_only");
  setActionAccess(permissionSet, "guardrail_use", "full_access");
  setActionAccess(permissionSet, "guardrail_evaluate", "ask_for_permission");
  applyAccess(permissionSet, ["guardrail_edit", "guardrail_prompts_manage", "guardrail_versions_manage", "guardrail_publish", "guardrail_access_manage", "guardrail_delete"], "no_access");
  return permissionSet;
}

function createEvaluationRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") return createAdminPermissionSet("evaluation_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("evaluation_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(permissionSet, [
      "evaluation_view",
      "evaluation_runs_view",
      "evaluation_run",
      "evaluation_cases_manage",
      "evaluation_settings_manage",
      "evaluation_versions_manage",
    ], "full_access");
    setActionAccess(permissionSet, "evaluation_publish", "ask_for_permission");
    applyAccess(permissionSet, ["evaluation_access_manage", "evaluation_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, ["evaluation_view", "evaluation_runs_view"], "read_only");
  setActionAccess(permissionSet, "evaluation_run", "full_access");
  applyAccess(permissionSet, [
    "evaluation_cases_manage",
    "evaluation_settings_manage",
    "evaluation_versions_manage",
    "evaluation_publish",
    "evaluation_access_manage",
    "evaluation_delete",
  ], "no_access");
  return permissionSet;
}

export function createPlatformRolePermissionSet(
  subjectType: PlatformPermissionSubjectType,
  roleId: PlatformPermissionRoleId,
): PlatformPermissionSet {
  const normalizedRoleId = String(roleId || "member").trim().toLowerCase() || "member";
  if (subjectType === "team" || subjectType === "team_role") {
    return createTeamRolePermissionSet(subjectType, normalizedRoleId);
  }
  if (subjectType === "project" || subjectType === "project_team_role") {
    const permissionSet = createProjectRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (subjectType === "organization_role") return createOrganizationRolePermissionSet(normalizedRoleId);
  if (subjectType === "database") return createDatabaseRolePermissionSet(normalizedRoleId);
  if (subjectType === "guardrail" || subjectType === "guardrail_team_role") {
    const permissionSet = createGuardrailRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (subjectType === "evaluation" || subjectType === "evaluation_team_role") {
    const permissionSet = createEvaluationRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (["server", "web_app", "function", "auth", "secrets", "payments", "agent_runtime"].includes(subjectType)) {
    return createManagedResourceRolePermissionSet(subjectType, normalizedRoleId);
  }
  return normalizedRoleId === "owner" || normalizedRoleId === "admin"
    ? createAdminPermissionSet(subjectType)
    : createPlatformDefaultPermissionSet(subjectType);
}

export function normalizePlatformRolePermissionSet(
  value: unknown,
  subjectType: PlatformPermissionSubjectType,
  roleId: PlatformPermissionRoleId,
): PlatformPermissionSet {
  const preset = createPlatformRolePermissionSet(subjectType, roleId);
  if (!isPlatformPermissionRecord(value)) return preset;
  const rings = isPlatformPermissionRecord(value.rings) ? value.rings : {};
  const actions = isPlatformPermissionRecord(value.actions) ? value.actions : {};
  const resources = isPlatformPermissionRecord(value.resources) ? value.resources : {};
  return normalizePlatformPermissionSet({
    ...preset,
    ...value,
    subjectType,
    rings: { ...(preset.rings || {}), ...rings },
    actions: { ...(preset.actions || {}), ...actions },
    resources: { ...(preset.resources || {}), ...resources },
  }, subjectType);
}
