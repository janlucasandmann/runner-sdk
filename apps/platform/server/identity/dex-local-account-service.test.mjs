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
  });
});
