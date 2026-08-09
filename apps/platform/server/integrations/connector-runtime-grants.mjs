import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import { getConnectorRuntimeEnvValue } from "./connector-oauth-core.mjs";
import {
  canonicalizeConnectorId,
  getConnectorCredentialProviderId,
} from "./connector-identity.mjs";

const GRANT_VERSION = 1;
const GRANT_TYPE = "connector_runtime";
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_GRANT_LENGTH = 64 * 1024;

export class ConnectorRuntimeGrantError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ConnectorRuntimeGrantError";
    this.code = code;
    this.statusCode = 401;
  }
}

export function createConnectorRuntimeGrantService({
  secret = "",
  envFileCandidates = [],
  now = () => Date.now(),
  ttlMs = DEFAULT_TTL_MS,
} = {}) {
  let signingSecretPromise;

  async function getSigningSecret() {
    if (!signingSecretPromise) {
      signingSecretPromise = resolveSigningSecret({
        secret,
        envFileCandidates,
      });
    }
    return signingSecretPromise;
  }

  async function issue(input) {
    const issuedAt = Math.floor(now() / 1000);
    const lifetimeSeconds = Math.max(
      60,
      Math.min(24 * 60 * 60, Math.floor(Number(ttlMs) / 1000)),
    );
    const payload = normalizeGrantPayload({
      ...input,
      version: GRANT_VERSION,
      type: GRANT_TYPE,
      issuedAt,
      expiresAt: issuedAt + lifetimeSeconds,
      grantId: randomUUID(),
    });
    const encodedPayload = encodeBase64Url(
      Buffer.from(JSON.stringify(payload), "utf8"),
    );
    const signature = sign(encodedPayload, await getSigningSecret());
    return `${encodedPayload}.${signature}`;
  }

  async function verify(token) {
    const normalizedToken = String(token || "").trim();
    if (
      !normalizedToken
      || normalizedToken.length > MAX_GRANT_LENGTH
      || !normalizedToken.includes(".")
    ) {
      throw invalidGrant("connector_runtime_grant_invalid");
    }
    const [encodedPayload, encodedSignature, ...extra] =
      normalizedToken.split(".");
    if (!encodedPayload || !encodedSignature || extra.length) {
      throw invalidGrant("connector_runtime_grant_invalid");
    }
    const expectedSignature = sign(
      encodedPayload,
      await getSigningSecret(),
    );
    const actualBuffer = Buffer.from(encodedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      actualBuffer.length !== expectedBuffer.length
      || !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw invalidGrant("connector_runtime_grant_signature_invalid");
    }
    let decoded;
    try {
      decoded = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8"),
      );
    } catch {
      throw invalidGrant("connector_runtime_grant_invalid");
    }
    const payload = normalizeGrantPayload(decoded);
    if (
      payload.version !== GRANT_VERSION
      || payload.type !== GRANT_TYPE
    ) {
      throw invalidGrant("connector_runtime_grant_version_invalid");
    }
    const currentTime = Math.floor(now() / 1000);
    if (
      payload.issuedAt > currentTime + 60
      || payload.expiresAt <= currentTime
    ) {
      throw invalidGrant("connector_runtime_grant_expired");
    }
    return payload;
  }

  return Object.freeze({ issue, verify });
}

async function resolveSigningSecret({ secret, envFileCandidates }) {
  const configured = String(secret || "").trim()
    || await getConnectorRuntimeEnvValue(
      "CONNECTOR_RUNTIME_SIGNING_KEY",
      envFileCandidates,
    )
    || await getConnectorRuntimeEnvValue(
      "CONNECTOR_TOKEN_ENCRYPTION_KEY",
      envFileCandidates,
    )
    || await getConnectorRuntimeEnvValue(
      "GITHUB_TOKEN_ENCRYPTION_KEY",
      envFileCandidates,
    );
  if (configured.length < 32) {
    throw new Error(
      "Connector runtime grants require a signing key of at least 32 characters.",
    );
  }
  return configured;
}

function normalizeGrantPayload(value) {
  const input = isRecord(value) ? value : {};
  const payload = {
    version: Number(input.version || input.v),
    type: String(input.type || input.typ || "").trim(),
    grantId: normalizeIdentifier(input.grantId || input.jti, 120),
    threadId: normalizeIdentifier(input.threadId, 200),
    connectorId: canonicalizeConnectorId(input.connectorId),
    provider: getConnectorCredentialProviderId(
      input.provider || input.connectorId,
    ),
    organizationId: normalizeIdentifier(input.organizationId, 200),
    agentId: normalizeOptionalIdentifier(input.agentId, 200),
    agentName: normalizeDisplayName(input.agentName),
    actorUserId: normalizeOptionalIdentifier(input.actorUserId, 200),
    credentialId: normalizeIdentifier(input.credentialId, 120),
    credentialSource: normalizeCredentialSource(
      input.credentialSource
      || input.credentialResolution?.source,
    ),
    projectId: normalizeOptionalIdentifier(
      input.projectId || input.credentialResolution?.projectId,
      200,
    ),
    allowedActions: normalizeActionList(input.allowedActions),
    approvalRequiredActions: normalizeActionList(
      input.approvalRequiredActions,
    ),
    policyVersion: Math.max(1, Number(input.policyVersion || 1) || 1),
    issuedAt: Number(input.issuedAt || input.iat),
    expiresAt: Number(input.expiresAt || input.exp),
  };
  for (const field of [
    "grantId",
    "threadId",
    "connectorId",
    "provider",
    "organizationId",
    "credentialId",
    "credentialSource",
  ]) {
    if (!payload[field]) throw invalidGrant("connector_runtime_grant_invalid");
  }
  if (
    !Number.isSafeInteger(payload.issuedAt)
    || !Number.isSafeInteger(payload.expiresAt)
    || payload.expiresAt <= payload.issuedAt
  ) {
    throw invalidGrant("connector_runtime_grant_invalid");
  }
  if (
    !payload.allowedActions.length
    && !payload.approvalRequiredActions.length
  ) {
    throw invalidGrant("connector_runtime_grant_actions_required");
  }
  return Object.freeze({
    ...payload,
    allowedActions: Object.freeze(payload.allowedActions),
    approvalRequiredActions: Object.freeze(
      payload.approvalRequiredActions,
    ),
  });
}

function normalizeActionList(value) {
  const items = Array.isArray(value) ? value : [];
  return [...new Set(
    items
      .map((item) => String(item || "").trim())
      .filter((item) => /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(item)),
  )].slice(0, 300);
}

function normalizeIdentifier(value, maximumLength) {
  const normalized = String(value || "").trim();
  if (
    !normalized
    || normalized.length > maximumLength
    || !/^[A-Za-z0-9_:@./-]+$/.test(normalized)
  ) {
    return "";
  }
  return normalized;
}

function normalizeOptionalIdentifier(value, maximumLength) {
  if (!value) return "";
  return normalizeIdentifier(value, maximumLength);
}

function normalizeDisplayName(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function normalizeCredentialSource(value) {
  const normalized = String(value || "").trim();
  return [
    "explicit",
    "project",
    "organization_default",
  ].includes(normalized)
    ? normalized
    : "";
}

function sign(encodedPayload, secret) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function invalidGrant(code) {
  return new ConnectorRuntimeGrantError(
    code,
    "The connector runtime grant is invalid or expired.",
  );
}

function isRecord(value) {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value);
}
