import { createHash } from "node:crypto";
import { CompactEncrypt, compactDecrypt } from "jose";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAXIMUM_CLOCK_SKEW_SECONDS = 5;
const MAXIMUM_SEALED_TOKEN_BYTES = 3_800;

function deriveEncryptionKey(secret) {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function createPlatformSessionCodec(secret, { clock = Date.now } = {}) {
  const key = deriveEncryptionKey(secret);

  async function seal(kind, payload, ttlSeconds) {
    const now = Math.floor(clock() / 1000);
    const body = encoder.encode(JSON.stringify({
      v: 1,
      kind,
      iat: now,
      exp: now + Math.max(1, Math.floor(ttlSeconds)),
      payload,
    }));
    const token = await new CompactEncrypt(body)
      .setProtectedHeader({
        alg: "dir",
        enc: "A256GCM",
        typ: "ca-platform-session+jwe",
      })
      .encrypt(key);
    if (Buffer.byteLength(token, "utf8") > MAXIMUM_SEALED_TOKEN_BYTES) {
      throw new Error("The encrypted platform session exceeds the cookie size limit.");
    }
    return token;
  }

  async function open(token, expectedKind) {
    const normalizedToken = String(token || "").trim();
    if (!normalizedToken) return null;
    if (Buffer.byteLength(normalizedToken, "utf8") > MAXIMUM_SEALED_TOKEN_BYTES) {
      return null;
    }
    try {
      const { plaintext, protectedHeader } = await compactDecrypt(
        normalizedToken,
        key,
        {
          keyManagementAlgorithms: ["dir"],
          contentEncryptionAlgorithms: ["A256GCM"],
        },
      );
      if (protectedHeader.typ !== "ca-platform-session+jwe") return null;
      const value = JSON.parse(decoder.decode(plaintext));
      const now = Math.floor(clock() / 1000);
      if (
        value?.v !== 1
        || value?.kind !== expectedKind
        || !Number.isFinite(value?.iat)
        || !Number.isFinite(value?.exp)
        || value.iat > now + MAXIMUM_CLOCK_SKEW_SECONDS
        || value.exp <= now - MAXIMUM_CLOCK_SKEW_SECONDS
      ) {
        return null;
      }
      return value.payload && typeof value.payload === "object"
        ? value.payload
        : null;
    } catch {
      return null;
    }
  }

  return Object.freeze({ open, seal });
}
