import assert from "node:assert/strict";
import test from "node:test";

import {
  createDexLocalAccountService,
  createDexLocalSubject,
} from "./dex-local-account-service.mjs";

test("encodes local identities exactly like the Dex OIDC subject codec", () => {
  // Dex v2.42.0 server/oauth2_test.go uses this compatibility vector.
  assert.equal(createDexLocalSubject("foo", "bar"), "CgNmb28SA2Jhcg");
});

test("creates a Dex password record with a bcrypt hash and stable profile fields", async () => {
  let request;
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      createPassword(value, _options, callback) {
        request = value;
        callback(null, { already_exists: false });
      },
    },
    hashPassword: async (password) => {
      assert.equal(password, "Correct-Horse-42!");
      return "$2b$12$durable-password-hash";
    },
    createUserId: () => "user-local-1",
  });

  const result = await service.createAccount({
    email: "operator@example.test",
    displayName: "Local Operator",
    password: "Correct-Horse-42!",
  });

  assert.deepEqual(result, {
    created: true,
    alreadyExists: false,
    subject: createDexLocalSubject("user-local-1"),
    passwordFingerprint: "73b0438ceb221dbb25c14ee5aa91f185d5b361b3573c5c3776c70d6bda5ab06f",
  });
  assert.equal(request.password.email, "operator@example.test");
  assert.equal(request.password.username, "Local Operator");
  assert.equal(request.password.user_id, "user-local-1");
  assert.equal(
    request.password.hash.toString("utf8"),
    "$2b$12$durable-password-hash",
  );
});

test("returns null when local account registration is disabled", () => {
  assert.equal(createDexLocalAccountService({ enabled: false }), null);
});

test("provisions an existing bcrypt credential without rehashing or changing identity", async () => {
  let request;
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      createPassword(value, _options, callback) {
        request = value;
        callback(null, { already_exists: false });
      },
    },
  });

  const result = await service.provisionAccount({
    email: "Operator@Example.test",
    displayName: "Local Operator",
    userId: "operator-existing-1",
    passwordHash: "$2b$12$durable-password-hash",
  });

  assert.deepEqual(result, {
    created: true,
    alreadyExists: false,
    subject: createDexLocalSubject("operator-existing-1"),
  });
  assert.equal(request.password.email, "operator@example.test");
  assert.equal(request.password.username, "Local Operator");
  assert.equal(request.password.user_id, "operator-existing-1");
  assert.equal(
    request.password.hash.toString("utf8"),
    "$2b$12$durable-password-hash",
  );
});

test("rejects invalid pre-hashed account migration input before calling Dex", async () => {
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      createPassword() {
        assert.fail("Dex must not be called for invalid migration input.");
      },
    },
  });
  await assert.rejects(
    service.provisionAccount({
      email: "operator@example.test",
      displayName: "Local Operator",
      userId: "operator-existing-1",
      passwordHash: "plaintext",
    }),
    /must be bcrypt/,
  );
});

test("does not expose a subject when Dex rejects a duplicate account", async () => {
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      createPassword(_value, _options, callback) {
        callback(null, { already_exists: true });
      },
    },
    hashPassword: async () => "$2b$12$durable-password-hash",
    createUserId: () => "unused-user-id",
  });

  assert.deepEqual(await service.createAccount({
    email: "operator@example.test",
    displayName: "Local Operator",
    password: "Correct-Horse-42!",
  }), {
    created: false,
    alreadyExists: true,
    subject: "",
    passwordFingerprint: "",
  });
});

test("looks up and atomically replaces a Dex password credential", async () => {
  let storedHash = Buffer.from("$2b$12$existing-password-hash", "utf8");
  const updates = [];
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      listPasswords(_request, _options, callback) {
        callback(null, {
          passwords: [{
            email: "Operator@Example.test",
            hash: storedHash,
            username: "Local Operator",
            user_id: "local-user-1",
          }],
        });
      },
      updatePassword(request, _options, callback) {
        updates.push(request);
        storedHash = request.new_hash;
        callback(null, { not_found: false });
      },
    },
    hashPassword: async () => "$2b$12$replacement-password-hash",
  });

  const account = await service.findAccount(" operator@example.test ");
  assert.equal(account.email, "operator@example.test");
  assert.equal(account.displayName, "Local Operator");
  assert.equal(account.userId, "local-user-1");

  const rejected = await service.resetPassword({
    email: account.email,
    password: "Replacement-Horse-42!",
    expectedFingerprint: "incorrect",
    expectedUserId: account.userId,
  });
  assert.deepEqual(rejected, { updated: false, invalidated: true });
  assert.equal(updates.length, 0);

  const updated = await service.resetPassword({
    email: account.email,
    password: "Replacement-Horse-42!",
    expectedFingerprint: account.passwordFingerprint,
    expectedUserId: account.userId,
  });
  assert.equal(updated.updated, true);
  assert.equal(updated.invalidated, false);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].email, "operator@example.test");
  assert.equal(updates[0].new_username, "Local Operator");
  assert.equal(
    updates[0].new_hash.toString("utf8"),
    "$2b$12$replacement-password-hash",
  );

  const replay = await service.resetPassword({
    email: account.email,
    password: "Another-Replacement-42!",
    expectedFingerprint: account.passwordFingerprint,
    expectedUserId: account.userId,
  });
  assert.deepEqual(replay, { updated: false, invalidated: true });
  assert.equal(updates.length, 1);
});

test("supports Dex password listings that intentionally omit credential hashes", async () => {
  const updates = [];
  const service = createDexLocalAccountService({
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  }, {
    client: {
      listPasswords(_request, _options, callback) {
        callback(null, {
          passwords: [{
            email: "operator@example.test",
            hash: Buffer.alloc(0),
            username: "Local Operator",
            user_id: "local-user-1",
          }],
        });
      },
      updatePassword(request, _options, callback) {
        updates.push(request);
        callback(null, { not_found: false });
      },
    },
    hashPassword: async () => "$2b$12$replacement-password-hash",
  });

  const account = await service.findAccount("operator@example.test");
  assert.deepEqual(account, {
    email: "operator@example.test",
    displayName: "Local Operator",
    userId: "local-user-1",
    passwordFingerprint: "",
  });

  assert.deepEqual(await service.resetPassword({
    email: account.email,
    password: "Replacement-Horse-42!",
    expectedUserId: account.userId,
  }), {
    updated: true,
    invalidated: false,
    passwordFingerprint: "35866a17b82f51aac4aad542ceb5bc9e9c634e2837262ed433e5953d46204364",
  });
  assert.equal(updates.length, 1);
});
