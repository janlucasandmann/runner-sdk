import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";

const encoder = new TextEncoder();
const MINIMUM_SECRET_BYTES = 32;

export function createExecutionWorkerAssertionSigner({
  secret,
  issuer,
  audience,
  workerId,
  clock = Date.now,
}) {
  const normalizedSecret = String(secret || "")
    .replace(/(?:\r\n|\r|\n)+$/, "");
  if (Buffer.byteLength(normalizedSecret, "utf8") < MINIMUM_SECRET_BYTES) {
    throw new Error(
      `PLATFORM_CONTROL_PLANE_SECRET must contain at least ${MINIMUM_SECRET_BYTES} bytes.`,
    );
  }
  const normalizedWorkerId = String(workerId || "").trim();
  if (!normalizedWorkerId) {
    throw new Error("Execution dispatcher workerId is required.");
  }
  const key = encoder.encode(normalizedSecret);

  return Object.freeze({
    workerId: normalizedWorkerId,
    async sign() {
      const now = Math.floor(clock() / 1000);
      return new SignJWT({
        purpose: "execution_dispatch",
        worker_id: normalizedWorkerId,
        capabilities: ["execution_dispatch"],
      })
        .setProtectedHeader({
          alg: "HS256",
          typ: "ca-execution-worker+jwt",
        })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject(normalizedWorkerId)
        .setJti(randomUUID())
        .setIssuedAt(now)
        .setExpirationTime(now + 60)
        .sign(key);
    },
  });
}
