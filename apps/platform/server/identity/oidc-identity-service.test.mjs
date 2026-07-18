import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { createOidcIdentityService } from "./oidc-identity-service.mjs";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

function getSetCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }
  const value = response.headers.get("set-cookie");
  return value ? [value] : [];
}

function cookiePair(setCookie) {
  return String(setCookie || "").split(";", 1)[0];
}

test("OIDC login creates an opaque HttpOnly BFF session and keeps workload credentials server-side", async (t) => {
  let platformOrigin = "";
  let identityService;
  const authorizationInputs = [];
  const upstreamCalls = [];
  const workloadKey = "tb_session_workload-secret-never-sent-to-browser";
  const oidcClient = {
    async createAuthorizationUrl(input) {
      authorizationInputs.push(input);
      const url = new URL("https://identity.example.test/authorize");
      for (const field of ["state", "nonce", "codeChallenge"]) {
        url.searchParams.set(field, input[field]);
      }
      return url;
    },
    async exchangeAuthorizationCode(input) {
      assert.equal(input.code, "authorization-code");
      assert.ok(input.codeVerifier.length >= 40);
      return { id_token: "signed-id-token" };
    },
    async verifyIdToken(idToken, nonce) {
      assert.equal(idToken, "signed-id-token");
      assert.ok(nonce.length >= 40);
      return {
        sub: "enterprise-user-1",
        email: "operator@example.test",
        email_verified: true,
        name: "Operator",
      };
    },
  };
  const fetchImpl = async (target, init = {}) => {
    const url = new URL(target);
    const headers = new Headers(init.headers || {});
    upstreamCalls.push({
      url: url.toString(),
      method: init.method || "GET",
      authorization: headers.get("authorization") || "",
      apiKey: headers.get("x-api-key") || "",
      cookie: headers.get("cookie") || "",
      body: String(init.body || ""),
    });
    if (url.pathname === "/internal/principal-sessions") {
      assert.match(headers.get("authorization") || "", /^ComputerAgentsPrincipal /);
      return new Response(JSON.stringify({
        profile: {
          userId: "user_stable_1",
          email: "operator@example.test",
          displayName: "Operator",
          emailVerified: true,
        },
        subscription: { tier: "enterprise", status: "active" },
        credential: {
          id: "credential_1",
          key: workloadKey,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }
    if (url.pathname.endsWith("/revoke")) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ data: [{ id: "thread_1" }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const server = http.createServer((request, response) => {
    const url = new URL(request.url || "/", platformOrigin);
    if (url.pathname === "/__session") {
      void identityService.handleSessionRequest(request, response);
      return;
    }
    if (!identityService.handleRequest(request, response, url)) {
      response.statusCode = 404;
      response.end();
    }
  });
  platformOrigin = await listen(server);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  identityService = createOidcIdentityService({
    identityProvider: "oidc",
    defaultUpstreamOrigin: "http://127.0.0.1:8080/v1",
    oidc: {
      issuerUrl: "https://identity.example.test/realm",
      callbackPath: "/api/platform/auth/callback",
    },
    platformOrigin,
    platformSessionCookieName: "computer_agents_session",
    platformSessionSecret: "platform-session-secret-with-at-least-32-bytes",
    platformSessionTtlSeconds: 60 * 60,
    platformControlPlaneSecret: "control-plane-secret-with-at-least-32-bytes",
    platformPrincipalAssertionIssuer: "computer-agents-platform",
    platformPrincipalAssertionAudience: "computer-agents-control-api",
    platformCookieSecure: false,
  }, {
    fetchImpl,
    oidcClient,
  });

  const loginResponse = await fetch(
    `${platformOrigin}/api/platform/auth/login?return_to=%2Fcreate`,
    { redirect: "manual" },
  );
  assert.equal(loginResponse.status, 303);
  const transactionSetCookie = getSetCookies(loginResponse)[0];
  assert.match(transactionSetCookie, /HttpOnly/);
  assert.match(transactionSetCookie, /SameSite=Lax/);
  assert.equal(transactionSetCookie.includes("codeVerifier"), false);
  const transactionCookie = cookiePair(transactionSetCookie);
  const authorizationLocation = new URL(loginResponse.headers.get("location"));
  const state = authorizationLocation.searchParams.get("state");
  assert.ok(state);
  assert.equal(authorizationInputs[0].codeChallenge.length, 43);

  const rejectedCallback = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=wrong-state`,
    {
      redirect: "manual",
      headers: { cookie: transactionCookie },
    },
  );
  assert.equal(rejectedCallback.status, 400);
  assert.equal(upstreamCalls.length, 0);

  const callbackResponse = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    {
      redirect: "manual",
      headers: { cookie: transactionCookie },
    },
  );
  assert.equal(callbackResponse.status, 303);
  assert.equal(callbackResponse.headers.get("location"), `${platformOrigin}/create`);
  const sessionSetCookie = getSetCookies(callbackResponse).find(
    (value) => value.startsWith("computer_agents_session="),
  );
  assert.ok(sessionSetCookie);
  assert.match(sessionSetCookie, /HttpOnly/);
  assert.equal(sessionSetCookie.includes(workloadKey), false);
  const sessionCookie = cookiePair(sessionSetCookie);

  const sessionResponse = await fetch(`${platformOrigin}/__session`, {
    headers: { cookie: sessionCookie },
  });
  const sessionText = await sessionResponse.text();
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionText.includes(workloadKey), false);
  assert.match(sessionText, /__runner_playground_session__/);
  assert.equal(JSON.parse(sessionText).profile.userId, "user_stable_1");

  const proxied = await identityService.fetchControlApi(
    { headers: { cookie: sessionCookie } },
    "/threads",
  );
  assert.equal(proxied.status, 200);
  const controlCall = upstreamCalls.at(-1);
  assert.equal(controlCall.apiKey, workloadKey);
  assert.equal(controlCall.cookie, "");

  const logoutResponse = await fetch(
    `${platformOrigin}/api/platform/auth/logout?return_to=%2F`,
    {
      redirect: "manual",
      headers: { cookie: sessionCookie },
    },
  );
  assert.equal(logoutResponse.status, 303);
  assert.ok(upstreamCalls.some((call) => call.url.endsWith("/credential_1/revoke")));
  assert.ok(getSetCookies(logoutResponse).some(
    (value) => value.startsWith("computer_agents_session=")
      && value.includes("Max-Age=0"),
  ));
});
