import assert from "node:assert/strict";
import test from "node:test";

import { createHostedIdentityService } from "./hosted-identity-service.mjs";

test("the hosted identity adapter preserves the Firebase browser contract", () => {
  const service = createHostedIdentityService();
  let status = 0;
  let headers = {};
  let body = "";
  const response = {
    writeHead(nextStatus, nextHeaders) {
      status = nextStatus;
      headers = nextHeaders;
    },
    end(nextBody = "") {
      body += nextBody;
    },
  };

  assert.equal(service.provider, "firebase");
  assert.equal(service.hasSession({ headers: {} }), false);
  assert.equal(service.hasSession({
    headers: { authorization: "Bearer hosted-session" },
  }), true);
  assert.equal(service.handleRequest(
    { method: "GET" },
    response,
    new URL("http://localhost/api/platform/auth/browser-module.js"),
  ), true);
  assert.equal(status, 200);
  assert.equal(headers["Cache-Control"], "no-store");
  assert.match(body, /firebase@10\.12\.2\/auth/);
  assert.match(body, /signInWithEmailAndPassword/);
});
