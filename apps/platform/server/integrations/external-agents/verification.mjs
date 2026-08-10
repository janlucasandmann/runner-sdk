import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { ExternalAgentError } from "./domain.mjs";

const SEALED_SECRET_VERSION = 1;
const DEFAULT_SIGNATURE_TOLERANCE_MS = 60 * 1_000;

export function createWebhookSecret() {
  return randomBytes(32).toString("base64url");
}

export function sealWebhookSecret(secret, encryptionKey) {
  const value = String(secret || "").trim();
  if (!value) {
    throw new ExternalAgentError(400, "webhook_secret_required", "A webhook secret is required.");
  }
  const key = deriveEncryptionKey(encryptionKey);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Object.freeze({
    version: SEALED_SECRET_VERSION,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  });
}

export function openWebhookSecret(sealed, encryptionKey) {
  if (!sealed || sealed.version !== SEALED_SECRET_VERSION || sealed.algorithm !== "aes-256-gcm") {
    throw new ExternalAgentError(
      500,
      "webhook_secret_unavailable",
      "The webhook verification secret is unavailable.",
    );
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveEncryptionKey(encryptionKey),
      Buffer.from(String(sealed.iv || ""), "base64url"),
    );
    decipher.setAuthTag(Buffer.from(String(sealed.tag || ""), "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(String(sealed.ciphertext || ""), "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch (cause) {
    throw new ExternalAgentError(
      500,
      "webhook_secret_unavailable",
      "The webhook verification secret could not be opened.",
      { cause: cause instanceof Error ? cause.message : String(cause) },
    );
  }
}

export function resolveInstallationSecret({ installation, encryptionKey, env = process.env }) {
  const secretRef = String(installation?.secretRef || "").trim();
  if (secretRef) {
    const referenced = String(env[secretRef] || "").trim();
    if (!referenced) {
      throw new ExternalAgentError(
        500,
        "webhook_secret_reference_missing",
        `The configured webhook secret reference ${secretRef} is unavailable.`,
      );
    }
    return referenced;
  }
  return openWebhookSecret(installation?.webhookSecret, encryptionKey);
}

export function verifyBearerWebhookToken({ actual, expected }) {
  if (!safeEqual(actual, expected)) {
    throw new ExternalAgentError(401, "webhook_signature_invalid", "Webhook verification failed.");
  }
}

export function verifyLinearWebhookSignature({
  rawBody,
  signature,
  secret,
  timestamp,
  now = Date.now(),
  toleranceMs = DEFAULT_SIGNATURE_TOLERANCE_MS,
}) {
  const signatureValue = String(signature || "").trim().toLowerCase();
  const expected = createHmac("sha256", String(secret || ""))
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || ""))
    .digest("hex");
  if (!safeEqual(signatureValue, expected)) {
    throw new ExternalAgentError(401, "webhook_signature_invalid", "Linear webhook verification failed.");
  }
  if (timestamp !== undefined && timestamp !== null && String(timestamp).trim()) {
    const numeric = Number(timestamp);
    const timestampMs = numeric > 10_000_000_000 ? numeric : numeric * 1_000;
    if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > toleranceMs) {
      throw new ExternalAgentError(401, "webhook_timestamp_invalid", "The Linear webhook is stale.");
    }
  }
}

export async function verifyNativeBearerJwt({
  authorization,
  issuer,
  audience,
  jwksUrl,
}) {
  const bearer = String(authorization || "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  if (!bearer || !issuer || !audience || !jwksUrl) {
    throw new ExternalAgentError(
      401,
      "native_transport_authentication_invalid",
      "Native transport authentication is not configured.",
    );
  }
  try {
    const jwks = createRemoteJWKSet(new URL(jwksUrl));
    const verified = await jwtVerify(bearer, jwks, {
      issuer,
      audience,
      clockTolerance: 30,
    });
    return verified.payload;
  } catch (cause) {
    throw new ExternalAgentError(
      401,
      "native_transport_authentication_invalid",
      "Native transport authentication failed.",
      { cause: cause instanceof Error ? cause.message : String(cause) },
    );
  }
}

function deriveEncryptionKey(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new ExternalAgentError(
      500,
      "webhook_encryption_key_missing",
      "External-agent webhook encryption is not configured.",
    );
  }
  return createHash("sha256").update(normalized).digest();
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
