import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createPasswordResetTokenStore } from "./password-reset-token-store.mjs";

test("persists reset nonces as opaque single-use hashes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "password-reset-store-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const filePath = path.join(root, "identity", "tokens.json");
  let now = 1_000;
  const store = createPasswordResetTokenStore({
    filePath,
    clock: () => now,
  });
  const token = {
    nonce: "private-reset-nonce",
    email: "operator@example.test",
    userId: "local-user-1",
  };

  await store.register({ ...token, expiresAt: now + 60_000 });
  assert.equal(await store.has(token), true);
  const contents = await readFile(filePath, "utf8");
  assert.doesNotMatch(contents, /private-reset-nonce|operator@example\.test|local-user-1/);
  assert.equal((await stat(filePath)).mode & 0o777, 0o600);

  assert.equal(await store.consume(token), true);
  assert.equal(await store.consume(token), false);
  assert.equal(await store.has(token), false);

  await store.register({ ...token, expiresAt: now + 1_000 });
  now += 2_000;
  assert.equal(await store.has(token), false);
});

test("revokes every outstanding token for an identity", async () => {
  const store = createPasswordResetTokenStore();
  const identity = {
    email: "operator@example.test",
    userId: "local-user-1",
  };
  await store.register({ ...identity, nonce: "one", expiresAt: Date.now() + 60_000 });
  await store.register({ ...identity, nonce: "two", expiresAt: Date.now() + 60_000 });
  await store.revokeIdentity(identity.email, identity.userId);
  assert.equal(await store.has({ ...identity, nonce: "one" }), false);
  assert.equal(await store.has({ ...identity, nonce: "two" }), false);
});
