import assert from "node:assert/strict";
import test from "node:test";

import {
  createSignUpRateLimiter,
  renderSignUpPage,
  validateSignUpFields,
} from "./local-account-pages.mjs";

test("validates and normalizes a strong local account", () => {
  assert.deepEqual(validateSignUpFields({
    name: "  Local   Operator ",
    email: " OPERATOR@Example.test ",
    password: "Correct-Horse-42!",
    confirmPassword: "Correct-Horse-42!",
  }), {
    ok: true,
    values: {
      name: "Local Operator",
      email: "operator@example.test",
    },
    password: "Correct-Horse-42!",
  });

  assert.match(
    validateSignUpFields({
      name: "Operator",
      email: "operator@example.test",
      password: "weak-password",
      confirmPassword: "weak-password",
    }).error,
    /uppercase, lowercase, a number, and a symbol/,
  );
});

test("renders a first-party account form without social providers", () => {
  const html = renderSignUpPage({ csrfToken: "signed-token" });
  assert.match(html, /Create your account/);
  assert.match(html, /name="csrf" value="signed-token"/);
  assert.doesNotMatch(html, /Google|Apple|Microsoft/);
});

test("limits repeated signup attempts per client address", () => {
  let now = 1_000;
  const limiter = createSignUpRateLimiter({
    limit: 2,
    windowMs: 500,
  });
  assert.equal(limiter.consume("127.0.0.1", now), true);
  assert.equal(limiter.consume("127.0.0.1", now), true);
  assert.equal(limiter.consume("127.0.0.1", now), false);
  now += 501;
  assert.equal(limiter.consume("127.0.0.1", now), true);
});
