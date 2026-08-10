import path from "node:path";

import { ExternalAgentError, sanitizeExternalAgentRecord } from "./domain.mjs";
import { createExternalAgentDeliveryService } from "./delivery.mjs";
import { createExternalAgentGateway } from "./gateway.mjs";
import {
  createExternalAgentManagementController,
  EXTERNAL_AGENT_MANAGEMENT_BASE_PATH,
} from "./management.mjs";
import { createExternalAgentMembershipService } from "./membership.mjs";
import { createExternalAgentPolicy } from "./policy.mjs";
import {
  JIRA_NATIVE_TRANSPORT,
  normalizeJiraNativeEvent,
  normalizeJiraWebhookEvent,
} from "./providers/jira.mjs";
import {
  isLinearNativePayload,
  LINEAR_NATIVE_TRANSPORT,
  normalizeLinearNativeEvent,
  normalizeLinearWebhookEvent,
} from "./providers/linear.mjs";
import { createFileExternalAgentRepository } from "./repository.mjs";
import { createExternalAgentThreadInvoker } from "./thread-invoker.mjs";
import {
  resolveInstallationSecret,
  verifyBearerWebhookToken,
  verifyLinearWebhookSignature,
  verifyNativeBearerJwt,
} from "./verification.mjs";

const WEBHOOK_ROUTE = /^\/api\/integrations\/external-agents\/(webhooks|native)\/(jira|linear)\/([^/]+)\/?$/;
const MAX_WEBHOOK_BYTES = 1024 * 1024;

export function createExternalAgentService({
  identityService,
  fetchOrganizationApi,
  upstreamOrigin,
  platformOrigin = "",
  encryptionKey,
  resolveExecutionApiKey = defaultExecutionApiKeyResolver,
  connectorRuntimeBridge,
  adapterRegistry,
  enrichThreadPayload,
  sendJson,
  fetchImpl = globalThis.fetch,
  repository = createFileExternalAgentRepository({
    storePath: process.env.EXTERNAL_AGENT_STORE_PATH
      || path.join(process.cwd(), ".platform-data", "external-agents.json"),
  }),
  membershipService,
  policy,
  threadInvoker,
  deliveryService,
  gateway,
  logger = console,
  nativeTransports = readNativeTransportFlags(),
} = {}) {
  if (typeof sendJson !== "function") {
    throw new TypeError("External-agent service requires sendJson.");
  }
  const effectiveEncryptionKey = String(
    encryptionKey || process.env.EXTERNAL_AGENT_WEBHOOK_ENCRYPTION_KEY || "",
  ).trim();
  const effectiveMembership = membershipService || createExternalAgentMembershipService({
    identityService,
    fetchOrganizationApi,
    upstreamOrigin,
    resolveExecutionApiKey,
    fetchImpl,
  });
  const effectivePolicy = policy || createExternalAgentPolicy({
    resolveOrganizationMembers: effectiveMembership.resolveOrganizationMembers,
    logger,
  });
  const effectiveThreadInvoker = threadInvoker || createExternalAgentThreadInvoker({
    upstreamOrigin,
    resolveApiKey: resolveExecutionApiKey,
    connectorRuntimeBridge,
    adapterRegistry,
    enrichThreadPayload,
    fetchImpl,
    logger,
  });
  const effectiveDelivery = deliveryService || createExternalAgentDeliveryService({
    adapterRegistry,
    platformOrigin,
    logger,
  });
  const effectiveGateway = gateway || createExternalAgentGateway({
    repository,
    policy: effectivePolicy,
    threadInvoker: effectiveThreadInvoker,
    deliveryService: effectiveDelivery,
    logger,
  });
  const management = createExternalAgentManagementController({
    repository,
    gateway: effectiveGateway,
    membershipService: effectiveMembership,
    adapterRegistry,
    encryptionKey: effectiveEncryptionKey,
    platformOrigin,
    nativeTransports,
  });

  function handleRequest(req, res, url) {
    if (!String(url?.pathname || "").startsWith(`${EXTERNAL_AGENT_MANAGEMENT_BASE_PATH}/`)) {
      return false;
    }
    void dispatchRequest(req, res, url).catch((error) => {
      sendExternalAgentError({ error, res, sendJson, logger });
    });
    return true;
  }

  async function dispatchRequest(req, res, url) {
    const webhook = matchWebhookRoute(url.pathname);
    if (webhook) {
      await handleWebhook({ req, res, url, webhook });
      return;
    }
    const result = await management.handle(req, url);
    if (!result) {
      sendJson(res, 404, {
        error: "external_agent_route_not_found",
        message: "The external-agent integration route was not found.",
      });
      return;
    }
    writeControllerResponse(res, result, sendJson);
  }

  async function handleWebhook({ req, res, url, webhook }) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { Allow: "POST, OPTIONS", "Cache-Control": "no-store" });
      res.end();
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, {
        error: "method_not_allowed",
        message: "External-agent webhooks only accept POST requests.",
      }, { Allow: "POST, OPTIONS" });
      return;
    }
    const snapshot = await repository.snapshot();
    const installation = snapshot.installations.find((candidate) => (
      candidate.id === webhook.installationId
      && candidate.provider === webhook.provider
      && candidate.enabled !== false
    ));
    if (!installation) {
      throw new ExternalAgentError(404, "external_installation_not_found", "The installation was not found.");
    }
    if (webhook.native && !installation.nativeTransportEnabled) {
      throw new ExternalAgentError(403, "native_transport_disabled", "Native provider invocation is disabled.");
    }
    const rawBody = await readRawBody(req, MAX_WEBHOOK_BYTES);
    const payload = parseJsonBody(rawBody);
    const secret = webhook.provider === "jira" && webhook.native
      ? ""
      : resolveInstallationSecret({
          installation,
          encryptionKey: effectiveEncryptionKey,
        });
    let envelope;
    if (webhook.provider === "jira") {
      if (webhook.native) {
        const claims = await verifyNativeBearerJwt({
          authorization: readHeader(req, "authorization"),
          issuer: process.env.EXTERNAL_AGENT_JIRA_NATIVE_ISSUER,
          audience: process.env.EXTERNAL_AGENT_JIRA_NATIVE_AUDIENCE,
          jwksUrl: process.env.EXTERNAL_AGENT_JIRA_NATIVE_JWKS_URL,
        });
        envelope = normalizeJiraNativeEvent({ payload, installation, claims });
      } else {
        verifyBearerWebhookToken({
          actual: readWebhookToken(req, url),
          expected: secret,
        });
        envelope = normalizeJiraWebhookEvent({ payload, installation, headers: req.headers });
      }
    } else {
      verifyLinearWebhookSignature({
        rawBody,
        signature: readHeader(req, "linear-signature") || readHeader(req, "x-linear-signature"),
        secret,
        timestamp: payload?.webhookTimestamp || readHeader(req, "linear-timestamp"),
      });
      const nativePayload = webhook.native || isLinearNativePayload(payload);
      if (nativePayload && !installation.nativeTransportEnabled) {
        throw new ExternalAgentError(403, "native_transport_disabled", "Native provider invocation is disabled.");
      }
      envelope = nativePayload
        ? normalizeLinearNativeEvent({ payload, installation })
        : normalizeLinearWebhookEvent({ payload, installation, headers: req.headers });
    }
    if (!envelope) {
      sendJson(res, 202, { accepted: false, ignored: true });
      return;
    }
    const result = await effectiveGateway.ingest(envelope);
    sendJson(res, 202, {
      accepted: true,
      duplicate: result.duplicate,
      eventId: result.event.id,
      providerEventId: envelope.eventId,
    });
  }

  return Object.freeze({
    gateway: effectiveGateway,
    handleRequest,
    repository,
    start: () => effectiveGateway.start(),
    stop: (options) => effectiveGateway.stop(options),
  });
}

function matchWebhookRoute(pathname) {
  const match = WEBHOOK_ROUTE.exec(String(pathname || ""));
  if (!match) return null;
  return Object.freeze({
    native: match[1] === "native",
    provider: match[2],
    installationId: decodeURIComponent(match[3]),
  });
}

async function readRawBody(req, maximumBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maximumBytes) {
      throw new ExternalAgentError(413, "request_too_large", "The webhook payload is too large.");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseJsonBody(rawBody) {
  try {
    return rawBody.length ? JSON.parse(rawBody.toString("utf8")) : {};
  } catch {
    throw new ExternalAgentError(400, "invalid_json", "The webhook body must contain valid JSON.");
  }
}

function readWebhookToken(req, url) {
  const bearer = readHeader(req, "authorization").match(/^Bearer\s+(.+)$/i)?.[1] || "";
  return bearer
    || readHeader(req, "x-computer-agents-webhook-secret")
    || String(url.searchParams.get("token") || "").trim();
}

function readHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim();
}

function writeControllerResponse(res, result, sendJson) {
  if (result.status === 204) {
    res.writeHead(204, { "Cache-Control": "no-store", ...(result.headers || {}) });
    res.end();
    return;
  }
  sendJson(res, result.status, result.body, result.headers);
}

function sendExternalAgentError({ error, res, sendJson, logger }) {
  const expected = error instanceof ExternalAgentError;
  const status = expected ? Number(error.statusCode) || 500 : 500;
  if (!expected) logger?.error?.("[external-agents] Request failed", error);
  sendJson(res, status, {
    error: expected ? error.code : "external_agent_internal_error",
    message: expected ? error.message : "The external-agent request failed.",
    ...(expected && error.details ? { details: sanitizeExternalAgentRecord(error.details) } : {}),
  });
}

function readNativeTransportFlags() {
  return Object.freeze({
    jira: process.env.EXTERNAL_AGENT_JIRA_ROVO_ENABLED === "true",
    linear: process.env.EXTERNAL_AGENT_LINEAR_NATIVE_ENABLED === "true",
  });
}

function defaultExecutionApiKeyResolver() {
  return process.env.EXTERNAL_AGENT_RUNNER_API_KEY
    || process.env.PLATFORM_RUNNER_API_KEY
    || process.env.RUNNER_API_KEY
    || process.env.AIOS_API_KEY
    || "";
}

export const EXTERNAL_AGENT_WEBHOOK_TRANSPORTS = Object.freeze({
  jira: Object.freeze(["jira_webhook", JIRA_NATIVE_TRANSPORT]),
  linear: Object.freeze(["linear_webhook", LINEAR_NATIVE_TRANSPORT]),
});
