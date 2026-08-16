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
    if (url.pathname === "/v1/api-keys") {
      return new Response(JSON.stringify(
        init.method === "POST"
          ? {
              id: "key_created_1",
              name: "SDK key",
              key: "tb_created-returned-once",
              scopes: ["*"],
            }
          : { keys: [] },
      ), {
        status: init.method === "POST" ? 201 : 200,
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
    if (url.pathname.startsWith("/api/user/")) {
      void identityService.handleAccountJsonRequest(
        request,
        response,
        url.pathname,
        request.method || "GET",
      );
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

  const parallelLoginResponse = await fetch(
    `${platformOrigin}/api/platform/auth/login?return_to=%2Fparallel`,
    { redirect: "manual" },
  );
  assert.equal(parallelLoginResponse.status, 303);
  const parallelTransactionCookie = cookiePair(
    getSetCookies(parallelLoginResponse)[0],
  );
  const parallelAuthorizationLocation = new URL(
    parallelLoginResponse.headers.get("location"),
  );
  const parallelState = parallelAuthorizationLocation.searchParams.get("state");
  assert.ok(parallelState);
  assert.notEqual(
    transactionCookie.split("=", 1)[0],
    parallelTransactionCookie.split("=", 1)[0],
  );
  const concurrentTransactionCookies = [
    transactionCookie,
    parallelTransactionCookie,
  ].join("; ");

  const rejectedCallback = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=wrong-state`,
    {
      redirect: "manual",
      headers: { cookie: concurrentTransactionCookies },
    },
  );
  assert.equal(rejectedCallback.status, 400);
  assert.equal(upstreamCalls.length, 0);
  const rejectedCookies = getSetCookies(rejectedCallback);
  assert.equal(rejectedCookies.some((value) =>
    value.startsWith(`${transactionCookie.split("=", 1)[0]}=`)
      || value.startsWith(`${parallelTransactionCookie.split("=", 1)[0]}=`)), false);

  const callbackResponse = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    {
      redirect: "manual",
      headers: { cookie: concurrentTransactionCookies },
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

  const parallelCallbackResponse = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=${encodeURIComponent(parallelState)}`,
    {
      redirect: "manual",
      headers: { cookie: concurrentTransactionCookies },
    },
  );
  assert.equal(parallelCallbackResponse.status, 303);
  assert.equal(
    parallelCallbackResponse.headers.get("location"),
    `${platformOrigin}/parallel`,
  );

  const sessionResponse = await fetch(`${platformOrigin}/__session`, {
    headers: { cookie: sessionCookie },
  });
  const sessionText = await sessionResponse.text();
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionText.includes(workloadKey), false);
  assert.match(sessionText, /__runner_playground_session__/);
  assert.equal(JSON.parse(sessionText).profile.userId, "user_stable_1");

  const createdApiKeyResponse = await fetch(
    `${platformOrigin}/api/user/api-keys`,
    {
      method: "POST",
      headers: {
        authorization: "Bearer forged-browser-token",
        cookie: sessionCookie,
        "content-type": "application/json",
        "x-api-key": "tb_forged-browser-key",
      },
      body: JSON.stringify({ name: "SDK key", scopes: ["*"] }),
    },
  );
  assert.equal(createdApiKeyResponse.status, 201);
  assert.equal((await createdApiKeyResponse.json()).key, "tb_created-returned-once");
  const apiKeyControlCall = upstreamCalls.at(-1);
  assert.equal(new URL(apiKeyControlCall.url).pathname, "/v1/api-keys");
  assert.equal(apiKeyControlCall.method, "POST");
  assert.equal(apiKeyControlCall.apiKey, workloadKey);
  assert.equal(apiKeyControlCall.authorization, "");
  assert.equal(apiKeyControlCall.cookie, "");
  assert.deepEqual(JSON.parse(apiKeyControlCall.body), {
    name: "SDK key",
    scopes: ["*"],
  });

  const refererLoginResponse = await fetch(
    `${platformOrigin}/api/platform/auth/login`,
    {
      redirect: "manual",
      headers: { referer: `${platformOrigin}/signup` },
    },
  );
  const refererTransactionCookie = cookiePair(
    getSetCookies(refererLoginResponse)[0],
  );
  const legacyTransactionCookie = [
    "computer_agents_session_oidc",
    refererTransactionCookie.slice(refererTransactionCookie.indexOf("=") + 1),
  ].join("=");
  const refererAuthorizationLocation = new URL(
    refererLoginResponse.headers.get("location"),
  );
  const refererCallbackResponse = await fetch(
    `${platformOrigin}/api/platform/auth/callback?code=authorization-code&state=${encodeURIComponent(
      refererAuthorizationLocation.searchParams.get("state"),
    )}`,
    {
      redirect: "manual",
      headers: { cookie: legacyTransactionCookie },
    },
  );
  assert.equal(refererCallbackResponse.status, 303);
  assert.equal(refererCallbackResponse.headers.get("location"), `${platformOrigin}/`);
  assert.ok(getSetCookies(refererCallbackResponse).some((value) =>
    value.startsWith("computer_agents_session_oidc=")
      && value.includes("Max-Age=0")));

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

test("local signup validates a CSRF-bound form and creates a durable Dex account", async (t) => {
  let platformOrigin = "";
  let identityService;
  const createdAccounts = [];
  const principalExchanges = [];
  const workloadKey = "tb_signup_workload-secret-never-sent-to-browser";
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
      localAccounts: { enabled: true, grpcAddress: "127.0.0.1:5557" },
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
    oidcClient: {},
    fetchImpl: async (target, init = {}) => {
      const url = new URL(target);
      assert.equal(url.pathname, "/internal/principal-sessions");
      principalExchanges.push(init);
      return new Response(JSON.stringify({
        profile: {
          userId: "user_local_platform_1",
          email: "operator@example.test",
          displayName: "Local Operator",
          emailVerified: true,
        },
        subscription: { tier: "sandbox", status: "active" },
        credential: {
          id: "credential_signup_1",
          key: workloadKey,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    },
    localAccountService: {
      async createAccount(account) {
        createdAccounts.push(account);
        return {
          created: true,
          alreadyExists: false,
          subject: "CgNmb28SBWxvY2Fs",
        };
      },
    },
  });

  const pageResponse = await fetch(`${platformOrigin}/signup`);
  assert.equal(pageResponse.status, 200);
  const page = await pageResponse.text();
  assert.match(page, /Create your account/);
  assert.doesNotMatch(page, /Google|Apple|Microsoft/);
  const csrf = page.match(/name="csrf" value="([^"]+)"/)?.[1];
  assert.ok(csrf);

  const rejected = await fetch(`${platformOrigin}/signup`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrf: "invalid",
      name: "Local Operator",
      email: "operator@example.test",
      password: "Correct-Horse-42!",
      confirmPassword: "Correct-Horse-42!",
    }),
    redirect: "manual",
  });
  assert.equal(rejected.status, 400);
  assert.equal(createdAccounts.length, 0);

  const created = await fetch(`${platformOrigin}/signup`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrf,
      name: " Local   Operator ",
      email: "OPERATOR@example.test",
      password: "Correct-Horse-42!",
      confirmPassword: "Correct-Horse-42!",
    }),
    redirect: "manual",
  });
  assert.equal(created.status, 303);
  assert.equal(created.headers.get("location"), `${platformOrigin}/`);
  const sessionSetCookie = getSetCookies(created).find(
    (value) => value.startsWith("computer_agents_session="),
  );
  assert.ok(sessionSetCookie);
  assert.match(sessionSetCookie, /HttpOnly/);
  assert.equal(sessionSetCookie.includes(workloadKey), false);
  assert.equal(principalExchanges.length, 1);
  assert.deepEqual(createdAccounts, [{
    displayName: "Local Operator",
    email: "operator@example.test",
    password: "Correct-Horse-42!",
  }]);

  const sessionResponse = await fetch(`${platformOrigin}/__session`, {
    headers: { cookie: cookiePair(sessionSetCookie) },
  });
  assert.equal(sessionResponse.status, 200);
  const session = JSON.parse(await sessionResponse.text());
  assert.equal(session.profile.userId, "user_local_platform_1");
  assert.equal(session.profile.email, "operator@example.test");
});
