import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeJiraNativeEvent,
  normalizeJiraWebhookEvent,
} from "./providers/jira.mjs";
import {
  normalizeLinearNativeEvent,
  normalizeLinearWebhookEvent,
} from "./providers/linear.mjs";

const jiraInstallation = Object.freeze({
  id: "installation_jira",
  tenantId: "tenant_jira",
  appActorId: "jira_app_actor",
  mentionAliases: ["computer agents"],
  siteUrl: "https://example.atlassian.net",
});

const linearInstallation = Object.freeze({
  id: "installation_linear",
  tenantId: "tenant_linear",
  appActorId: "linear_app_actor",
  mentionAliases: ["computer agents"],
});

function jiraCommentPayload({ actorId = "jira_user_1", commentId = "comment_1" } = {}) {
  return {
    cloudId: "tenant_jira",
    webhookEvent: "comment_created",
    timestamp: 1_786_000_000_000,
    user: { accountId: actorId, displayName: "Jira User", emailAddress: "jira@example.test" },
    issue: {
      id: "jira_issue_100",
      key: "OPS-100",
      fields: { summary: "Investigate failed deployment", project: { id: "jira_project_ops" } },
    },
    comment: {
      id: commentId,
      body: {
        type: "doc",
        content: [{
          type: "paragraph",
          content: [
            { type: "mention", attrs: { id: "jira_app_actor", text: "@Computer Agents" } },
            { type: "text", text: " inspect the failure and propose a fix" },
          ],
        }],
      },
    },
  };
}

test("Jira mentions normalize into a stable issue conversation without exposing raw payload", () => {
  const first = normalizeJiraWebhookEvent({
    payload: jiraCommentPayload(),
    installation: jiraInstallation,
    headers: { "x-atlassian-webhook-identifier": "jira_webhook_1" },
  });
  const second = normalizeJiraWebhookEvent({
    payload: jiraCommentPayload({ actorId: "jira_user_2", commentId: "comment_2" }),
    installation: jiraInstallation,
    headers: { "x-atlassian-webhook-identifier": "jira_webhook_1" },
  });
  const retry = normalizeJiraWebhookEvent({
    payload: jiraCommentPayload(),
    installation: jiraInstallation,
    headers: { "x-atlassian-webhook-identifier": "jira_webhook_1" },
  });

  assert.equal(first.provider, "jira");
  assert.equal(first.trigger, "mention");
  assert.equal(first.resource.key, "OPS-100");
  assert.equal(first.visibleMessage, "inspect the failure and propose a fix");
  assert.equal(second.conversationKey, first.conversationKey);
  assert.notEqual(second.eventId, first.eventId);
  assert.equal(retry.eventId, first.eventId);
});

test("Jira assignment and native invocation use the same issue conversation", () => {
  const assignment = normalizeJiraWebhookEvent({
    payload: {
      cloudId: "tenant_jira",
      webhookEvent: "jira:issue_updated",
      timestamp: 1_786_000_000_000,
      user: { accountId: "jira_user_1" },
      issue: {
        id: "jira_issue_100",
        key: "OPS-100",
        fields: {
          summary: "Investigate failed deployment",
          project: { id: "jira_project_ops" },
          assignee: { accountId: "jira_app_actor" },
        },
      },
      changelog: {
        items: [{ field: "assignee", from: "jira_user_2", to: "jira_app_actor" }],
      },
    },
    installation: jiraInstallation,
  });
  const native = normalizeJiraNativeEvent({
    payload: {
      id: "native_1",
      params: {
        prompt: "Review the latest status",
        context: {
          issue: { id: "jira_issue_100", key: "OPS-100", projectId: "jira_project_ops" },
          user: { accountId: "jira_user_1" },
        },
      },
    },
    installation: jiraInstallation,
  });

  assert.equal(assignment.trigger, "assignment");
  assert.equal(native.conversationKey, assignment.conversationKey);
});

test("Jira does not retrigger merely because the app remains assigned", () => {
  assert.equal(normalizeJiraWebhookEvent({
    payload: {
      cloudId: "tenant_jira",
      webhookEvent: "jira:issue_updated",
      timestamp: 1_786_000_000_001,
      user: { accountId: "jira_user_1" },
      issue: {
        id: "jira_issue_100",
        key: "OPS-100",
        fields: {
          summary: "Unrelated field changed",
          project: { id: "jira_project_ops" },
          assignee: { accountId: "jira_app_actor" },
        },
      },
      changelog: { items: [{ field: "summary", from: "Old", to: "New" }] },
    },
    installation: jiraInstallation,
  }), null);
});

test("Jira ignores webhook events authored by the app", () => {
  assert.equal(normalizeJiraWebhookEvent({
    payload: jiraCommentPayload({ actorId: "jira_app_actor" }),
    installation: jiraInstallation,
  }), null);
});

function linearCommentPayload({ actorId = "linear_user_1", commentId = "linear_comment_1" } = {}) {
  return {
    id: `delivery_${commentId}`,
    organizationId: "tenant_linear",
    type: "Comment",
    action: "create",
    webhookTimestamp: 1_786_000_000_000,
    actor: { id: actorId, name: "Linear User", email: "linear@example.test" },
    data: {
      id: commentId,
      body: "@computer agents inspect the failing deployment",
      issue: {
        id: "linear_issue_100",
        identifier: "ENG-100",
        title: "Investigate failed deployment",
        url: "https://linear.app/example/issue/ENG-100",
        team: { id: "linear_team_eng" },
      },
    },
  };
}

test("Linear mentions and native invocations continue the same issue conversation", () => {
  const first = normalizeLinearWebhookEvent({
    payload: linearCommentPayload(),
    installation: linearInstallation,
  });
  const second = normalizeLinearWebhookEvent({
    payload: linearCommentPayload({ actorId: "linear_user_2", commentId: "linear_comment_2" }),
    installation: linearInstallation,
  });
  const native = normalizeLinearNativeEvent({
    payload: {
      id: "linear_native_1",
      organizationId: "tenant_linear",
      type: "AgentSession",
      action: "created",
      actor: { id: "linear_user_1" },
      data: {
        prompt: "Check the current issue state",
        agentSessionId: "session_1",
        issue: { id: "linear_issue_100", identifier: "ENG-100", team: { id: "linear_team_eng" } },
      },
    },
    installation: linearInstallation,
  });

  assert.equal(first.trigger, "mention");
  assert.equal(first.visibleMessage, "inspect the failing deployment");
  assert.equal(second.conversationKey, first.conversationKey);
  assert.equal(native.conversationKey, first.conversationKey);
});

test("Linear only treats an update as assignment when the assignee changed", () => {
  const base = {
    id: "delivery_assignment_1",
    organizationId: "tenant_linear",
    type: "Issue",
    action: "update",
    webhookTimestamp: 1_786_000_000_000,
    actor: { id: "linear_user_1" },
    data: {
      id: "linear_issue_100",
      identifier: "ENG-100",
      title: "Investigate failed deployment",
      assigneeId: "linear_app_actor",
      team: { id: "linear_team_eng" },
    },
  };
  assert.equal(normalizeLinearWebhookEvent({
    payload: { ...base, updatedFrom: { title: "Old title" } },
    installation: linearInstallation,
  }), null);
  assert.equal(normalizeLinearWebhookEvent({
    payload: { ...base, updatedFrom: { assigneeId: "linear_user_2" } },
    installation: linearInstallation,
  })?.trigger, "assignment");
});

test("Linear ignores webhook events authored by the app", () => {
  assert.equal(normalizeLinearWebhookEvent({
    payload: linearCommentPayload({ actorId: "linear_app_actor" }),
    installation: linearInstallation,
  }), null);
});

test("provider aliases accept canonical and at-prefixed configuration", () => {
  const jira = normalizeJiraWebhookEvent({
    payload: {
      ...jiraCommentPayload(),
      comment: { id: "comment_alias", body: "@computer-agents inspect this issue" },
    },
    installation: { ...jiraInstallation, appActorId: "", mentionAliases: ["@computer-agents"] },
  });
  const linear = normalizeLinearWebhookEvent({
    payload: linearCommentPayload(),
    installation: { ...linearInstallation, appActorId: "", mentionAliases: ["@computer agents"] },
  });

  assert.equal(jira?.trigger, "mention");
  assert.equal(linear?.trigger, "mention");
});
