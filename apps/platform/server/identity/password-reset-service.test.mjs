import assert from "node:assert/strict";
import test from "node:test";

import { createPasswordResetService } from "./password-reset-service.mjs";
import { createPlatformSessionCodec } from "./session-codec.mjs";

test("issues a single-use credential-bound password reset link", async () => {
  let fingerprint = "current-password-fingerprint";
  const deliveries = [];
  const accountService = {
    async findAccount(email) {
      if (email !== "operator@example.test") return null;
      return {
        email,
        displayName: "Local Operator",
        userId: "local-user-1",
        passwordFingerprint: fingerprint,
      };
    },
    async resetPassword({ expectedFingerprint, expectedUserId }) {
      if (
        expectedFingerprint !== fingerprint
        || expectedUserId !== "local-user-1"
      ) {
        return { updated: false, invalidated: true };
      }
      fingerprint = "replacement-password-fingerprint";
      return { updated: true, invalidated: false, passwordFingerprint: fingerprint };
    },
  };
  const service = createPasswordResetService({
    accountService,
    mailer: {
      async sendPasswordReset(delivery) {
        deliveries.push(delivery);
      },
    },
    platformOrigin: "https://appliance.example.test",
    sessionCodec: createPlatformSessionCodec(
      "platform-session-secret-with-at-least-32-bytes",
    ),
    tokenTtlSeconds: 1800,
  });

  assert.deepEqual(await service.request("missing@example.test"), {
    accepted: true,
    delivered: false,
  });
  assert.equal(deliveries.length, 0);
  assert.deepEqual(await service.request("operator@example.test"), {
    accepted: true,
    delivered: true,
  });
  assert.equal(deliveries.length, 1);
  const resetUrl = new URL(deliveries[0].resetUrl);
  assert.equal(resetUrl.origin, "https://appliance.example.test");
  const token = resetUrl.searchParams.get("token");
  assert.equal(await service.inspect(token), true);
  assert.equal((await service.reset(token, "Replacement-Horse-42!")).updated, true);
  assert.equal(await service.inspect(token), false);
  assert.deepEqual(await service.reset(token, "Another-Horse-42!"), {
    updated: false,
    invalidated: true,
  });
});
