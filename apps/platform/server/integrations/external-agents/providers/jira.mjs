import { createHash } from "node:crypto";

import {
  ExternalAgentError,
  normalizeDisplayText,
  normalizeExternalAgentEnvelope,
  stableExternalAgentId,
} from "../domain.mjs";

export const JIRA_WEBHOOK_TRANSPORT = "jira_webhook";
export const JIRA_NATIVE_TRANSPORT = "jira_rovo";

export function normalizeJiraWebhookEvent({ payload, installation, headers = {} }) {
  const issue = record(payload?.issue);
  const fields = record(issue.fields);
  const comment = record(payload?.comment);
  const actor = normalizeJiraActor(payload?.user || payload?.actor || comment.author);
  const issueId = stringValue(issue.id || issue.key);
  const issueKey = stringValue(issue.key);
  const eventType = stringValue(payload?.webhookEvent || payload?.eventType || "jira:issue_updated");
  const commentText = extractAtlassianText(comment.body || payload?.body);
  const appActorId = stringValue(installation?.appActorId);
  if (!issueId || !actor.providerUserId) return null;
  if (actor.isApplication || (appActorId && actor.providerUserId === appActorId)) return null;

  const command = extractComputerAgentsCommand(commentText);
  const mentionIds = collectAtlassianMentionIds(comment.body || payload?.body);
  const mentioned = Boolean(
    command
    || (appActorId && mentionIds.has(appActorId))
    || mentionsConfiguredAlias(commentText, installation?.mentionAliases),
  );
  const assigned = isJiraAssignmentEvent({ payload, fields, appActorId, eventType });
  if (!mentioned && !assigned) return null;
  const trigger = assigned && !mentioned ? "assignment" : command ? "command" : "mention";
  const visibleMessage = normalizeDisplayText(
    command
      || stripConfiguredInvocation(commentText, installation?.mentionAliases)
      || (assigned ? `Please work on ${issueKey || fields.summary || "this Jira issue"}.` : ""),
    50_000,
  );
  if (!visibleMessage) return null;
  // Atlassian keeps this header stable across retries. Including the canonical
  // payload also keeps distinct events separate if a webhook source omits or
  // reuses the header.
  const eventId = stablePayloadId("jira_event", {
    installationId: installation.id,
    webhookIdentifier: readHeader(headers, "x-atlassian-webhook-identifier"),
    payload,
  });
  const tenantId = stringValue(
    payload?.cloudId
    || payload?.tenantId
    || payload?.context?.cloudId
    || installation?.tenantId,
  );
  const projectId = stringValue(fields?.project?.id || fields?.project?.key);
  return normalizeExternalAgentEnvelope({
    eventId,
    provider: "jira",
    transport: JIRA_WEBHOOK_TRANSPORT,
    installationId: installation.id,
    tenantId,
    eventType,
    trigger,
    occurredAt: normalizeJiraTimestamp(payload?.timestamp || comment?.created || payload?.createdAt),
    conversationKey: stableExternalAgentId(
      "jira_conversation",
      installation.id,
      issueId,
    ),
    actor,
    resource: {
      type: "issue",
      id: issueId,
      key: issueKey,
      title: fields.summary,
      url: buildJiraIssueUrl({ payload, installation, issueKey }),
      projectId,
    },
    visibleMessage,
    providerContext: {
      issueId,
      issueKey,
      commentId: stringValue(comment.id),
      projectId,
      webhookEvent: eventType,
    },
  });
}

export function normalizeJiraNativeEvent({ payload, installation, claims = {} }) {
  const params = record(payload?.params || payload?.context || payload);
  const context = record(params.context || params);
  const issue = record(context.issue || params.issue || payload?.issue);
  const actor = normalizeJiraActor(context.user || params.user || claims);
  const issueId = stringValue(issue.id || issue.key || context.issueId);
  const issueKey = stringValue(issue.key || context.issueKey);
  const text = extractAtlassianText(params.message || params.prompt || params.text || payload?.message);
  if (!issueId || !actor.providerUserId || !text) {
    throw new ExternalAgentError(
      400,
      "jira_native_event_invalid",
      "The Jira native invocation is missing its issue, actor, or prompt.",
    );
  }
  return normalizeExternalAgentEnvelope({
    eventId: stringValue(payload?.id || params.taskId || params.invocationId)
      || stablePayloadId("jira_native_event", payload),
    provider: "jira",
    transport: JIRA_NATIVE_TRANSPORT,
    installationId: installation.id,
    tenantId: stringValue(claims.cloudId || claims.tenantId || installation.tenantId),
    eventType: stringValue(payload?.method || params.type || "jira:rovo_invocation"),
    trigger: "mention",
    occurredAt: new Date().toISOString(),
    conversationKey: stableExternalAgentId("jira_conversation", installation.id, issueId),
    actor,
    resource: {
      type: "issue",
      id: issueId,
      key: issueKey,
      title: issue.summary || issue.title,
      url: buildJiraIssueUrl({ payload, installation, issueKey }),
      projectId: issue.projectId || issue.project?.id,
    },
    visibleMessage: text,
    providerContext: {
      taskId: stringValue(params.taskId),
      contextId: stringValue(params.contextId),
      issueId,
      issueKey,
    },
  });
}

export function buildJiraDelivery({ envelope, summary, properties = [] }) {
  const issueIdOrKey = envelope.resource.key || envelope.resource.id;
  if (!issueIdOrKey) {
    throw new ExternalAgentError(400, "jira_delivery_target_missing", "The Jira issue is unavailable.");
  }
  return Object.freeze({
    connectorId: "jira",
    action: "add_comment",
    arguments: Object.freeze({
      issueIdOrKey,
      body: normalizeDisplayText(summary, 30_000),
      ...(Array.isArray(properties) && properties.length ? { properties } : {}),
    }),
  });
}

function normalizeJiraActor(value) {
  const source = record(value);
  return {
    providerUserId: stringValue(
      source.accountId || source.account_id || source.userId || source.sub || source.id,
    ),
    displayName: stringValue(source.displayName || source.name || source.emailAddress),
    email: stringValue(source.emailAddress || source.email),
    isApplication: Boolean(
      source.accountType === "app"
      || source.type === "app"
      || source.isApplication === true,
    ),
  };
}

function extractAtlassianText(value) {
  if (typeof value === "string") return normalizeDisplayText(value, 50_000);
  const parts = [];
  visitAtlassianDocument(value, (node) => {
    if (node.type === "text" && typeof node.text === "string") parts.push(node.text);
    if (node.type === "mention") parts.push(node.attrs?.text || node.attrs?.displayName || "");
    if (["paragraph", "heading", "listItem"].includes(node.type)) parts.push("\n");
  });
  return normalizeDisplayText(parts.join(" ").replace(/\s*\n\s*/g, "\n"), 50_000);
}

function collectAtlassianMentionIds(value) {
  const ids = new Set();
  visitAtlassianDocument(value, (node) => {
    if (node.type !== "mention") return;
    const id = stringValue(node.attrs?.id || node.attrs?.accountId || node.attrs?.userId);
    if (id) ids.add(id);
  });
  return ids;
}

function visitAtlassianDocument(value, visitor) {
  if (!value || typeof value !== "object") return;
  visitor(value);
  for (const child of Array.isArray(value.content) ? value.content : []) {
    visitAtlassianDocument(child, visitor);
  }
}

function extractComputerAgentsCommand(value) {
  const text = String(value || "").trim();
  const match = text.match(/^\/(?:ca|computer-agents)\b[\s:,-]*(.*)$/is);
  return match ? normalizeDisplayText(match[1] || "Please work on this Jira issue.", 50_000) : "";
}

function mentionsConfiguredAlias(text, aliases) {
  const normalized = String(text || "").toLowerCase();
  return (Array.isArray(aliases) ? aliases : ["computer agents"])
    .map((alias) => String(alias || "").trim().toLowerCase().replace(/^@+/, ""))
    .filter(Boolean)
    .some((alias) => normalized.includes(`@${alias}`));
}

function stripConfiguredInvocation(text, aliases) {
  let result = String(text || "");
  for (const alias of Array.isArray(aliases) ? aliases : ["computer agents"]) {
    const normalizedAlias = String(alias || "").trim().replace(/^@+/, "");
    if (!normalizedAlias) continue;
    const escapedAlias = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`(^|\\s)@${escapedAlias}(?=\\s|[,:;.!?]|$)`, "gi"),
      "$1",
    );
  }
  return normalizeDisplayText(result.replace(/^[\s,:;.!?-]+/, ""), 50_000);
}

function isJiraAssignmentEvent({ payload, fields, appActorId, eventType }) {
  if (!appActorId || !/issue_(?:updated|assigned)|issue:updated|issue:assigned/i.test(eventType)) return false;
  const assignmentChanged = (Array.isArray(payload?.changelog?.items) ? payload.changelog.items : []).some((item) => (
    item?.field === "assignee" && stringValue(item?.to || item?.toString) === appActorId
  ));
  if (assignmentChanged) return true;
  return /issue_(?:assigned)|issue:assigned/i.test(eventType)
    && stringValue(fields?.assignee?.accountId) === appActorId;
}

function buildJiraIssueUrl({ payload, installation, issueKey }) {
  const explicit = stringValue(payload?.issue?.self || payload?.issueUrl);
  if (explicit && /^https?:\/\//i.test(explicit)) return explicit;
  const siteUrl = stringValue(installation?.siteUrl).replace(/\/+$/, "");
  return siteUrl && issueKey ? `${siteUrl}/browse/${encodeURIComponent(issueKey)}` : "";
}

function normalizeJiraTimestamp(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Date(numeric > 10_000_000_000 ? numeric : numeric * 1_000).toISOString();
  }
  return value || new Date().toISOString();
}

function stablePayloadId(prefix, payload) {
  const digest = createHash("sha256").update(stableJson(payload)).digest("base64url").slice(0, 24);
  return `${prefix}_${digest}`;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

function readHeader(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? stringValue(value[0]) : stringValue(value);
}

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function stringValue(value) {
  return String(value || "").trim();
}
