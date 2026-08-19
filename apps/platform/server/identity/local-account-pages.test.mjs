import assert from "node:assert/strict";
import test from "node:test";

import {
  createSignUpRateLimiter,
  renderForgotPasswordPage,
  renderResetPasswordPage,
  renderSignUpPage,
  validatePasswordFields,
  validateResetEmail,
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

test("renders first-party request and password update forms", () => {
  const html = renderForgotPasswordPage({ csrfToken: "request-csrf" });
  assert.match(html, /Forgot your password\?/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="csrf" value="request-csrf"/);
  assert.match(html, /href="\/api\/platform\/auth\/login"/);

  const reset = renderResetPasswordPage({
    csrfToken: "reset-csrf",
    token: "encrypted-reset-token",
  });
  assert.match(reset, /Choose a new password/);
  assert.match(reset, /name="token" value="encrypted-reset-token"/);
  assert.match(reset, /name="csrf" value="reset-csrf"/);
  assert.doesNotMatch(reset, /onclick=/);
});

test("validates reset emails and strong matching passwords", () => {
  assert.deepEqual(validateResetEmail(" Operator@Example.test "), {
    ok: true,
    email: "operator@example.test",
  });
  assert.equal(validateResetEmail("invalid").ok, false);
  assert.deepEqual(validatePasswordFields({
    password: "Replacement-Horse-42!",
    confirmPassword: "Replacement-Horse-42!",
  }), {
    ok: true,
    password: "Replacement-Horse-42!",
  });
  assert.equal(validatePasswordFields({
    password: "Replacement-Horse-42!",
    confirmPassword: "different",
  }).ok, false);
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
