import { describe, expect, it } from "vitest";
import {
  PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  type PlatformPermissionSubjectType,
} from "./permission-catalog.js";
import { shouldShowPlatformPermissionAction } from "./permission-model.js";
import {
  createPlatformDefaultPermissionSet,
  getPlatformPermissionActionAccessByDefinition,
  getPlatformPermissionActionExplicitAccessByDefinition,
  getPlatformPermissionRingAccessById,
  normalizePlatformPermissionSet,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
} from "./permission-policy.js";
import {
  createPlatformRolePermissionSet,
  normalizePlatformRolePermissionSet,
} from "./permission-presets.js";

describe("permission policy", () => {
  it("normalizes legacy string policies without mutating the source", () => {
    const source = {
      subjectType: "agent",
      rings: { ring_1: "read_only" },
      actions: { workspace_read: "no_access" },
      resources: { files: "read_only" },
    };

    const normalized = normalizePlatformPermissionSet(source, "agent");

    expect(getPlatformPermissionRingAccessById(normalized, "ring_1")).toBe("read_only");
    expect(
      getPlatformPermissionActionExplicitAccessByDefinition(normalized, "workspace_read"),
    ).toBe("no_access");
    expect(normalized.resources?.files).toEqual({ defaultAccess: "read_only", rules: [] });
    expect(source.rings.ring_1).toBe("read_only");
  });

  it("updates rings and actions immutably", () => {
    const original = createPlatformDefaultPermissionSet("agent");
    const withRing = updatePlatformPermissionRingAccess(original, "ring_2", "read_only", "agent");
    const withMovedAction = updatePlatformPermissionActionRing(
      withRing,
      "workspace_read",
      "ring_2",
      "agent",
    );
    const withActionAccess = updatePlatformPermissionActionAccess(
      withMovedAction,
      "workspace_read",
      "no_access",
      "agent",
    );

    expect(withRing).not.toBe(original);
    expect(getPlatformPermissionRingAccessById(original, "ring_2")).toBe("ask_for_permission");
    expect(getPlatformPermissionRingAccessById(withRing, "ring_2")).toBe("read_only");
    expect(withActionAccess.actions?.workspace_read).toEqual({
      ringId: "ring_2",
      access: "no_access",
    });
  });

  it.each(["guardrail", "guardrail_team_role"])(
    "shows only concrete guardrail capabilities for %s subjects",
    (subjectType) => {
      const visibleActionIds = PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter((action) =>
        shouldShowPlatformPermissionAction(action, subjectType),
      ).map((action) => action.id);

      expect(visibleActionIds).toEqual([
        "guardrail_view",
        "guardrail_use",
        "guardrail_evaluate",
        "guardrail_edit",
        "guardrail_prompts_manage",
        "guardrail_versions_manage",
        "guardrail_publish",
        "guardrail_access_manage",
        "guardrail_delete",
      ]);
      expect(visibleActionIds).not.toContain("workspace_read");
      expect(visibleActionIds).not.toContain("send_email");
    },
  );

  it.each(["agent_resource", "agent_team_role"])(
    "shows only agent resource capabilities for %s subjects",
    (subjectType) => {
      const visibleActionIds = PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter(
        (action) => shouldShowPlatformPermissionAction(action, subjectType),
      ).map((action) => action.id);

      expect(visibleActionIds).toEqual([
        "agent_resource_view",
        "agent_resource_invoke",
        "agent_resource_activity_view",
        "agent_resource_manage",
        "agent_resource_guardrails_manage",
        "agent_resource_evaluations_run",
        "agent_resource_versions_manage",
        "agent_resource_publish",
        "agent_resource_owner_transfer",
        "agent_resource_access_manage",
        "agent_resource_delete",
      ]);
      expect(visibleActionIds).not.toContain("workspace_read");
      expect(visibleActionIds).not.toContain("send_email");
    },
  );

  it.each(["computer", "computer_team_role"])(
    "shows only computer resource capabilities for %s subjects",
    (subjectType) => {
      const visibleActionIds = PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter(
        (action) => shouldShowPlatformPermissionAction(action, subjectType),
      ).map((action) => action.id);

      expect(visibleActionIds).toEqual([
        "computer_view",
        "computer_invoke",
        "computer_activity_view",
        "computer_manage",
        "computer_connections_manage",
        "computer_versions_manage",
        "computer_publish",
        "computer_owner_transfer",
        "computer_access_manage",
        "computer_delete",
      ]);
      expect(visibleActionIds).not.toContain("workspace_read");
      expect(visibleActionIds).not.toContain("server_invoke");
    },
  );

  it.each([
    [
      "team",
      [
        "team_workspace_view",
        "team_member_invite",
        "team_member_remove",
        "team_role_update",
        "team_shared_resource_manage",
        "team_permission_request_review",
        "team_settings_update",
        "team_role_permissions_manage",
        "team_delete",
      ],
    ],
    [
      "organization_role",
      [
        "organization_workspace_view",
        "organization_member_invite",
        "organization_member_remove",
        "organization_role_update",
        "organization_resource_manage",
        "organization_team_manage",
        "organization_billing_manage",
        "organization_settings_update",
        "organization_permissions_manage",
        "organization_owner_transfer",
        "organization_delete",
      ],
    ],
    [
      "project",
      [
        "project_view",
        "project_threads_view",
        "project_resources_view",
        "project_rules_view",
        "project_threads_create",
        "project_issues_manage",
        "project_strategy_manage",
        "project_resources_manage",
        "project_rules_edit",
        "project_automations_run",
        "project_access_manage",
        "project_owner_transfer",
        "project_delete",
      ],
    ],
    [
      "evaluation",
      [
        "evaluation_view",
        "evaluation_runs_view",
        "evaluation_run",
        "evaluation_cases_manage",
        "evaluation_settings_manage",
        "evaluation_versions_manage",
        "evaluation_publish",
        "evaluation_access_manage",
        "evaluation_delete",
      ],
    ],
    [
      "fine_tuning",
      [
        "fine_tuning_view",
        "fine_tuning_results_view",
        "fine_tuning_changes_view",
        "fine_tuning_stop",
        "fine_tuning_settings_manage",
        "fine_tuning_version_publish",
        "fine_tuning_access_manage",
        "fine_tuning_delete",
      ],
    ],
    [
      "assurance_policy",
      [
        "assurance_policy_view",
        "assurance_run_results_view",
        "assurance_run",
        "assurance_policy_manage",
        "assurance_policy_versions_manage",
        "assurance_approve",
        "assurance_policy_access_manage",
        "assurance_policy_delete",
      ],
    ],
    [
      "database",
      [
        "database_schema_read",
        "database_data_read",
        "database_query",
        "database_export",
        "database_document_create",
        "database_document_update",
        "database_connections_manage",
        "database_document_delete",
        "database_schema_manage",
        "database_access_manage",
        "database_owner_transfer",
        "database_delete",
      ],
    ],
    [
      "server",
      [
        "server_source_read",
        "server_invoke",
        "server_logs_read",
        "server_source_write",
        "server_connection_manage",
        "server_deploy",
        "server_access_manage",
        "server_owner_transfer",
        "server_delete",
      ],
    ],
  ])("shows only %s resource capabilities", (subjectType, expectedActionIds) => {
    const visibleActionIds = PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter((action) =>
      shouldShowPlatformPermissionAction(action, String(subjectType)),
    ).map((action) => action.id);

    expect(visibleActionIds).toEqual(expectedActionIds);
    expect(
      Object.keys(
        createPlatformDefaultPermissionSet(subjectType as PlatformPermissionSubjectType).actions ||
          {},
      ),
    ).toEqual(expectedActionIds);
    expect(visibleActionIds).not.toContain("workspace_read");
    expect(visibleActionIds).not.toContain("send_email");
  });

  it.each(["web_app", "function", "auth", "secrets", "payments", "agent_runtime"])(
    "uses a dedicated persisted action namespace for %s resources",
    (subjectType) => {
      const visibleActionIds = PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter((action) =>
        shouldShowPlatformPermissionAction(action, subjectType),
      ).map((action) => action.id);

      expect(visibleActionIds).toEqual([
        `${subjectType}_view`,
        `${subjectType}_invoke`,
        `${subjectType}_activity_view`,
        `${subjectType}_manage`,
        `${subjectType}_connections_manage`,
        `${subjectType}_publish`,
        `${subjectType}_owner_transfer`,
        `${subjectType}_access_manage`,
        `${subjectType}_delete`,
      ]);
      expect(visibleActionIds).not.toContain("server_invoke");
    },
  );

  it("migrates legacy server action policies into a managed resource namespace", () => {
    const normalized = normalizePlatformPermissionSet(
      {
        subjectType: "server",
        actions: {
          server_invoke: { ringId: "ring_2", access: "no_access" },
          server_source_write: { ringId: "ring_3", access: "ask_for_permission" },
        },
      },
      "secrets",
    );

    expect(normalized.subjectType).toBe("secrets");
    expect(normalized.actions?.secrets_invoke).toEqual({ ringId: "ring_2", access: "no_access" });
    expect(normalized.actions?.secrets_manage).toEqual({
      ringId: "ring_3",
      access: "ask_for_permission",
    });
    expect(normalized.actions?.server_invoke).toBeUndefined();
  });

  it("uses an explicitly requested resource subject and prunes stale cross-resource actions", () => {
    const normalized = normalizePlatformPermissionSet(
      {
        subjectType: "agent",
        actions: {
          workspace_read: { ringId: "ring_1", access: "full_access" },
          project_view: { ringId: "ring_1", access: "read_only" },
        },
      },
      "project",
    );

    expect(normalized.subjectType).toBe("project");
    expect(normalized.actions?.project_view).toEqual({ ringId: "ring_1", access: "read_only" });
    expect(normalized.actions?.workspace_read).toBeUndefined();
  });

  it("fails closed when a resource policy is evaluated or updated with an unrelated action", () => {
    const project = createPlatformDefaultPermissionSet("project");
    const afterAccessUpdate = updatePlatformPermissionActionAccess(
      project,
      "send_email",
      "full_access",
      "project",
    );
    const afterRingUpdate = updatePlatformPermissionActionRing(
      project,
      "database_delete",
      "ring_1",
      "project",
    );

    expect(getPlatformPermissionActionAccessByDefinition(project, "send_email")).toBe("no_access");
    expect(afterAccessUpdate.actions?.send_email).toBeUndefined();
    expect(afterRingUpdate.actions?.database_delete).toBeUndefined();
  });

  it("provides conservative resource-specific defaults for non-admin roles", () => {
    const projectContributor = createPlatformRolePermissionSet("project_team_role", "contributor");
    const databaseContributor = createPlatformRolePermissionSet("database", "contributor");
    const authMember = createPlatformRolePermissionSet("auth", "member");
    const agentContributor = createPlatformRolePermissionSet(
      "agent_team_role",
      "contributor",
    );
    const agentMember = createPlatformRolePermissionSet("agent_team_role", "member");
    const computerContributor = createPlatformRolePermissionSet(
      "computer_team_role",
      "contributor",
    );
    const computerMember = createPlatformRolePermissionSet(
      "computer_team_role",
      "member",
    );
    const evaluationOwner = createPlatformRolePermissionSet("evaluation_team_role", "owner");
    const evaluationContributor = createPlatformRolePermissionSet(
      "evaluation_team_role",
      "contributor",
    );
    const evaluationMember = createPlatformRolePermissionSet("evaluation_team_role", "member");
    const fineTuningContributor = createPlatformRolePermissionSet(
      "fine_tuning_team_role",
      "contributor",
    );
    const fineTuningMember = createPlatformRolePermissionSet("fine_tuning_team_role", "member");
    const assuranceOwner = createPlatformRolePermissionSet(
      "assurance_policy_team_role",
      "owner",
    );
    const assuranceContributor = createPlatformRolePermissionSet(
      "assurance_policy_team_role",
      "contributor",
    );
    const assuranceMember = createPlatformRolePermissionSet(
      "assurance_policy_team_role",
      "member",
    );
    const securityContributor = createPlatformRolePermissionSet(
      "security_repository",
      "contributor",
    );
    const securityMember = createPlatformRolePermissionSet("security_repository", "member");
    const billingRole = createPlatformRolePermissionSet("organization_role", "billing");

    expect(
      getPlatformPermissionActionAccessByDefinition(projectContributor, "project_delete"),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        databaseContributor,
        "database_connections_manage",
      ),
    ).toBe("ask_for_permission");
    expect(
      getPlatformPermissionActionAccessByDefinition(databaseContributor, "database_owner_transfer"),
    ).toBe("no_access");
    expect(getPlatformPermissionActionAccessByDefinition(authMember, "auth_invoke")).toBe(
      "full_access",
    );
    expect(
      getPlatformPermissionActionAccessByDefinition(
        agentContributor,
        "agent_resource_versions_manage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        agentContributor,
        "agent_resource_access_manage",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        agentMember,
        "agent_resource_invoke",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        agentMember,
        "agent_resource_publish",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        computerContributor,
        "computer_versions_manage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        computerContributor,
        "computer_access_manage",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        computerMember,
        "computer_invoke",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        computerMember,
        "computer_publish",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(evaluationOwner, "evaluation_delete"),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        evaluationContributor,
        "evaluation_cases_manage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        evaluationContributor,
        "evaluation_access_manage",
      ),
    ).toBe("no_access");
    expect(getPlatformPermissionActionAccessByDefinition(evaluationMember, "evaluation_run")).toBe(
      "full_access",
    );
    expect(
      getPlatformPermissionActionAccessByDefinition(evaluationMember, "evaluation_settings_manage"),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        fineTuningContributor,
        "fine_tuning_settings_manage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        fineTuningContributor,
        "fine_tuning_version_publish",
      ),
    ).toBe("ask_for_permission");
    expect(
      getPlatformPermissionActionAccessByDefinition(fineTuningMember, "fine_tuning_results_view"),
    ).toBe("read_only");
    expect(
      getPlatformPermissionActionAccessByDefinition(fineTuningMember, "fine_tuning_stop"),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(assuranceOwner, "assurance_approve"),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        assuranceContributor,
        "assurance_policy_versions_manage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        assuranceContributor,
        "assurance_approve",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        assuranceMember,
        "assurance_run_results_view",
      ),
    ).toBe("read_only");
    expect(
      getPlatformPermissionActionAccessByDefinition(assuranceMember, "assurance_run"),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        securityContributor,
        "security_repository_triage",
      ),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        securityContributor,
        "security_repository_remediation_publish",
      ),
    ).toBe("ask_for_permission");
    expect(
      getPlatformPermissionActionAccessByDefinition(securityMember, "security_repository_run"),
    ).toBe("full_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(
        securityMember,
        "security_repository_access_manage",
      ),
    ).toBe("no_access");
    expect(
      getPlatformPermissionActionAccessByDefinition(billingRole, "organization_billing_manage"),
    ).toBe("full_access");
    expect(getPlatformPermissionActionAccessByDefinition(billingRole, "organization_delete")).toBe(
      "no_access",
    );
  });

  it("merges new resource entitlements into saved role policies without replacing configured values", () => {
    const normalized = normalizePlatformRolePermissionSet(
      {
        subjectType: "project_team_role",
        rings: { ring_2: { defaultAccess: "read_only" } },
        actions: { project_rules_edit: { ringId: "ring_2", access: "full_access" } },
      },
      "project_team_role",
      "member",
    );

    expect(getPlatformPermissionRingAccessById(normalized, "ring_2")).toBe("read_only");
    expect(getPlatformPermissionActionAccessByDefinition(normalized, "project_rules_edit")).toBe(
      "full_access",
    );
    expect(getPlatformPermissionActionAccessByDefinition(normalized, "project_delete")).toBe(
      "no_access",
    );
  });
});
