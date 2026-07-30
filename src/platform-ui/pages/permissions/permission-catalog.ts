import type {
  PlatformPermissionActionDefinition,
  PlatformPermissionRingDefinition,
} from "./permission-types.js";
import {
  getPlatformConnectorCatalogEntry,
  getPlatformConnectorPermissionActionId,
  listPlatformConnectorCatalogEntries,
  listPlatformConnectorPermissionActionDescriptors,
  PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES,
  PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES,
} from "../../../platform-integrations/connectors/index.js";

export const PLATFORM_PERMISSION_RING_DEFINITIONS: readonly PlatformPermissionRingDefinition[] = [
  {
    id: "ring_1",
    number: 1,
    label: "Ring 1",
    shortLabel: "Local",
    title: "Local workspace",
    description: "Actions that stay inside the selected computer, including local files, shell commands, and local skill runs.",
    defaultAccess: "full_access",
  },
  {
    id: "ring_2",
    number: 2,
    label: "Ring 2",
    shortLabel: "Shared",
    title: "Shared workspace",
    description: "Actions that affect shared Computer Agents resources or send private messages outside the current computer.",
    defaultAccess: "ask_for_permission",
  },
  {
    id: "ring_3",
    number: 3,
    label: "Ring 3",
    shortLabel: "Public",
    title: "Public and irreversible",
    description: "Actions that publish publicly, write to external systems, move money, or expose secrets.",
    defaultAccess: "ask_for_permission",
  },
];

export const PLATFORM_PERMISSION_RING_IDS = PLATFORM_PERMISSION_RING_DEFINITIONS.map((ring) => ring.id);

type ManagedResourcePermissionSubjectType =
  | "computer"
  | "web_app"
  | "function"
  | "auth"
  | "secrets"
  | "payments"
  | "agent_runtime";

interface ManagedResourcePermissionCatalogOptions {
  subjectType: ManagedResourcePermissionSubjectType;
  noun: string;
  viewLabel: string;
  invokeLabel: string;
  activityLabel: string;
  manageLabel: string;
  publishLabel: string;
}

function createManagedResourcePermissionActions({
  subjectType,
  noun,
  viewLabel,
  invokeLabel,
  activityLabel,
  manageLabel,
  publishLabel,
}: ManagedResourcePermissionCatalogOptions): PlatformPermissionActionDefinition[] {
  return [
    {
      id: `${subjectType}_view`,
      ringId: "ring_1",
      label: viewLabel,
      description: `View this ${noun}'s configuration, versions, status, and metadata.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_invoke`,
      ringId: "ring_1",
      label: invokeLabel,
      description: `Use the deployed capabilities exposed by this ${noun}.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_activity_view`,
      ringId: "ring_1",
      label: activityLabel,
      description: `View analytics, logs, activity history, and operational status for this ${noun}.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_manage`,
      ringId: "ring_2",
      label: manageLabel,
      description: `Change this ${noun}'s source, configuration, and operational settings.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_connections_manage`,
      ringId: "ring_2",
      label: "Manage connections",
      description: `Connect or disconnect this ${noun} from other managed resources.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_publish`,
      ringId: "ring_3",
      label: publishLabel,
      description: `Publish, roll back, or change the active version of this ${noun}.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_owner_transfer`,
      ringId: "ring_3",
      label: "Transfer ownership",
      description: `Transfer permanent ownership of this ${noun} to another eligible team member.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_access_manage`,
      ringId: "ring_3",
      label: "Manage access",
      description: `Share this ${noun} with teams and change their role permission policies.`,
      subjectTypes: [subjectType],
    },
    {
      id: `${subjectType}_delete`,
      ringId: "ring_3",
      label: `Delete ${noun}`,
      description: `Permanently delete this ${noun} and its managed data.`,
      subjectTypes: [subjectType],
    },
  ];
}

const PLATFORM_AGENT_RESOURCE_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] = [
  {
    id: "agent_resource_view",
    ringId: "ring_1",
    label: "View agent",
    description:
      "View this agent's configuration, profile, model, instructions, versions, and access settings.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_invoke",
    ringId: "ring_1",
    label: "Use agent",
    description:
      "Start and continue threads with this agent through the platform, tags, or API.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_activity_view",
    ringId: "ring_1",
    label: "View threads and insights",
    description:
      "View this agent's threads, run summaries, analytics, evaluation results, and usage.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_manage",
    ringId: "ring_2",
    label: "Edit agent configuration",
    description:
      "Change this agent's name, profile, model, instructions, skills, tags, and default environment.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_guardrails_manage",
    ringId: "ring_2",
    label: "Manage guardrails",
    description:
      "Attach, configure, or remove guardrails that govern this agent's work.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_evaluations_run",
    ringId: "ring_2",
    label: "Run evaluations",
    description:
      "Run evaluation sets against this agent and inspect version-specific results.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_versions_manage",
    ringId: "ring_2",
    label: "Create and manage versions",
    description:
      "Create, compare, restore, rename, or remove saved versions of this agent.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_publish",
    ringId: "ring_3",
    label: "Publish versions",
    description:
      "Publish a version, change the active version, or roll this agent back.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description:
      "Transfer permanent ownership of this agent to another eligible organization member.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description:
      "Share this agent with teams and change the permission policies assigned to their roles.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
  {
    id: "agent_resource_delete",
    ringId: "ring_3",
    label: "Delete agent",
    description:
      "Permanently delete this agent, its saved versions, and its resource access assignments.",
    subjectTypes: ["agent_resource", "agent_team_role"],
  },
];

const PLATFORM_COMPUTER_RESOURCE_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] = [
  {
    id: "computer_view",
    ringId: "ring_1",
    label: "View computer",
    description:
      "View this computer's profile, configuration, runtime versions, status, and access settings.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_invoke",
    ringId: "ring_1",
    label: "Use computer",
    description:
      "Run agent work on this computer and use it as a thread or project environment.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_activity_view",
    ringId: "ring_1",
    label: "View runs and usage",
    description:
      "View this computer's runs, activity history, analytics, compute usage, and operational status.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_manage",
    ringId: "ring_2",
    label: "Edit computer configuration",
    description:
      "Change this computer's profile, runtime versions, packages, setup scripts, and advanced settings.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_connections_manage",
    ringId: "ring_2",
    label: "Manage connections",
    description:
      "Connect or disconnect this computer from agents, projects, resources, and external services.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_versions_manage",
    ringId: "ring_2",
    label: "Create and manage versions",
    description:
      "Create, compare, restore, rename, or remove saved versions of this computer.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_publish",
    ringId: "ring_3",
    label: "Publish versions",
    description:
      "Publish a version, change the active version, or roll this computer back.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description:
      "Transfer permanent ownership of this computer to another eligible organization member.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description:
      "Share this computer with teams and change the permission policies assigned to their roles.",
    subjectTypes: ["computer", "computer_team_role"],
  },
  {
    id: "computer_delete",
    ringId: "ring_3",
    label: "Delete computer",
    description:
      "Permanently delete this computer and revoke its resource access assignments.",
    subjectTypes: ["computer", "computer_team_role"],
  },
];

const PLATFORM_SKILL_RESOURCE_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] = [
  {
    id: "skill_view",
    ringId: "ring_1",
    label: "View skill",
    description: "View this skill's metadata, source files, versions, and access settings.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_use",
    ringId: "ring_1",
    label: "Use skill",
    description: "Attach this skill to an agent and use it during an agent run.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_manage",
    ringId: "ring_2",
    label: "Edit skill",
    description: "Change this skill's name, description, instructions, and source files.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_versions_manage",
    ringId: "ring_2",
    label: "Manage versions",
    description: "Create, restore, rename, or remove saved versions of this skill.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_publish",
    ringId: "ring_3",
    label: "Publish versions",
    description: "Publish a saved skill version or change the active production version.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_access_manage",
    ringId: "ring_3",
    label: "Manage skill access",
    description: "Share this skill with teams and change organization role permission policies.",
    subjectTypes: ["skill", "skill_team_role"],
  },
  {
    id: "skill_delete",
    ringId: "ring_3",
    label: "Delete skill",
    description: "Permanently delete this custom skill and its saved versions.",
    subjectTypes: ["skill", "skill_team_role"],
  },
];

const PLATFORM_MANAGED_RESOURCE_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] = [
  ...PLATFORM_AGENT_RESOURCE_PERMISSION_ACTIONS,
  ...PLATFORM_COMPUTER_RESOURCE_PERMISSION_ACTIONS,
  ...PLATFORM_SKILL_RESOURCE_PERMISSION_ACTIONS,
  ...createManagedResourcePermissionActions({
    subjectType: "web_app",
    noun: "web app",
    viewLabel: "View web app",
    invokeLabel: "Open web app",
    activityLabel: "View requests and logs",
    manageLabel: "Edit source and configuration",
    publishLabel: "Publish deployments",
  }),
  ...createManagedResourcePermissionActions({
    subjectType: "function",
    noun: "function",
    viewLabel: "View function",
    invokeLabel: "Invoke function",
    activityLabel: "View invocations and logs",
    manageLabel: "Edit source and configuration",
    publishLabel: "Deploy function",
  }),
  ...createManagedResourcePermissionActions({
    subjectType: "auth",
    noun: "authentication resource",
    viewLabel: "View authentication",
    invokeLabel: "Authenticate users",
    activityLabel: "View authentication activity",
    manageLabel: "Manage users and authentication",
    publishLabel: "Publish authentication changes",
  }),
  ...createManagedResourcePermissionActions({
    subjectType: "secrets",
    noun: "secrets vault",
    viewLabel: "View secret metadata",
    invokeLabel: "Access secret values",
    activityLabel: "View secret access activity",
    manageLabel: "Manage secrets",
    publishLabel: "Publish secrets changes",
  }),
  ...createManagedResourcePermissionActions({
    subjectType: "payments",
    noun: "payments resource",
    viewLabel: "View payments configuration",
    invokeLabel: "Create checkout sessions",
    activityLabel: "View payment activity",
    manageLabel: "Manage payments",
    publishLabel: "Publish payment changes",
  }),
  ...createManagedResourcePermissionActions({
    subjectType: "agent_runtime",
    noun: "agent runtime",
    viewLabel: "View runtime configuration",
    invokeLabel: "Run agents",
    activityLabel: "View runtime runs and usage",
    manageLabel: "Configure runtime",
    publishLabel: "Publish runtime changes",
  }),
];

export const PLATFORM_GITHUB_CONNECTOR_PERMISSION_ACTION_PREFIX =
  "github_action_";

const PLATFORM_GITHUB_CONNECTOR = getPlatformConnectorCatalogEntry("github");

export const PLATFORM_GITHUB_CONNECTOR_INTERACTIVE_CAPABILITY_IDS =
  Object.freeze(
    PLATFORM_GITHUB_CONNECTOR?.capabilities
      .filter((capability) => capability.access === "interactive")
      .map((capability) => capability.id) || [],
  );

export const PLATFORM_GITHUB_CONNECTOR_READ_ONLY_CAPABILITY_IDS =
  Object.freeze(
    PLATFORM_GITHUB_CONNECTOR?.capabilities
      .filter((capability) => capability.access === "read-only")
      .map((capability) => capability.id) || [],
  );

export function getPlatformGitHubConnectorPermissionActionId(
  capabilityId: string,
): string {
  return getPlatformConnectorPermissionActionId("github", capabilityId);
}

const PLATFORM_EXACT_CONNECTOR_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] =
  listPlatformConnectorPermissionActionDescriptors().map((action) => ({
    id: action.id,
    ringId: action.ringId,
    label: action.label,
    description: action.description,
    subjectTypes: action.subjectTypes,
  }));

const PLATFORM_PLUGIN_CONNECTOR_SUBJECT_TYPES = listPlatformConnectorCatalogEntries(
  "plugin",
).flatMap((connector) => [
  connector.permissionSubjectType,
  connector.permissionTeamSubjectType,
]);

const PLATFORM_TAG_CONNECTOR_SUBJECT_TYPES = listPlatformConnectorCatalogEntries(
  "tag",
).flatMap((connector) => [
  connector.permissionSubjectType,
  connector.permissionTeamSubjectType,
]);

const PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES = [
  "plugin",
  "plugin_team_role",
  ...PLATFORM_PLUGIN_CONNECTOR_SUBJECT_TYPES,
];

const PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES = [
  "tag",
  "tag_team_role",
  ...PLATFORM_TAG_CONNECTOR_SUBJECT_TYPES,
];

const PLATFORM_CONNECTION_PERMISSION_ACTIONS: readonly PlatformPermissionActionDefinition[] = [
  {
    id: "tag_view",
    ringId: "ring_1",
    label: "View tag",
    description: "View this tag's connection, routing defaults, instructions, activity, and access settings.",
    subjectTypes: PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "tag_invoke",
    ringId: "ring_1",
    label: "Invoke through tag",
    description: "Start or continue an agent thread from this external channel.",
    subjectTypes: ["tag", "tag_team_role"],
  },
  {
    id: "tag_activity_view",
    ringId: "ring_1",
    label: "View tag activity",
    description: "View threads, analytics, delivery status, and usage attributed to this tag.",
    subjectTypes: PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "tag_configure",
    ringId: "ring_2",
    label: "Configure tag",
    description: "Change routing defaults, environment selection, and invisible agent instructions.",
    subjectTypes: ["tag", "tag_team_role"],
  },
  {
    id: "tag_attachment_ingest",
    ringId: "ring_2",
    label: "Ingest attachments",
    description: "Bring files and images from the external channel into an agent thread.",
    subjectTypes: ["tag", "tag_team_role"],
  },
  {
    id: "tag_reply",
    ringId: "ring_2",
    label: "Send replies",
    description: "Send agent run summaries, files, and follow-up messages back through this tag.",
    subjectTypes: ["tag", "tag_team_role"],
  },
  {
    id: "tag_connection_manage",
    ringId: "ring_2",
    label: "Manage connection",
    description: "Connect, verify, refresh, or change the external identity used by this tag.",
    subjectTypes: PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "tag_access_manage",
    ringId: "ring_3",
    label: "Manage tag access",
    description: "Change which organization roles and agents can use or administer this tag.",
    subjectTypes: PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "tag_disconnect",
    ringId: "ring_3",
    label: "Disconnect tag",
    description: "Revoke the external connection and stop new work from entering through this tag.",
    subjectTypes: PLATFORM_TAG_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "plugin_view",
    ringId: "ring_1",
    label: "View plugin",
    description: "View this plugin's connection, capabilities, activity, and access settings.",
    subjectTypes: PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "plugin_use_read",
    ringId: "ring_1",
    label: "Read connected data",
    description: "Read authorized files, records, repositories, messages, or other connected context.",
    subjectTypes: ["plugin", "plugin_team_role"],
  },
  {
    id: "plugin_activity_view",
    ringId: "ring_1",
    label: "View plugin activity",
    description: "View usage, operations, delivery status, and activity attributed to this plugin.",
    subjectTypes: PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "plugin_use_write",
    ringId: "ring_2",
    label: "Change connected data",
    description: "Create, update, or remove data in the connected provider within the granted scopes.",
    subjectTypes: ["plugin", "plugin_team_role"],
  },
  {
    id: "plugin_notifications_send",
    ringId: "ring_2",
    label: "Send notifications",
    description: "Send messages, status updates, or generated content through the connected provider.",
    subjectTypes: ["plugin", "plugin_team_role"],
  },
  {
    id: "plugin_webhooks_manage",
    ringId: "ring_2",
    label: "Manage webhooks",
    description: "Create, update, rotate, or remove provider webhooks that can trigger agent work.",
    subjectTypes: ["plugin", "plugin_team_role"],
  },
  {
    id: "plugin_connection_manage",
    ringId: "ring_2",
    label: "Manage connection",
    description: "Connect, authorize, refresh, or change the external identity and granted scopes.",
    subjectTypes: PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "plugin_access_manage",
    ringId: "ring_3",
    label: "Manage plugin access",
    description: "Change which organization roles and agents can use or administer this plugin.",
    subjectTypes: PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  {
    id: "plugin_disconnect",
    ringId: "ring_3",
    label: "Disconnect plugin",
    description: "Revoke provider authorization and stop all new operations through this plugin.",
    subjectTypes: PLATFORM_PLUGIN_ADMINISTRATIVE_SUBJECT_TYPES,
  },
  ...PLATFORM_EXACT_CONNECTOR_PERMISSION_ACTIONS,
];

export const PLATFORM_PERMISSION_ACTION_DEFINITIONS: readonly PlatformPermissionActionDefinition[] = [
  {
    id: "workspace_read",
    ringId: "ring_1",
    label: "Read workspace",
    description: "Read files, directories, logs, and local workspace context.",
  },
  {
    id: "workspace_write",
    ringId: "ring_1",
    label: "Edit workspace",
    description: "Create, update, delete, move, or download files inside the selected computer.",
  },
  {
    id: "local_shell",
    ringId: "ring_1",
    label: "Run local commands",
    description: "Run bash or runtime commands that execute inside the selected computer.",
  },
  {
    id: "local_skill_run",
    ringId: "ring_1",
    label: "Run local skills",
    description: "Use installed skills that operate within the selected computer context.",
  },
  {
    id: "external_read",
    ringId: "ring_2",
    label: "Read external sources",
    description: "Fetch public web pages, package metadata, documentation, or other read-only external context.",
  },
  {
    id: "shared_resource_write",
    ringId: "ring_2",
    label: "Edit shared resources",
    description: "Change shared projects, files, resources, comments, tickets, calendars, or team-visible state.",
  },
  {
    id: "send_email",
    ringId: "ring_2",
    label: "Send private messages",
    description: "Send email, Slack, or other direct messages to known recipients.",
  },
  {
    id: "team_agent_delegation",
    ringId: "ring_2",
    label: "Delegate to agents",
    description: "Create, invoke, or coordinate other agents and team agents.",
  },
  {
    id: "team_workspace_view",
    ringId: "ring_1",
    label: "View team workspace",
    description: "View team members, invitations, shared resources, team activity, and role configuration.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_member_invite",
    ringId: "ring_2",
    label: "Invite team members",
    description: "Invite humans or agents into the team and assign an initial role.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_member_remove",
    ringId: "ring_2",
    label: "Remove team members",
    description: "Remove humans or agents from the team membership roster.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_role_update",
    ringId: "ring_2",
    label: "Change member roles",
    description: "Promote, demote, or otherwise change the role assigned to a team member.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_shared_resource_manage",
    ringId: "ring_2",
    label: "Manage shared resources",
    description: "Add, remove, or edit projects, computers, agents, templates, and other resources shared with the team.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_permission_request_review",
    ringId: "ring_2",
    label: "Review permission requests",
    description: "Approve or deny team-scoped permission requests from humans and agents.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_settings_update",
    ringId: "ring_3",
    label: "Edit team settings",
    description: "Rename the team and change its governance settings.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_role_permissions_manage",
    ringId: "ring_3",
    label: "Manage role permissions",
    description: "Change the capability policies assigned to team roles.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "team_delete",
    ringId: "ring_3",
    label: "Delete team",
    description: "Permanently delete the team, revoke invitations, and remove shared-resource access.",
    subjectTypes: ["team", "team_role"],
  },
  {
    id: "organization_workspace_view",
    ringId: "ring_1",
    label: "View organization workspace",
    description: "View organization members, resources, usage, billing, and role configuration.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_member_invite",
    ringId: "ring_2",
    label: "Invite organization members",
    description: "Invite people into the organization and assign an initial role.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_member_remove",
    ringId: "ring_2",
    label: "Remove organization members",
    description: "Remove people from the organization membership roster.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_role_update",
    ringId: "ring_2",
    label: "Change member roles",
    description: "Promote, demote, or otherwise change organization member roles.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_resource_manage",
    ringId: "ring_2",
    label: "Manage organization resources",
    description: "Create, edit, operate, or remove resources owned by the organization.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_team_manage",
    ringId: "ring_2",
    label: "Manage organization teams",
    description: "Create, update, or remove teams owned by the organization.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_billing_manage",
    ringId: "ring_3",
    label: "Manage usage and billing",
    description: "Manage credits, budgets, reservations, usage controls, and billing operations.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_settings_update",
    ringId: "ring_3",
    label: "Edit organization settings",
    description: "Rename the organization and change governance or role-permission settings.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_permissions_manage",
    ringId: "ring_3",
    label: "Manage role permissions",
    description: "Change the capability policies assigned to organization roles.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description: "Transfer permanent ownership of the organization to another eligible member.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "organization_delete",
    ringId: "ring_3",
    label: "Delete organization",
    description: "Permanently delete the organization and detach its members and resources.",
    subjectTypes: ["organization_role"],
  },
  {
    id: "project_view",
    ringId: "ring_1",
    label: "View project",
    description: "View the project overview, backlog, board, releases, and activity.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_threads_view",
    ringId: "ring_1",
    label: "View project threads",
    description: "View agent threads and run summaries associated with this project.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_resources_view",
    ringId: "ring_1",
    label: "View project resources",
    description: "View computers, agents, files, and deployed resources connected to this project.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_rules_view",
    ringId: "ring_1",
    label: "View project rules",
    description: "Read project rules that guide agents, tickets, and shared execution behavior.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_threads_create",
    ringId: "ring_2",
    label: "Start project threads",
    description: "Start agent work in the project and continue existing project threads.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_issues_manage",
    ringId: "ring_2",
    label: "Manage issues",
    description: "Create, edit, assign, move, complete, or delete project issues.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_strategy_manage",
    ringId: "ring_2",
    label: "Manage strategy",
    description: "Edit strategy notes, outcomes, milestones, releases, and project goals.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_resources_manage",
    ringId: "ring_2",
    label: "Manage project resources",
    description: "Connect, update, or remove computers, agents, files, and deployed resources.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_rules_edit",
    ringId: "ring_2",
    label: "Edit project rules",
    description: "Create, update, or remove project rules used by agents and collaborators.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_automations_run",
    ringId: "ring_2",
    label: "Run project automations",
    description: "Run Mission Control and other project-wide automated workflows.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_access_manage",
    ringId: "ring_3",
    label: "Manage project access",
    description: "Add teams, remove teams, or change project role permission pages.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description: "Transfer permanent project ownership to another eligible organization member.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "project_delete",
    ringId: "ring_3",
    label: "Delete project",
    description: "Permanently delete this project and detach its issues, threads, and connected resources.",
    subjectTypes: ["project", "project_team_role"],
  },
  {
    id: "guardrail_view",
    ringId: "ring_1",
    label: "View guardrail",
    description: "View the guardrail description, instructions, versions, evaluations, and access configuration.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_use",
    ringId: "ring_1",
    label: "Use with agents",
    description: "Attach this guardrail to agents that the user can configure.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_evaluate",
    ringId: "ring_2",
    label: "Run evaluations",
    description: "Run evaluation datasets against this guardrail and inspect the resulting runs.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_edit",
    ringId: "ring_2",
    label: "Edit guardrail details",
    description: "Rename the guardrail and change its description.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_prompts_manage",
    ringId: "ring_2",
    label: "Manage instructions",
    description: "Create, edit, reorder, or remove the instructions enforced during agent runs.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_versions_manage",
    ringId: "ring_2",
    label: "Manage versions",
    description: "Create, compare, restore, or remove saved guardrail versions.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_publish",
    ringId: "ring_3",
    label: "Publish versions",
    description: "Publish or unpublish a guardrail version used by connected agents.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description: "Share this guardrail with teams and change their role permission pages.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "guardrail_delete",
    ringId: "ring_3",
    label: "Delete guardrail",
    description: "Permanently delete this guardrail and remove it from connected agents.",
    subjectTypes: ["guardrail", "guardrail_team_role"],
  },
  {
    id: "evaluation_view",
    ringId: "ring_1",
    label: "View evaluation",
    description: "View the evaluation dataset, evaluator configuration, versions, runs, and access configuration.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_runs_view",
    ringId: "ring_1",
    label: "View evaluation runs",
    description: "Inspect evaluation runs, case results, scores, reasoning, costs, and related threads.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_run",
    ringId: "ring_2",
    label: "Run evaluations",
    description: "Start evaluation runs against agents, versions, projects, or computers.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_runs_manage",
    ringId: "ring_2",
    label: "Manage evaluation runs",
    description: "Retry, recalculate, or delete retained evaluation runs and their case results.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_cases_manage",
    ringId: "ring_2",
    label: "Manage cases",
    description: "Create, import, edit, or remove evaluation cases and their expected outputs.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_settings_manage",
    ringId: "ring_2",
    label: "Manage evaluation settings",
    description: "Change evaluator guidance, evaluator configuration, pass threshold, and evaluation metadata.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_versions_manage",
    ringId: "ring_2",
    label: "Manage versions",
    description: "Create, compare, restore, or remove saved evaluation versions.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_publish",
    ringId: "ring_3",
    label: "Publish versions",
    description: "Publish or unpublish the evaluation version used for new runs.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description: "Share this evaluation with teams and change their role permission pages.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "evaluation_delete",
    ringId: "ring_3",
    label: "Delete evaluation",
    description: "Permanently delete this evaluation, its versions, and its retained run history.",
    subjectTypes: ["evaluation", "evaluation_team_role"],
  },
  {
    id: "test_plan_view",
    ringId: "ring_1",
    label: "View test plan",
    description:
      "View this test plan's immutable definitions, target, versions, and delivery links.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_run_results_view",
    ringId: "ring_1",
    label: "View test evidence",
    description:
      "Inspect test runs, case results, exit codes, diagnostics, artifacts, and evidence fingerprints.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_run",
    ringId: "ring_2",
    label: "Run tests",
    description:
      "Execute a published test-plan version in an authorized Computer Agents environment.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_plan_manage",
    ringId: "ring_2",
    label: "Manage test plan",
    description:
      "Change test cases, setup and teardown steps, evidence policy, targets, and execution settings.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_plan_versions_manage",
    ringId: "ring_2",
    label: "Manage versions",
    description:
      "Create and publish immutable test-plan versions used by new test runs.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_plan_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description:
      "Share this test plan with teams and change their role permission pages.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "test_plan_delete",
    ringId: "ring_3",
    label: "Delete test plan",
    description:
      "Permanently delete this test plan, its versions, retained results, and evidence artifacts.",
    subjectTypes: ["test_plan", "test_plan_team_role"],
  },
  {
    id: "assurance_policy_view",
    ringId: "ring_1",
    label: "View Assurance Policy",
    description:
      "View the policy, immutable versions, canonical gates, project binding, and release history.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_run_results_view",
    ringId: "ring_1",
    label: "View Assurance evidence",
    description:
      "Inspect canonical evidence, gate outcomes, fingerprints, decisions, and the append-only audit log.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_run",
    ringId: "ring_2",
    label: "Run Assurance",
    description:
      "Evaluate canonical Test, Evaluation, and Agent Optimization run IDs against a published policy version.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_policy_manage",
    ringId: "ring_2",
    label: "Manage Assurance Policy",
    description:
      "Change project binding, release gates, thresholds, freshness, budget, and approval requirements.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_policy_versions_manage",
    ringId: "ring_2",
    label: "Manage versions",
    description:
      "Create and publish immutable Assurance Policy versions used by new release decisions.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_approve",
    ringId: "ring_3",
    label: "Approve release evidence",
    description:
      "Approve a manual release gate for the exact current evidence fingerprint.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_policy_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description:
      "Share this Assurance Policy with teams and change their role permission pages.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "assurance_policy_delete",
    ringId: "ring_3",
    label: "Delete Assurance Policy",
    description:
      "Permanently delete this policy, its versions, release decisions, and retained audit events.",
    subjectTypes: ["assurance_policy", "assurance_policy_team_role"],
  },
  {
    id: "fine_tuning_view",
    ringId: "ring_1",
    label: "View fine-tuning job",
    description: "View the job configuration, target agent, environment, status, and fine-tuning metadata.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_results_view",
    ringId: "ring_1",
    label: "View results",
    description: "Inspect evaluation scores, analysis, costs, related runs, and the fine-tuning thread.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_changes_view",
    ringId: "ring_1",
    label: "View agent changes",
    description: "Inspect the generated agent configuration and instruction changes.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_stop",
    ringId: "ring_2",
    label: "Stop jobs",
    description: "Stop an active fine-tuning or verification run.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_settings_manage",
    ringId: "ring_2",
    label: "Manage settings",
    description: "Change the job description, instructions, and retained fine-tuning metadata.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_version_publish",
    ringId: "ring_3",
    label: "Publish generated version",
    description: "Publish the generated configuration as a new version of the target agent.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description: "Share this fine-tuning job with teams and change their role permission pages.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "fine_tuning_delete",
    ringId: "ring_3",
    label: "Delete fine-tuning job",
    description: "Permanently delete this fine-tuning job and its retained results.",
    subjectTypes: ["fine_tuning", "fine_tuning_team_role"],
  },
  {
    id: "database_schema_read",
    ringId: "ring_1",
    label: "View schema",
    description: "View collections, fields, indexes, and database metadata.",
    subjectTypes: ["database"],
  },
  {
    id: "database_data_read",
    ringId: "ring_1",
    label: "Read data",
    description: "Read documents and values stored in this database.",
    subjectTypes: ["database"],
  },
  {
    id: "database_query",
    ringId: "ring_1",
    label: "Run queries",
    description: "Filter, sort, aggregate, and search database records.",
    subjectTypes: ["database"],
  },
  {
    id: "database_export",
    ringId: "ring_2",
    label: "Export data",
    description: "Download or transmit database records outside the database.",
    subjectTypes: ["database"],
  },
  {
    id: "database_document_create",
    ringId: "ring_2",
    label: "Create documents",
    description: "Add new documents and values to existing collections.",
    subjectTypes: ["database"],
  },
  {
    id: "database_document_update",
    ringId: "ring_2",
    label: "Update documents",
    description: "Change existing documents, fields, and values.",
    subjectTypes: ["database"],
  },
  {
    id: "database_connections_manage",
    ringId: "ring_2",
    label: "Manage connections",
    description: "Connect or disconnect functions, web apps, auth, runtimes, and other managed resources.",
    subjectTypes: ["database"],
  },
  {
    id: "database_document_delete",
    ringId: "ring_3",
    label: "Delete documents",
    description: "Permanently delete documents or fields from the database.",
    subjectTypes: ["database"],
  },
  {
    id: "database_schema_manage",
    ringId: "ring_3",
    label: "Manage schema",
    description: "Create, rename, or delete collections and change database structure.",
    subjectTypes: ["database"],
  },
  {
    id: "database_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description: "Share the database and change permissions for teams and collaborators.",
    subjectTypes: ["database"],
  },
  {
    id: "database_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description: "Transfer permanent ownership of this database to another eligible team member.",
    subjectTypes: ["database"],
  },
  {
    id: "database_delete",
    ringId: "ring_3",
    label: "Delete database",
    description: "Permanently delete this database, its collections, indexes, and stored documents.",
    subjectTypes: ["database"],
  },
  {
    id: "server_source_read",
    ringId: "ring_1",
    label: "View source",
    description: "View source files, configuration, versions, and deployment metadata.",
    subjectTypes: ["server"],
  },
  {
    id: "server_invoke",
    ringId: "ring_1",
    label: "Invoke resource",
    description: "Open a web app or invoke a function through its deployed endpoint.",
    subjectTypes: ["server"],
  },
  {
    id: "server_logs_read",
    ringId: "ring_1",
    label: "View usage and logs",
    description: "View analytics, request logs, runtime output, and deployment history.",
    subjectTypes: ["server"],
  },
  {
    id: "server_source_write",
    ringId: "ring_2",
    label: "Edit source",
    description: "Create, update, rename, or delete source files and configuration.",
    subjectTypes: ["server"],
  },
  {
    id: "server_connection_manage",
    ringId: "ring_2",
    label: "Manage connections",
    description: "Connect or disconnect databases, auth, runtimes, secrets, and payments resources.",
    subjectTypes: ["server"],
  },
  {
    id: "server_deploy",
    ringId: "ring_3",
    label: "Publish deployments",
    description: "Create versions, publish changes, roll back, or change public deployment settings.",
    subjectTypes: ["server"],
  },
  {
    id: "server_access_manage",
    ringId: "ring_3",
    label: "Manage access",
    description: "Share this resource with teams and change their permission policies.",
    subjectTypes: ["server"],
  },
  {
    id: "server_owner_transfer",
    ringId: "ring_3",
    label: "Transfer ownership",
    description: "Transfer permanent ownership of this resource to another eligible team member.",
    subjectTypes: ["server"],
  },
  {
    id: "server_delete",
    ringId: "ring_3",
    label: "Delete resource",
    description: "Permanently delete this function or web app and its managed deployment.",
    subjectTypes: ["server"],
  },
  {
    id: "security_repository_view",
    ringId: "ring_1",
    label: "View repository security",
    description: "View repository configuration, monitoring status, and current security posture.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_findings_view",
    ringId: "ring_1",
    label: "View findings and evidence",
    description: "View vulnerability findings, source locations, validation evidence, and remediation status.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_audit_view",
    ringId: "ring_1",
    label: "View security audit log",
    description: "View the append-only history of scans, triage decisions, approvals, and GitHub publication events.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_run",
    ringId: "ring_2",
    label: "Run security scans",
    description: "Queue or cancel exact-commit security analysis runs for this repository.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_triage",
    ringId: "ring_2",
    label: "Triage findings",
    description: "Accept, reopen, fix, or mark findings as false positives with an audited reason.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_policy_manage",
    ringId: "ring_2",
    label: "Manage scan policy",
    description: "Change scanner coverage, trigger rules, branch filters, and remediation limits.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_threat_model_manage",
    ringId: "ring_2",
    label: "Manage threat model",
    description: "Change trust boundaries, sensitive paths, priority areas, and documented exclusions.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_remediation_generate",
    ringId: "ring_2",
    label: "Generate isolated fixes",
    description: "Generate and validate patch artifacts in an isolated worker without writing to GitHub.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_risk_accept",
    ringId: "ring_3",
    label: "Accept security risk",
    description: "Accept a vulnerability risk for a bounded period with a mandatory audited justification.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_remediation_publish",
    ringId: "ring_3",
    label: "Publish remediation pull requests",
    description: "Approve a validated patch and publish it to GitHub as a draft pull request. Merging is never implied.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_github_manage",
    ringId: "ring_3",
    label: "Manage GitHub connection",
    description: "Connect, refresh, disconnect, or change the GitHub App installation used by this repository.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_access_manage",
    ringId: "ring_3",
    label: "Manage repository access",
    description: "Change who can view findings, run scans, triage risk, or approve remediation publication.",
    subjectTypes: ["security_repository"],
  },
  {
    id: "security_repository_delete",
    ringId: "ring_3",
    label: "Delete security repository",
    description: "Permanently delete this repository's security configuration, findings, run history, and retained evidence.",
    subjectTypes: ["security_repository"],
  },
  ...PLATFORM_MANAGED_RESOURCE_PERMISSION_ACTIONS,
  ...PLATFORM_CONNECTION_PERMISSION_ACTIONS,
  {
    id: "managed_resource_mutation",
    ringId: "ring_2",
    label: "Change managed resources",
    description: "Create or update Computer Agents databases, functions, web apps, secrets, auth, or other managed resources.",
  },
  {
    id: "public_deploy",
    ringId: "ring_3",
    label: "Publish deployments",
    description: "Deploy or publish public web apps, functions, workflows, or other externally reachable services.",
  },
  {
    id: "github_write",
    ringId: "ring_3",
    label: "Write to GitHub",
    description: "Push commits, create pull requests, merge code, or otherwise write to GitHub repositories.",
  },
  {
    id: "payment_action",
    ringId: "ring_3",
    label: "Move money",
    description: "Create charges, refunds, checkout links, subscriptions, or payment-provider changes.",
  },
  {
    id: "public_message",
    ringId: "ring_3",
    label: "Publish public messages",
    description: "Post to public channels, social accounts, websites, or customer-visible feeds.",
  },
  {
    id: "secret_export",
    ringId: "ring_3",
    label: "Expose secrets",
    description: "Copy, export, transmit, or reveal secrets and credentials outside the secure resource boundary.",
  },
];

export const PLATFORM_PERMISSION_RESOURCE_TYPES = [
  "agents",
  "skills",
  "servers",
  "computers",
  "files",
  "directories",
  "projects",
  "security_repositories",
] as const;

export const PLATFORM_PERMISSION_SUBJECT_TYPES = [
  "agent",
  "agent_resource",
  "agent_team_role",
  "project",
  "project_team_role",
  "team",
  "team_role",
  "organization_role",
  "database",
  "computer",
  "computer_team_role",
  "skill",
  "skill_team_role",
  "server",
  "web_app",
  "function",
  "auth",
  "secrets",
  "payments",
  "agent_runtime",
  "tag",
  "tag_team_role",
  "plugin",
  "plugin_team_role",
  ...PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES,
  ...PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES,
  "guardrail",
  "guardrail_team_role",
  "evaluation",
  "evaluation_team_role",
  "test_plan",
  "test_plan_team_role",
  "assurance_policy",
  "assurance_policy_team_role",
  "fine_tuning",
  "fine_tuning_team_role",
  "security_repository",
  "human_user",
] as const;

export const PLATFORM_SCOPED_PERMISSION_SUBJECT_TYPES = [
  "agent_resource",
  "agent_team_role",
  "project",
  "project_team_role",
  "team",
  "team_role",
  "organization_role",
  "database",
  "computer",
  "computer_team_role",
  "skill",
  "skill_team_role",
  "server",
  "web_app",
  "function",
  "auth",
  "secrets",
  "payments",
  "agent_runtime",
  "tag",
  "tag_team_role",
  "plugin",
  "plugin_team_role",
  ...PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES,
  ...PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES,
  "guardrail",
  "guardrail_team_role",
  "evaluation",
  "evaluation_team_role",
  "test_plan",
  "test_plan_team_role",
  "assurance_policy",
  "assurance_policy_team_role",
  "fine_tuning",
  "fine_tuning_team_role",
  "security_repository",
] as const;

export const PLATFORM_LEGACY_SERVER_PERMISSION_ACTION_ALIASES: Readonly<
  Partial<Record<ManagedResourcePermissionSubjectType, Readonly<Record<string, string>>>>
> = Object.fromEntries(
  (["web_app", "function", "auth", "secrets", "payments", "agent_runtime"] as const).map((subjectType) => [
    subjectType,
    {
      [`${subjectType}_view`]: "server_source_read",
      [`${subjectType}_invoke`]: "server_invoke",
      [`${subjectType}_activity_view`]: "server_logs_read",
      [`${subjectType}_manage`]: "server_source_write",
      [`${subjectType}_connections_manage`]: "server_connection_manage",
      [`${subjectType}_publish`]: "server_deploy",
      [`${subjectType}_access_manage`]: "server_access_manage",
      [`${subjectType}_delete`]: "server_delete",
    },
  ]),
);

export type PlatformPermissionSubjectType = typeof PLATFORM_PERMISSION_SUBJECT_TYPES[number];
