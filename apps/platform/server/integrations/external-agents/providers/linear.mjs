import { createHash } from "node:crypto";

import {
  ExternalAgentError,
  normalizeDisplayText,
  normalizeExternalAgentEnvelope,
  stableExternalAgentId,
} from "../domain.mjs";

export const LINEAR_WEBHOOK_TRANSPORT = "linear_webhook";
export const LINEAR_NATIVE_TRANSPORT = "linear_agent";

export function normalizeLinearWebhookEvent({ payload, installation, headers = {} }) {
  const data = record(payload?.data);
  const issue = resolveLinearIssue(payload);
  const actor = normalizeLinearActor(payload?.actor || payload?.user || data.user || data.creator);
  const issueId = stringValue(issue.id || data.issueId);
  const issueIdentifier = stringValue(issue.identifier || issue.key);
  const body = normalizeDisplayText(data.body || data.content || payload?.body || payload?.message, 50_000);
  const eventType = `${stringValue(payload?.type || "Issue")}:${stringValue(payload?.action || "update")}`;
  const appActorId = stringValue(installation?.appActorId);
  if (!issueId || !actor.providerUserId) return null;
  if (actor.isApplication || (appActorId && actor.providerUserId === appActorId)) return null;

  const command = extractComputerAgentsCommand(body);
  const mentioned = Boolean(
    command
    || collectLinearMentionIds(payload).has(appActorId)
    || mentionsConfiguredAlias(body, installation?.mentionAliases),
  );
  const assigned = isLinearAssignmentEvent({ payload, issue, appActorId });
  if (!mentioned && !assigned) return null;
  const trigger = assigned && !mentioned ? "assignment" : command ? "command" : "mention";
  const visibleMessage = command
    || stripConfiguredInvocation(body, installation?.mentionAliases)
    || `Please work on ${issueIdentifier || issue.title || "this Linear issue"}.`;
  const eventId = readHeader(headers, "linear-delivery")
    || stringValue(payload?.id || payload?.webhookId)
    || stablePayloadId("linear_event", payload);
  const tenantId = stringValue(
    payload?.organizationId || payload?.organization?.id || installation?.tenantId,
  );
  const teamId = stringValue(issue?.team?.id || issue?.teamId || data?.teamId);
  return normalizeExternalAgentEnvelope({
    eventId,
    provider: "linear",
    transport: LINEAR_WEBHOOK_TRANSPORT,
    installationId: installation.id,
    tenantId,
    eventType,
    trigger,
    occurredAt: payload?.webhookTimestamp || payload?.createdAt || data?.createdAt,
    conversationKey: stableExternalAgentId(
      "linear_conversation",
      installation.id,
      issueId,
    ),
    actor,
    resource: {
      type: "issue",
      id: issueId,
      key: issueIdentifier,
      title: issue.title,
      url: issue.url,
      projectId: stringValue(issue?.project?.id || issue?.projectId || teamId),
    },
    visibleMessage,
    providerContext: {
      issueId,
      issueIdentifier,
      commentId: String(data.id || ""),
      teamId,
      webhookAction: payload?.action,
      webhookType: payload?.type,
    },
  });
}

export function normalizeLinearNativeEvent({ payload, installation }) {
  const data = record(payload?.data);
  const issue = resolveLinearIssue(payload);
  const actor = normalizeLinearActor(payload?.actor || data.user || data.creator);
  const issueId = stringValue(issue.id || data.issueId);
  const message = normalizeDisplayText(
    data.prompt || data.message || data.body || payload?.prompt || payload?.message,
    50_000,
  );
  if (!issueId || !actor.providerUserId || !message) {
    throw new ExternalAgentError(
      400,
      "linear_native_event_invalid",
      "The Linear agent invocation is missing its issue, actor, or prompt.",
    );
  }
  return normalizeExternalAgentEnvelope({
    eventId: stringValue(payload?.id || data.agentSessionId || data.activityId)
      || stablePayloadId("linear_native_event", payload),
    provider: "linear",
    transport: LINEAR_NATIVE_TRANSPORT,
    installationId: installation.id,
    tenantId: stringValue(payload?.organizationId || installation.tenantId),
    eventType: `${stringValue(payload?.type || "AgentSession")}:${stringValue(payload?.action || "created")}`,
    trigger: "mention",
    occurredAt: payload?.webhookTimestamp || payload?.createdAt,
    conversationKey: stableExternalAgentId("linear_conversation", installation.id, issueId),
    actor,
    resource: {
      type: "issue",
      id: issueId,
      key: issue.identifier,
      title: issue.title,
      url: issue.url,
      projectId: issue.project?.id || issue.projectId || issue.team?.id,
    },
    visibleMessage: message,
    providerContext: {
      agentSessionId: stringValue(data.agentSessionId),
      activityId: stringValue(data.activityId),
      issueId,
    },
  });
}

export function isLinearNativePayload(payload) {
  return /agent(?:session|activity)/i.test(String(payload?.type || ""))
    || Boolean(payload?.data?.agentSessionId);
}

export function buildLinearDelivery({ envelope, summary }) {
  if (!envelope.resource.id) {
    throw new ExternalAgentError(400, "linear_delivery_target_missing", "The Linear issue is unavailable.");
  }
  return Object.freeze({
    connectorId: "linear",
    action: "add_issue_comment",
    arguments: Object.freeze({
      issueId: envelope.resource.id,
      body: normalizeDisplayText(summary, 30_000),
    }),
  });
}

function resolveLinearIssue(payload) {
  const data = record(payload?.data);
  return record(data.issue || payload?.issue || (/issue/i.test(String(payload?.type || "")) ? data : {}));
}

function normalizeLinearActor(value) {
  const source = record(value);
  return {
    providerUserId: stringValue(source.id || source.userId || source.sub),
    displayName: stringValue(source.name || source.displayName || source.email),
    email: stringValue(source.email),
    isApplication: Boolean(
      source.type === "application"
      || source.type === "app"
      || source.isBot === true
      || source.isApplication === true,
    ),
  };
}

function collectLinearMentionIds(value) {
  const ids = new Set();
  const visit = (entry, depth = 0) => {
    if (!entry || depth > 6) return;
    if (Array.isArray(entry)) {
      for (const item of entry.slice(0, 100)) visit(item, depth + 1);
      return;
    }
    if (typeof entry !== "object") return;
    if (/mention/i.test(String(entry.type || entry.kind || ""))) {
      const id = stringValue(entry.id || entry.userId || entry.actorId);
      if (id) ids.add(id);
    }
    for (const nested of Object.values(entry)) visit(nested, depth + 1);
  };
  visit(value);
  return ids;
}

function isLinearAssignmentEvent({ payload, issue, appActorId }) {
  if (!appActorId || !/issue/i.test(String(payload?.type || ""))) return false;
  const assigneeId = stringValue(
    issue?.assignee?.id || issue?.assigneeId || payload?.data?.assignee?.id || payload?.data?.assigneeId,
  );
  if (assigneeId !== appActorId) return false;
  const action = String(payload?.action || "");
  if (/create/i.test(action)) return true;
  const updatedFrom = record(payload?.updatedFrom || payload?.data?.updatedFrom);
  return /update/i.test(action) && (
    Object.hasOwn(updatedFrom, "assigneeId")
    || Object.hasOwn(updatedFrom, "assignee")
  );
}

function extractComputerAgentsCommand(value) {
  const text = String(value || "").trim();
  const match = text.match(/^\/(?:ca|computer-agents)\b[\s:,-]*(.*)$/is);
  return match ? normalizeDisplayText(match[1] || "Please work on this Linear issue.", 50_000) : "";
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
