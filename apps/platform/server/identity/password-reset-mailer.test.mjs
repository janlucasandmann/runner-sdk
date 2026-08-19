import assert from "node:assert/strict";
import test from "node:test";

import { createPasswordResetMailer } from "./password-reset-mailer.mjs";

test("sends a password reset through SendGrid without placing secrets in content", async () => {
  const requests = [];
  const mailer = createPasswordResetMailer({
    enabled: true,
    provider: "sendgrid",
    apiKey: "sendgrid-private-key",
    fromAddress: "accounts@example.test",
    fromName: "Example Appliance",
  }, {
    async fetchImpl(url, init) {
      requests.push({ url, init });
      return new Response(null, { status: 202 });
    },
  });
  await mailer.sendPasswordReset({
    email: "operator@example.test",
    displayName: "Local <Operator>",
    resetUrl: "https://appliance.example.test/reset-password?token=opaque-token",
    expiresInMinutes: 30,
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.sendgrid.com/v3/mail/send");
  assert.equal(
    requests[0].init.headers.authorization,
    "Bearer sendgrid-private-key",
  );
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.personalizations[0].to[0].email, "operator@example.test");
  assert.match(body.content[0].value, /opaque-token/);
  assert.match(body.content[1].value, /Local &lt;Operator&gt;/);
  assert.doesNotMatch(requests[0].init.body, /sendgrid-private-key/);
});

test("fails closed when SendGrid rejects reset delivery", async () => {
  const mailer = createPasswordResetMailer({
    enabled: true,
    provider: "sendgrid",
    apiKey: "sendgrid-private-key",
    fromAddress: "accounts@example.test",
    fromName: "Example Appliance",
  }, {
    fetchImpl: async () => new Response(JSON.stringify({
      errors: [{ message: "Maximum credits exceeded" }],
    }), {
      status: 401,
      headers: { "content-type": "application/json" },
    }),
  });
  await assert.rejects(
    mailer.sendPasswordReset({
      email: "operator@example.test",
      resetUrl: "https://appliance.example.test/reset-password?token=opaque",
      expiresInMinutes: 30,
    }),
    /HTTP 401: Maximum credits exceeded/,
  );
});
