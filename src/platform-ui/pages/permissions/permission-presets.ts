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
import type { PlatformPermissionAccess, PlatformPermissionSet } from "./permission-types.js";

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
  return PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter((action) =>
    action.subjectTypes?.includes(subjectType),
  ).map((action) => action.id);
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
  return (
    policy?.defaultAccess ||
    PLATFORM_PERMISSION_RING_DEFINITIONS.find((ring) => ring.id === ringId)?.defaultAccess ||
    "full_access"
  );
}

function setActionAccess(
  permissionSet: PlatformPermissionSet,
  actionId: string,
  access: PlatformPermissionAccess,
): void {
  const action = PLATFORM_PERMISSION_ACTION_DEFINITIONS.find(
    (candidate) => candidate.id === actionId,
  );
  if (!action) return;
  const currentPolicy = permissionSet.actions?.[action.id];
  const ringId =
    typeof currentPolicy === "object" && currentPolicy?.ringId
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

function createAdminPermissionSet(
  subjectType: PlatformPermissionSubjectType,
): PlatformPermissionSet {
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
  setActionAccess(
    permissionSet,
    "team_workspace_view",
    roleId === "contributor" ? "full_access" : "read_only",
  );
  setActionAccess(permissionSet, "team_shared_resource_manage", "ask_for_permission");
  applyAccess(
    permissionSet,
    [
      "team_member_invite",
      "team_member_remove",
      "team_role_update",
      "team_permission_request_review",
      "team_settings_update",
      "team_role_permissions_manage",
      "team_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createProjectRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("project_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("project_team_role");
  const actionIds = getSubjectActionIds("project_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "no_access");
    applyAccess(
      permissionSet,
      actionIds.filter(
        (id) =>
          !id.endsWith("_access_manage")
          && !id.endsWith("_owner_transfer")
          && !id.endsWith("_delete"),
      ),
      "full_access",
    );
    applyAccess(
      permissionSet,
      ["project_access_manage", "project_owner_transfer", "project_delete"],
      "no_access",
    );
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    actionIds.filter((id) => id.endsWith("_view")),
    "read_only",
  );
  applyAccess(
    permissionSet,
    ["project_threads_create", "project_issues_manage"],
    "ask_for_permission",
  );
  applyAccess(
    permissionSet,
    actionIds.filter(
      (id) =>
        !id.endsWith("_view") && !["project_threads_create", "project_issues_manage"].includes(id),
    ),
    "no_access",
  );
  return permissionSet;
}

function createOrganizationRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("organization_role");
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
    applyAccess(
      permissionSet,
      [
        "database_schema_read",
        "database_data_read",
        "database_query",
        "database_export",
        "database_document_create",
        "database_document_update",
      ],
      "full_access",
    );
    applyAccess(
      permissionSet,
      ["database_connections_manage", "database_document_delete", "database_schema_manage"],
      "ask_for_permission",
    );
    applyAccess(
      permissionSet,
      ["database_access_manage", "database_owner_transfer", "database_delete"],
      "no_access",
    );
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    ["database_schema_read", "database_data_read", "database_query"],
    "read_only",
  );
  applyAccess(
    permissionSet,
    ["database_export", "database_document_create", "database_document_update"],
    "ask_for_permission",
  );
  applyAccess(
    permissionSet,
    [
      "database_connections_manage",
      "database_document_delete",
      "database_schema_manage",
      "database_access_manage",
      "database_owner_transfer",
      "database_delete",
    ],
    "no_access",
  );
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
  const administrativeActionIds = actionIds.filter(
    (id) =>
      id.endsWith("_owner_transfer") || id.endsWith("_access_manage") || id.endsWith("_delete"),
  );
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      actionIds.filter((id) => !administrativeActionIds.includes(id)),
      "full_access",
    );
    applyAccess(
      permissionSet,
      actionIds.filter((id) => id.endsWith("_publish")),
      "ask_for_permission",
    );
    applyAccess(permissionSet, administrativeActionIds, "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    actionIds.filter((id) => id.endsWith("_view")),
    "read_only",
  );
  if (invokeActionId) setActionAccess(permissionSet, invokeActionId, "full_access");
  applyAccess(
    permissionSet,
    actionIds.filter((id) => id.endsWith("_manage") && !id.endsWith("_access_manage")),
    "ask_for_permission",
  );
  applyAccess(
    permissionSet,
    actionIds.filter((id) => id.endsWith("_publish") || administrativeActionIds.includes(id)),
    "no_access",
  );
  return permissionSet;
}

function createConnectionRolePermissionSet(
  subjectType: "tag" | "tag_team_role" | "plugin" | "plugin_team_role",
  roleId: string,
): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") {
    return createAdminPermissionSet(subjectType);
  }
  const permissionSet = createPlatformDefaultPermissionSet(subjectType);
  const actionIds = getSubjectActionIds(subjectType);
  const isContributor = roleId === "contributor" || roleId === "developer";
  const isViewer = roleId === "viewer" || roleId === "billing";
  const readActionIds = actionIds.filter(
    (id) => id.endsWith("_view") || id.endsWith("_use_read"),
  );
  const invocationActionIds = actionIds.filter((id) => id.endsWith("_invoke"));
  const operationalActionIds = actionIds.filter(
    (id) =>
      id.endsWith("_configure")
      || id.endsWith("_attachment_ingest")
      || id.endsWith("_reply")
      || id.endsWith("_use_write")
      || id.endsWith("_notifications_send")
      || id.endsWith("_webhooks_manage"),
  );
  const connectionActionIds = actionIds.filter((id) => id.endsWith("_connection_manage"));
  const administrativeActionIds = actionIds.filter(
    (id) => id.endsWith("_access_manage") || id.endsWith("_disconnect"),
  );

  setRingAccess(permissionSet, "ring_1", isContributor ? "full_access" : "read_only");
  setRingAccess(
    permissionSet,
    "ring_2",
    isContributor ? "full_access" : isViewer ? "no_access" : "ask_for_permission",
  );
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, readActionIds, isContributor ? "full_access" : "read_only");
  applyAccess(
    permissionSet,
    invocationActionIds,
    isViewer ? "no_access" : "full_access",
  );
  applyAccess(
    permissionSet,
    operationalActionIds,
    isContributor ? "full_access" : isViewer ? "no_access" : "ask_for_permission",
  );
  applyAccess(
    permissionSet,
    connectionActionIds,
    isContributor ? "ask_for_permission" : "no_access",
  );
  applyAccess(permissionSet, administrativeActionIds, "no_access");
  return permissionSet;
}

function createGuardrailRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("guardrail_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("guardrail_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      [
        "guardrail_view",
        "guardrail_use",
        "guardrail_evaluate",
        "guardrail_edit",
        "guardrail_prompts_manage",
        "guardrail_versions_manage",
      ],
      "full_access",
    );
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
  applyAccess(
    permissionSet,
    [
      "guardrail_edit",
      "guardrail_prompts_manage",
      "guardrail_versions_manage",
      "guardrail_publish",
      "guardrail_access_manage",
      "guardrail_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createEvaluationRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("evaluation_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("evaluation_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      [
        "evaluation_view",
        "evaluation_runs_view",
        "evaluation_run",
        "evaluation_cases_manage",
        "evaluation_settings_manage",
        "evaluation_versions_manage",
      ],
      "full_access",
    );
    setActionAccess(permissionSet, "evaluation_publish", "ask_for_permission");
    applyAccess(permissionSet, ["evaluation_access_manage", "evaluation_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(permissionSet, ["evaluation_view", "evaluation_runs_view"], "read_only");
  setActionAccess(permissionSet, "evaluation_run", "full_access");
  applyAccess(
    permissionSet,
    [
      "evaluation_cases_manage",
      "evaluation_settings_manage",
      "evaluation_versions_manage",
      "evaluation_publish",
      "evaluation_access_manage",
      "evaluation_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createFineTuningRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("fine_tuning_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("fine_tuning_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      [
        "fine_tuning_view",
        "fine_tuning_results_view",
        "fine_tuning_changes_view",
        "fine_tuning_stop",
        "fine_tuning_settings_manage",
      ],
      "full_access",
    );
    setActionAccess(permissionSet, "fine_tuning_version_publish", "ask_for_permission");
    applyAccess(permissionSet, ["fine_tuning_access_manage", "fine_tuning_delete"], "no_access");
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    ["fine_tuning_view", "fine_tuning_results_view", "fine_tuning_changes_view"],
    "read_only",
  );
  applyAccess(
    permissionSet,
    [
      "fine_tuning_stop",
      "fine_tuning_settings_manage",
      "fine_tuning_version_publish",
      "fine_tuning_access_manage",
      "fine_tuning_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createTestPlanRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin")
    return createAdminPermissionSet("test_plan_team_role");
  const permissionSet = createPlatformDefaultPermissionSet("test_plan_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      [
        "test_plan_view",
        "test_run_results_view",
        "test_run",
        "test_plan_manage",
        "test_plan_versions_manage",
      ],
      "full_access",
    );
    applyAccess(
      permissionSet,
      ["test_plan_access_manage", "test_plan_delete"],
      "no_access",
    );
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    ["test_plan_view", "test_run_results_view"],
    "read_only",
  );
  setActionAccess(permissionSet, "test_run", "full_access");
  applyAccess(
    permissionSet,
    [
      "test_plan_manage",
      "test_plan_versions_manage",
      "test_plan_access_manage",
      "test_plan_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createAssurancePolicyRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") {
    return createAdminPermissionSet("assurance_policy_team_role");
  }
  const permissionSet = createPlatformDefaultPermissionSet("assurance_policy_team_role");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "no_access");
    applyAccess(
      permissionSet,
      [
        "assurance_policy_view",
        "assurance_run_results_view",
        "assurance_run",
        "assurance_policy_manage",
        "assurance_policy_versions_manage",
      ],
      "full_access",
    );
    applyAccess(
      permissionSet,
      [
        "assurance_approve",
        "assurance_policy_access_manage",
        "assurance_policy_delete",
      ],
      "no_access",
    );
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "no_access");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    ["assurance_policy_view", "assurance_run_results_view"],
    "read_only",
  );
  applyAccess(
    permissionSet,
    [
      "assurance_run",
      "assurance_policy_manage",
      "assurance_policy_versions_manage",
      "assurance_approve",
      "assurance_policy_access_manage",
      "assurance_policy_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

function createSecurityRepositoryRolePermissionSet(roleId: string): PlatformPermissionSet {
  if (roleId === "owner" || roleId === "admin") {
    return createAdminPermissionSet("security_repository");
  }
  const permissionSet = createPlatformDefaultPermissionSet("security_repository");
  if (roleId === "contributor") {
    setRingAccess(permissionSet, "ring_1", "full_access");
    setRingAccess(permissionSet, "ring_2", "full_access");
    setRingAccess(permissionSet, "ring_3", "ask_for_permission");
    applyAccess(
      permissionSet,
      [
        "security_repository_view",
        "security_repository_findings_view",
        "security_repository_audit_view",
        "security_repository_run",
        "security_repository_triage",
        "security_repository_policy_manage",
        "security_repository_threat_model_manage",
        "security_repository_remediation_generate",
      ],
      "full_access",
    );
    applyAccess(
      permissionSet,
      ["security_repository_risk_accept", "security_repository_remediation_publish"],
      "ask_for_permission",
    );
    applyAccess(
      permissionSet,
      [
        "security_repository_github_manage",
        "security_repository_access_manage",
        "security_repository_delete",
      ],
      "no_access",
    );
    return permissionSet;
  }
  setRingAccess(permissionSet, "ring_1", "read_only");
  setRingAccess(permissionSet, "ring_2", "ask_for_permission");
  setRingAccess(permissionSet, "ring_3", "no_access");
  applyAccess(
    permissionSet,
    [
      "security_repository_view",
      "security_repository_findings_view",
      "security_repository_audit_view",
    ],
    "read_only",
  );
  setActionAccess(permissionSet, "security_repository_run", "full_access");
  applyAccess(
    permissionSet,
    ["security_repository_triage", "security_repository_remediation_generate"],
    "ask_for_permission",
  );
  applyAccess(
    permissionSet,
    [
      "security_repository_policy_manage",
      "security_repository_threat_model_manage",
      "security_repository_risk_accept",
      "security_repository_remediation_publish",
      "security_repository_github_manage",
      "security_repository_access_manage",
      "security_repository_delete",
    ],
    "no_access",
  );
  return permissionSet;
}

export function createPlatformRolePermissionSet(
  subjectType: PlatformPermissionSubjectType,
  roleId: PlatformPermissionRoleId,
): PlatformPermissionSet {
  const normalizedRoleId =
    String(roleId || "member")
      .trim()
      .toLowerCase() || "member";
  if (subjectType === "team" || subjectType === "team_role") {
    return createTeamRolePermissionSet(subjectType, normalizedRoleId);
  }
  if (subjectType === "project" || subjectType === "project_team_role") {
    const permissionSet = createProjectRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (subjectType === "organization_role")
    return createOrganizationRolePermissionSet(normalizedRoleId);
  if (subjectType === "database") return createDatabaseRolePermissionSet(normalizedRoleId);
  if (
    subjectType === "tag"
    || subjectType === "tag_team_role"
    || subjectType === "plugin"
    || subjectType === "plugin_team_role"
  ) {
    return createConnectionRolePermissionSet(subjectType, normalizedRoleId);
  }
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
  if (subjectType === "test_plan" || subjectType === "test_plan_team_role") {
    const permissionSet = createTestPlanRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (
    subjectType === "assurance_policy"
    || subjectType === "assurance_policy_team_role"
  ) {
    const permissionSet = createAssurancePolicyRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (subjectType === "fine_tuning" || subjectType === "fine_tuning_team_role") {
    const permissionSet = createFineTuningRolePermissionSet(normalizedRoleId);
    permissionSet.subjectType = subjectType;
    return permissionSet;
  }
  if (subjectType === "security_repository") {
    return createSecurityRepositoryRolePermissionSet(normalizedRoleId);
  }
  if (
    [
      "agent_resource",
      "agent_team_role",
      "computer",
      "computer_team_role",
      "server",
      "web_app",
      "function",
      "auth",
      "secrets",
      "payments",
      "agent_runtime",
    ].includes(subjectType)
  ) {
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
  return normalizePlatformPermissionSet(
    {
      ...preset,
      ...value,
      subjectType,
      rings: { ...(preset.rings || {}), ...rings },
      actions: { ...(preset.actions || {}), ...actions },
      resources: { ...(preset.resources || {}), ...resources },
    },
    subjectType,
  );
}
