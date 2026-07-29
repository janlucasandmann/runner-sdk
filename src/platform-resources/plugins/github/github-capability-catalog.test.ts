import { describe, expect, it } from "vitest";
import {
  PLATFORM_GITHUB_CONNECTOR_INTERACTIVE_CAPABILITY_IDS,
  PLATFORM_GITHUB_CONNECTOR_READ_ONLY_CAPABILITY_IDS,
  PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  getPlatformGitHubConnectorPermissionActionId,
} from "../../../platform-ui/pages/permissions/index.js";
import {
  GITHUB_CONNECTOR_CAPABILITIES,
  GITHUB_CONNECTOR_CAPABILITY_COUNTS,
  getGitHubConnectorCapability,
  isGitHubConnectorCapabilityId,
} from "./github-capability-catalog.js";

const EXPECTED_INTERACTIVE_CAPABILITIES = [
  "add_comment_to_pending_review",
  "add_issue_comment",
  "add_reply_to_pull_request_comment",
  "create_branch",
  "create_or_update_file",
  "create_pull_request",
  "create_repository",
  "delete_file",
  "fork_repository",
  "issue_write",
  "merge_pull_request",
  "pull_request_review_write",
  "push_files",
  "request_copilot_review",
  "sub_issue_write",
  "update_pull_request",
  "update_pull_request_branch",
] as const;

const EXPECTED_READ_ONLY_CAPABILITIES = [
  "get_commit",
  "get_file_contents",
  "get_label",
  "get_latest_release",
  "get_me",
  "get_release_by_tag",
  "get_tag",
  "get_team_members",
  "get_teams",
  "issue_read",
  "list_branches",
  "list_commits",
  "list_issue_fields",
  "list_issue_types",
  "list_issues",
  "list_pull_requests",
  "list_releases",
  "list_repository_collaborators",
  "list_tags",
  "pull_request_read",
  "run_secret_scanning",
  "search_code",
  "search_commits",
  "search_issues",
  "search_pull_requests",
  "search_repositories",
  "search_users",
] as const;

describe("GitHub connector capability catalog", () => {
  it("publishes the complete 17 interactive and 27 read-only capability contract", () => {
    expect(
      GITHUB_CONNECTOR_CAPABILITIES.filter(
        (capability) => capability.access === "interactive",
      ).map((capability) => capability.id),
    ).toEqual(EXPECTED_INTERACTIVE_CAPABILITIES);
    expect(
      GITHUB_CONNECTOR_CAPABILITIES.filter(
        (capability) => capability.access === "read-only",
      ).map((capability) => capability.id),
    ).toEqual(EXPECTED_READ_ONLY_CAPABILITIES);
    expect(GITHUB_CONNECTOR_CAPABILITY_COUNTS).toEqual({
      interactive: 17,
      readOnly: 27,
      total: 44,
    });
    expect(
      new Set(GITHUB_CONNECTOR_CAPABILITIES.map(({ id }) => id)).size,
    ).toBe(44);
  });

  it("provides a valid object input schema for every capability", () => {
    for (const capability of GITHUB_CONNECTOR_CAPABILITIES) {
      expect(capability.inputSchema.type, capability.id).toBe("object");
      expect(capability.inputSchema.properties, capability.id).toBeTypeOf(
        "object",
      );
      for (const requiredProperty of capability.inputSchema.required || []) {
        expect(
          Object.hasOwn(
            capability.inputSchema.properties || {},
            requiredProperty,
          ),
          `${capability.id}.${requiredProperty}`,
        ).toBe(true);
      }
    }
  });

  it("supports centralized lookup and validation", () => {
    expect(getGitHubConnectorCapability("list_commits")?.access).toBe(
      "read-only",
    );
    expect(getGitHubConnectorCapability("create_pull_request")?.access).toBe(
      "interactive",
    );
    expect(isGitHubConnectorCapabilityId("run_secret_scanning")).toBe(true);
    expect(isGitHubConnectorCapabilityId("read_repository_file")).toBe(false);
  });

  it("keeps the permission entitlement catalog synchronized with the capability contract", () => {
    expect(PLATFORM_GITHUB_CONNECTOR_INTERACTIVE_CAPABILITY_IDS).toEqual(
      EXPECTED_INTERACTIVE_CAPABILITIES,
    );
    expect(PLATFORM_GITHUB_CONNECTOR_READ_ONLY_CAPABILITY_IDS).toEqual(
      EXPECTED_READ_ONLY_CAPABILITIES,
    );

    for (const capability of GITHUB_CONNECTOR_CAPABILITIES) {
      const actionId = getPlatformGitHubConnectorPermissionActionId(
        capability.id,
      );
      const action = PLATFORM_PERMISSION_ACTION_DEFINITIONS.find(
        (candidate) => candidate.id === actionId,
      );

      expect(action, actionId).toBeDefined();
      expect(action?.ringId, actionId).toBe(
        capability.access === "read-only" ? "ring_1" : "ring_3",
      );
      expect(action?.subjectTypes, actionId).toEqual([
        "github_plugin",
        "github_plugin_team_role",
      ]);
    }
  });
});
