import assert from "node:assert/strict";
import test from "node:test";

import { createPlatformSessionCodec } from "./session-codec.mjs";

const SECRET = "platform-session-secret-with-at-least-32-bytes";

test("platform sessions are encrypted, typed, and time bounded", async () => {
  let now = Date.parse("2026-07-18T10:00:00.000Z");
  const codec = createPlatformSessionCodec(SECRET, { clock: () => now });
  const payload = {
    profile: { userId: "user_123" },
    credential: { key: "tb_session_super-secret" },
  };

  const token = await codec.seal("platform_session", payload, 300);

  assert.equal(token.split(".").length, 5);
  assert.equal(token.includes("tb_session_super-secret"), false);
  assert.deepEqual(await codec.open(token, "platform_session"), payload);
  assert.equal(await codec.open(token, "oidc_transaction"), null);

  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  assert.equal(await codec.open(tampered, "platform_session"), null);

  now += 306_000;
  assert.equal(await codec.open(token, "platform_session"), null);
});

test("platform session ciphertext cannot be opened with another deployment secret", async () => {
  const codec = createPlatformSessionCodec(SECRET);
  const otherCodec = createPlatformSessionCodec(
    "another-platform-session-secret-with-32-bytes",
  );
  const token = await codec.seal("platform_session", { userId: "user_123" }, 60);

  assert.equal(await otherCodec.open(token, "platform_session"), null);
  await assert.rejects(
    codec.seal("platform_session", { value: "x".repeat(4_000) }, 60),
    /cookie size limit/,
  );
});
