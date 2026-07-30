import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveProviderGrantAccess,
} from "./connector-provider-grants.mjs";

const readCapability = (capabilityId) => ({
  capabilityId,
  interactive: false,
});
const writeCapability = (capabilityId) => ({
  capabilityId,
  interactive: true,
});

test("fails closed for unknown providers and scope-free credentials", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "unknown",
      readCapability("list_items"),
      { accessToken: "token", scope: "read" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "slack",
      readCapability("list_channels"),
      { accessToken: "token" },
    ),
    "no_access",
  );
});

test("separates Microsoft mail read and send scopes", () => {
  const token = { accessToken: "token", scope: "Mail.Read" };
  assert.equal(
    resolveProviderGrantAccess(
      "outlook",
      readCapability("list_messages"),
      token,
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "outlook",
      writeCapability("send_draft"),
      token,
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "outlook",
      writeCapability("send_draft"),
      { ...token, scope: "Mail.Read Mail.Send" },
    ),
    "full_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "outlook",
      writeCapability("send_draft"),
      { ...token, scope: "Mail.ReadWrite" },
    ),
    "no_access",
  );
});

test("keeps Jira and Confluence grants action-scoped within Atlassian", () => {
  const jiraToken = {
    accessToken: "token",
    scope: "read:jira-work write:jira-work",
  };
  assert.equal(
    resolveProviderGrantAccess(
      "jira",
      readCapability("search_issues"),
      jiraToken,
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "jira",
      readCapability("confluence_search_content"),
      jiraToken,
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "jira",
      readCapability("confluence_search_content"),
      { ...jiraToken, scope: `${jiraToken.scope} search:confluence` },
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "jira",
      writeCapability("confluence_add_attachment"),
      { ...jiraToken, scope: `${jiraToken.scope} write:confluence-content` },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "jira",
      writeCapability("confluence_add_attachment"),
      { ...jiraToken, scope: `${jiraToken.scope} write:confluence-file` },
    ),
    "full_access",
  );
});

test("enforces action-specific Slack read and write scopes", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "slack",
      readCapability("list_users"),
      { accessToken: "token", scope: "channels:read" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "slack",
      readCapability("search_messages"),
      { accessToken: "token", scope: "channels:read users:read" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "slack",
      writeCapability("upload_file"),
      { accessToken: "token", scope: "chat:write" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "slack",
      writeCapability("upload_file"),
      { accessToken: "token", scope: "files:write" },
    ),
    "full_access",
  );
});

test("separates Teams messaging from channel administration", () => {
  const messageToken = {
    accessToken: "token",
    scope: "ChannelMessage.Send",
  };
  assert.equal(
    resolveProviderGrantAccess(
      "microsoft-teams",
      writeCapability("post_channel_message"),
      messageToken,
    ),
    "full_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "microsoft-teams",
      writeCapability("create_channel"),
      messageToken,
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "microsoft-teams",
      writeCapability("create_channel"),
      { ...messageToken, scope: "Channel.Create" },
    ),
    "full_access",
  );
});

test("separates SharePoint file writes from list writes", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "sharepoint",
      writeCapability("upload_file"),
      { accessToken: "token", scope: "Files.ReadWrite.All" },
    ),
    "full_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "sharepoint",
      writeCapability("update_list_item"),
      { accessToken: "token", scope: "Files.ReadWrite.All" },
    ),
    "no_access",
  );
});

test("separates Dropbox content writes from sharing writes", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "dropbox",
      writeCapability("upload_file"),
      { accessToken: "token", scope: "files.content.write" },
    ),
    "full_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "dropbox",
      writeCapability("create_shared_link"),
      { accessToken: "token", scope: "files.content.write" },
    ),
    "no_access",
  );
});

test("does not broaden specialized Linear or Figma scopes", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "linear",
      writeCapability("create_issue"),
      { accessToken: "token", scope: "issues:create" },
    ),
    "full_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "linear",
      writeCapability("create_project"),
      { accessToken: "token", scope: "issues:create" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "figma",
      readCapability("get_current_user"),
      { accessToken: "token", scope: "current_user:read" },
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "figma",
      readCapability("get_file"),
      { accessToken: "token", scope: "current_user:read" },
    ),
    "no_access",
  );
});

test("allows explicit action grants for non-scope API credentials", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "supabase",
      readCapability("list_projects"),
      {
        apiKey: "secret",
        actionGrants: { list_projects: "read_only" },
      },
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "supabase",
      writeCapability("execute_sql"),
      {
        apiKey: "secret",
        actionGrants: { execute_sql: "read_only" },
      },
    ),
    "no_access",
  );
});

test("treats explicit action grants as an allowlist", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "supabase",
      readCapability("get_project"),
      {
        apiKey: "secret",
        scope: "projects:read",
        actionGrants: { list_projects: "read_only" },
      },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "supabase",
      readCapability("get_project"),
      {
        apiKey: "secret",
        scope: "projects:read",
        allowedActions: ["list_projects"],
      },
    ),
    "no_access",
  );
});

test("recognizes scoped service-account credentials without exposing their key", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "bigquery",
      { capabilityId: "query", interactive: false },
      {
        serviceAccount: {
          client_email: "runner@example.iam.gserviceaccount.com",
          private_key: "private-key",
        },
        scope: "https://www.googleapis.com/auth/bigquery.readonly",
        permissionClass: "read_only",
      },
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "bigquery",
      { capabilityId: "insert_rows", interactive: true },
      {
        serviceAccount: {
          client_email: "runner@example.iam.gserviceaccount.com",
          private_key: "private-key",
        },
        scope: "https://www.googleapis.com/auth/cloud-platform",
        permissionClass: "read_only",
      },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "bigquery",
      { capabilityId: "insert_rows", interactive: true },
      {
        serviceAccount: {
          client_email: "runner@example.iam.gserviceaccount.com",
          private_key: "private-key",
        },
        scope: "https://www.googleapis.com/auth/bigquery",
        permissionClass: "read_write",
      },
    ),
    "full_access",
  );
});

test("direct API credentials never exceed their declared access profile", () => {
  assert.equal(
    resolveProviderGrantAccess(
      "stripe",
      readCapability("list_customers"),
      { apiKey: "rk_test", permissionClass: "read_only" },
    ),
    "read_only",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "stripe",
      writeCapability("create_customer"),
      { apiKey: "rk_test", permissionClass: "read_only" },
    ),
    "no_access",
  );
  assert.equal(
    resolveProviderGrantAccess(
      "stripe",
      writeCapability("create_customer"),
      { apiKey: "rk_test", permissionClass: "read_write" },
    ),
    "full_access",
  );
});
