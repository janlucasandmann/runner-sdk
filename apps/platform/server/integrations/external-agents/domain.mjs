import { createHash, randomBytes } from "node:crypto";

export const EXTERNAL_AGENT_SCHEMA_VERSION = 1;
export const EXTERNAL_AGENT_PROVIDERS = Object.freeze(["jira", "linear"]);
export const EXTERNAL_AGENT_EVENT_STATUSES = Object.freeze([
  "pending",
  "processing",
  "completed",
  "failed",
  "denied",
]);

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,299}$/;
const TRIGGERS = new Set(["mention", "assignment", "command"]);

export class ExternalAgentError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = "ExternalAgentError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export function createExternalAgentId(prefix) {
  const normalizedPrefix = normalizeIdentifier(prefix, "external").replace(/[^A-Za-z0-9_]/g, "_");
  return `${normalizedPrefix}_${randomBytes(12).toString("base64url")}`;
}

export function stableExternalAgentId(prefix, ...parts) {
  const digest = createHash("sha256")
    .update(parts.map((part) => String(part || "")).join("\u001f"))
    .digest("base64url")
    .slice(0, 24);
  return `${normalizeIdentifier(prefix, "external")}_${digest}`;
}

export function normalizeIdentifier(value, fallback = "") {
  const normalized = String(value || "").trim();
  if (!normalized) return fallback;
  if (!IDENTIFIER_PATTERN.test(normalized)) return "";
  return normalized;
}

export function normalizeExternalAgentProvider(value) {
  const provider = String(value || "").trim().toLowerCase();
  return EXTERNAL_AGENT_PROVIDERS.includes(provider) ? provider : "";
}

export function normalizeExternalAgentTrigger(value, fallback = "mention") {
  const trigger = String(value || "").trim().toLowerCase();
  return TRIGGERS.has(trigger) ? trigger : fallback;
}

export function normalizeDisplayText(value, maximum = 10_000) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maximum);
}

export function normalizeIsoDate(value, fallback = new Date().toISOString()) {
  const parsed = new Date(String(value || ""));
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : fallback;
}

export function normalizeExternalAgentEnvelope(value) {
  if (!isRecord(value)) {
    throw new ExternalAgentError(400, "external_event_invalid", "The external event is invalid.");
  }
  const provider = normalizeExternalAgentProvider(value.provider);
  const eventId = normalizeIdentifier(value.eventId);
  const installationId = normalizeIdentifier(value.installationId);
  const tenantId = normalizeIdentifier(value.tenantId);
  const conversationKey = normalizeIdentifier(value.conversationKey);
  const actor = normalizeActor(value.actor);
  const resource = normalizeResource(value.resource);
  const visibleMessage = normalizeDisplayText(value.visibleMessage, 50_000);
  if (
    !provider
    || !eventId
    || !installationId
    || !tenantId
    || !conversationKey
    || !actor.providerUserId
    || !resource.id
    || !visibleMessage
  ) {
    throw new ExternalAgentError(
      400,
      "external_event_incomplete",
      "The external event is missing required canonical fields.",
    );
  }
  return Object.freeze({
    schemaVersion: EXTERNAL_AGENT_SCHEMA_VERSION,
    eventId,
    provider,
    transport: normalizeIdentifier(value.transport),
    installationId,
    tenantId,
    eventType: normalizeIdentifier(value.eventType, "message"),
    trigger: normalizeExternalAgentTrigger(value.trigger),
    occurredAt: normalizeIsoDate(value.occurredAt),
    conversationKey,
    actor: Object.freeze(actor),
    resource: Object.freeze(resource),
    visibleMessage,
    providerContext: Object.freeze(sanitizeJsonRecord(value.providerContext)),
  });
}

export function buildExternalAgentExecutionContent({ envelope, binding, identity }) {
  const lines = [
    envelope.visibleMessage,
    "",
    "[External service invocation context - hidden from the requester]",
    `Provider: ${envelope.provider}`,
    `External event: ${envelope.eventType}`,
    `External resource: ${envelope.resource.key || envelope.resource.id}`,
    envelope.resource.title ? `Resource title: ${envelope.resource.title}` : "",
    envelope.resource.url ? `Resource URL: ${envelope.resource.url}` : "",
    `External actor ID: ${envelope.actor.providerUserId}`,
    identity?.platformUserId ? `Linked platform user ID: ${identity.platformUserId}` : "",
    binding.projectId ? `Platform project ID: ${binding.projectId}` : "",
    "Use the authenticated provider connector for authoritative context and updates when relevant.",
    "Do not ask the requester to copy issue data that can be read through the connector.",
    "Do not send the provider reply yourself. The platform automatically delivers the final run summary.",
    "Produce a concise, professional final summary suitable for posting back to the external work item.",
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildExternalAgentThreadMetadata({ envelope, binding, identity }) {
  return {
    origin: "external_agent",
    externalAgent: {
      schemaVersion: EXTERNAL_AGENT_SCHEMA_VERSION,
      provider: envelope.provider,
      transport: envelope.transport,
      installationId: envelope.installationId,
      bindingId: binding.id,
      tenantId: envelope.tenantId,
      conversationKey: envelope.conversationKey,
      eventId: envelope.eventId,
      externalActorId: envelope.actor.providerUserId,
      linkedPlatformUserId: identity?.platformUserId || "",
      resourceType: envelope.resource.type,
      resourceId: envelope.resource.id,
      resourceKey: envelope.resource.key || "",
      resourceUrl: envelope.resource.url || "",
    },
  };
}

export function sanitizeExternalAgentRecord(value) {
  if (Array.isArray(value)) return value.map(sanitizeExternalAgentRecord);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    if (/secret|token|authorization|rawPayload|rawBody/i.test(key)) return [];
    return [[key, sanitizeExternalAgentRecord(entry)]];
  }));
}

export function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeActor(value) {
  const source = isRecord(value) ? value : {};
  return {
    providerUserId: normalizeIdentifier(source.providerUserId),
    displayName: normalizeDisplayText(source.displayName, 200),
    email: normalizeEmail(source.email),
    isApplication: source.isApplication === true,
  };
}

function normalizeResource(value) {
  const source = isRecord(value) ? value : {};
  const type = ["issue", "task"].includes(source.type) ? source.type : "issue";
  return {
    type,
    id: normalizeIdentifier(source.id),
    key: normalizeIdentifier(source.key),
    title: normalizeDisplayText(source.title, 500),
    url: normalizeUrl(source.url),
    projectId: normalizeIdentifier(source.projectId),
  };
}

function normalizeEmail(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized.slice(0, 320) : "";
}

function normalizeUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.toString().slice(0, 2_000) : "";
  } catch {
    return "";
  }
}

function sanitizeJsonRecord(value, depth = 0) {
  if (!isRecord(value) || depth > 5) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 100).flatMap(([key, entry]) => {
    const normalizedKey = normalizeDisplayText(key, 100);
    if (!normalizedKey || /secret|token|authorization|cookie/i.test(normalizedKey)) return [];
    if (isRecord(entry)) return [[normalizedKey, sanitizeJsonRecord(entry, depth + 1)]];
    if (Array.isArray(entry)) {
      return [[normalizedKey, entry.slice(0, 100).map((item) => (
        isRecord(item) ? sanitizeJsonRecord(item, depth + 1) : normalizeDisplayText(item, 2_000)
      ))]];
    }
    if (typeof entry === "boolean" || typeof entry === "number") return [[normalizedKey, entry]];
    return [[normalizedKey, normalizeDisplayText(entry, 2_000)]];
  }));
}
