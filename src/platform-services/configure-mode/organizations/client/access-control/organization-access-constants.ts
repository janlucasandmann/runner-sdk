export const ORGANIZATION_ACCESS_RESOURCE_ACTIONS: Readonly<
  Record<string, readonly { id: string; label: string }[]>
> = {
  project: [
    { id: "project_view", label: "View project" },
    { id: "project_issues_manage", label: "Manage issues" },
    { id: "project_updates_write", label: "Write project updates" },
    { id: "project_resources_manage", label: "Manage resources" },
    { id: "project_access_manage", label: "Manage access" },
  ],
  environment: [
    { id: "workspace_read", label: "Read workspace" },
    { id: "local_skill_run", label: "Run local skills" },
    { id: "workspace_write", label: "Write workspace" },
    { id: "local_shell", label: "Use local shell" },
    { id: "shared_resource_write", label: "Change shared resources" },
  ],
  agent: [
    { id: "workspace_read", label: "Read workspace" },
    { id: "external_read", label: "Read external systems" },
    { id: "workspace_write", label: "Write workspace" },
    { id: "shared_resource_write", label: "Change shared resources" },
    { id: "team_agent_delegation", label: "Delegate to agents" },
  ],
  database: [
    { id: "database_schema_read", label: "Read schema" },
    { id: "database_data_read", label: "Read data" },
    { id: "database_document_create", label: "Create documents" },
    { id: "database_document_update", label: "Update documents" },
    { id: "database_access_manage", label: "Manage access" },
  ],
  server: [
    { id: "server_view", label: "View resource" },
    { id: "server_source_manage", label: "Manage source" },
    { id: "server_config_manage", label: "Manage configuration" },
    { id: "server_access_manage", label: "Manage access" },
  ],
  security_repository: [
    { id: "security_repository_view", label: "View repository security" },
    { id: "security_repository_run", label: "Run security review" },
    { id: "security_repository_policy_manage", label: "Manage policy" },
    { id: "security_repository_access_manage", label: "Manage access" },
  ],
  guardrail: [
    { id: "guardrail_view", label: "View guardrail" },
    { id: "guardrail_use", label: "Use guardrail" },
    { id: "guardrail_edit", label: "Edit guardrail" },
    { id: "guardrail_prompts_manage", label: "Manage prompts" },
    { id: "guardrail_access_manage", label: "Manage access" },
  ],
  evaluation: [
    { id: "evaluation_view", label: "View evaluation" },
    { id: "evaluation_runs_view", label: "View runs" },
    { id: "evaluation_run", label: "Run evaluation" },
    { id: "evaluation_cases_manage", label: "Manage cases" },
    { id: "evaluation_access_manage", label: "Manage access" },
  ],
  fine_tuning: [
    { id: "evaluation_view", label: "View fine-tuning job" },
    { id: "evaluation_run", label: "Run optimization" },
    { id: "evaluation_settings_manage", label: "Manage settings" },
    { id: "evaluation_access_manage", label: "Manage access" },
  ],
  test_plan: [
    { id: "test_plan_view", label: "View test plan" },
    { id: "test_run_results_view", label: "View results" },
    { id: "test_run", label: "Run tests" },
    { id: "test_plan_manage", label: "Manage test plan" },
    { id: "test_plan_versions_manage", label: "Manage versions" },
    { id: "test_plan_access_manage", label: "Manage access" },
    { id: "test_plan_delete", label: "Delete test plan" },
  ],
  metronome_workflow: [
    { id: "workspace_read", label: "Read workspace" },
    { id: "shared_resource_write", label: "Change workflow" },
  ],
};

export const ORGANIZATION_ACCESS_RESOURCE_TYPE_OPTIONS = [
  { value: "project", label: "Project" },
  { value: "environment", label: "Computer" },
  { value: "agent", label: "Agent" },
  { value: "database", label: "Database" },
  { value: "server", label: "Development resource" },
  { value: "security_repository", label: "Security repository" },
  { value: "guardrail", label: "Guardrail" },
  { value: "evaluation", label: "Evaluation" },
  { value: "fine_tuning", label: "Fine-tuning job" },
  { value: "test_plan", label: "Test plan" },
  { value: "metronome_workflow", label: "Metronome workflow" },
] as const;

export const ORGANIZATION_SAFE_IDENTITY_ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "member", label: "Member" },
  { value: "developer", label: "Developer" },
] as const;

export function formatOrganizationAccessLabel(value: unknown): string {
  const normalized = String(value || "")
    .trim()
    .replace(/[_-]+/g, " ");
  return normalized
    ? normalized.replace(/\b\w/g, (character) => character.toUpperCase())
    : "Unknown";
}

export function formatOrganizationAccessDate(value: unknown): string {
  const date = new Date(String(value || ""));
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
