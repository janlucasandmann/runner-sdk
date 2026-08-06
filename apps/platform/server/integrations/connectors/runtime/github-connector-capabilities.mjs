/**
 * Server-side projection of the centralized GitHub connector contract.
 *
 * Tool schemas and descriptions are resolved from GitHub's official remote MCP
 * server at invocation time. This manifest deliberately owns only the stable
 * authorization identity and access class needed before provider access.
 * Registry contract tests keep it aligned with the frontend catalog.
 */
export const GITHUB_RUNTIME_CAPABILITIES = Object.freeze([
  { id: "add_comment_to_pending_review", access: "interactive" },
  { id: "add_issue_comment", access: "interactive" },
  { id: "add_reply_to_pull_request_comment", access: "interactive" },
  { id: "create_branch", access: "interactive" },
  { id: "create_or_update_file", access: "interactive" },
  { id: "create_pull_request", access: "interactive" },
  { id: "create_repository", access: "interactive" },
  { id: "delete_file", access: "interactive" },
  { id: "fork_repository", access: "interactive" },
  { id: "issue_write", access: "interactive" },
  { id: "merge_pull_request", access: "interactive" },
  { id: "pull_request_review_write", access: "interactive" },
  { id: "push_files", access: "interactive" },
  { id: "request_copilot_review", access: "interactive" },
  { id: "sub_issue_write", access: "interactive" },
  { id: "update_pull_request", access: "interactive" },
  { id: "update_pull_request_branch", access: "interactive" },
  { id: "get_commit", access: "read-only" },
  { id: "get_file_contents", access: "read-only" },
  { id: "get_label", access: "read-only" },
  { id: "get_latest_release", access: "read-only" },
  { id: "get_me", access: "read-only" },
  { id: "get_release_by_tag", access: "read-only" },
  { id: "get_tag", access: "read-only" },
  { id: "get_team_members", access: "read-only" },
  { id: "get_teams", access: "read-only" },
  { id: "issue_read", access: "read-only" },
  { id: "list_branches", access: "read-only" },
  { id: "list_commits", access: "read-only" },
  { id: "list_issue_fields", access: "read-only" },
  { id: "list_issue_types", access: "read-only" },
  { id: "list_issues", access: "read-only" },
  { id: "list_pull_requests", access: "read-only" },
  { id: "list_releases", access: "read-only" },
  { id: "list_repository_collaborators", access: "read-only" },
  { id: "list_tags", access: "read-only" },
  { id: "pull_request_read", access: "read-only" },
  { id: "run_secret_scanning", access: "read-only" },
  { id: "search_code", access: "read-only" },
  { id: "search_commits", access: "read-only" },
  { id: "search_issues", access: "read-only" },
  { id: "search_pull_requests", access: "read-only" },
  { id: "search_repositories", access: "read-only" },
  { id: "search_users", access: "read-only" },
].map((capability) => Object.freeze(capability)));

export const GITHUB_RUNTIME_CAPABILITY_BY_ID = new Map(
  GITHUB_RUNTIME_CAPABILITIES.map((capability) => [
    capability.id,
    capability,
  ]),
);
