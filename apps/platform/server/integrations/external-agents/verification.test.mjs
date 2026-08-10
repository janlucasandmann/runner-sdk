import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  openWebhookSecret,
  sealWebhookSecret,
  verifyBearerWebhookToken,
  verifyLinearWebhookSignature,
} from "./verification.mjs";

test("webhook secrets are encrypted at rest and only open with the configured key", () => {
  const sealed = sealWebhookSecret("provider-secret", "encryption-key-1");

  assert.equal(JSON.stringify(sealed).includes("provider-secret"), false);
  assert.equal(openWebhookSecret(sealed, "encryption-key-1"), "provider-secret");
  assert.throws(
    () => openWebhookSecret(sealed, "different-encryption-key"),
    (error) => error.code === "webhook_secret_unavailable",
  );
});

test("generic bearer webhook verification is timing-safe and fail closed", () => {
  assert.doesNotThrow(() => verifyBearerWebhookToken({ actual: "secret", expected: "secret" }));
  assert.throws(
    () => verifyBearerWebhookToken({ actual: "wrong", expected: "secret" }),
    (error) => error.statusCode === 401 && error.code === "webhook_signature_invalid",
  );
});

test("Linear webhook verification rejects tampering and stale deliveries", () => {
  const rawBody = Buffer.from('{"type":"Comment"}');
  const secret = "linear-signing-secret";
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  const now = 1_786_000_000_000;

  assert.doesNotThrow(() => verifyLinearWebhookSignature({
    rawBody,
    signature,
    secret,
    timestamp: now,
    now,
  }));
  assert.throws(
    () => verifyLinearWebhookSignature({ rawBody: Buffer.from("tampered"), signature, secret, now }),
    (error) => error.code === "webhook_signature_invalid",
  );
  assert.throws(
    () => verifyLinearWebhookSignature({
      rawBody,
      signature,
      secret,
      timestamp: now - 2 * 60 * 1_000,
      now,
    }),
    (error) => error.code === "webhook_timestamp_invalid",
  );
});
