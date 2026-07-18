import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import {
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";

import { createOidcClient } from "./oidc-client.mjs";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("OIDC discovery, Authorization Code + PKCE, and ID-token validation interoperate", async (t) => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.alg = "RS256";
  publicJwk.kid = "identity-key-1";
  publicJwk.use = "sig";

  let issuer = "";
  let expectedIdToken = "";
  let tokenRequest = null;
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", issuer);
    if (url.pathname === "/.well-known/openid-configuration") {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({
        issuer,
        authorization_endpoint: `${issuer}/authorize`,
        token_endpoint: `${issuer}/token`,
        jwks_uri: `${issuer}/jwks`,
        code_challenge_methods_supported: ["S256"],
      }));
      return;
    }
    if (url.pathname === "/jwks") {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ keys: [publicJwk] }));
      return;
    }
    if (url.pathname === "/token") {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      tokenRequest = {
        authorization: request.headers.authorization || "",
        body: Buffer.concat(chunks).toString("utf8"),
      };
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ id_token: expectedIdToken }));
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  issuer = await listen(server);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const clientId = "computer agents/client";
  const clientSecret = "secret with spaces:and/slashes";
  const nonce = "nonce-value";
  expectedIdToken = await new SignJWT({
    nonce,
    email: "operator@example.test",
  })
    .setProtectedHeader({ alg: "RS256", kid: publicJwk.kid, typ: "JWT" })
    .setIssuer(issuer)
    .setAudience(clientId)
    .setSubject("enterprise-user-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);

  const client = createOidcClient({
    issuerUrl: issuer,
    clientId,
    clientSecret,
    audience: clientId,
    scopes: ["openid", "profile", "email"],
    tokenEndpointAuthMethod: "client_secret_basic",
    allowedAlgorithms: ["RS256"],
  });
  const authorizationUrl = await client.createAuthorizationUrl({
    redirectUri: "http://127.0.0.1:4177/api/platform/auth/callback",
    state: "state-value",
    nonce,
    codeChallenge: "challenge-value",
    prompt: "select_account",
  });

  assert.equal(authorizationUrl.origin, issuer);
  assert.equal(authorizationUrl.searchParams.get("response_type"), "code");
  assert.equal(authorizationUrl.searchParams.get("code_challenge_method"), "S256");
  assert.equal(authorizationUrl.searchParams.get("code_challenge"), "challenge-value");
  assert.equal(authorizationUrl.searchParams.get("nonce"), nonce);
  assert.equal(authorizationUrl.searchParams.get("prompt"), "select_account");

  const tokens = await client.exchangeAuthorizationCode({
    code: "authorization-code",
    codeVerifier: "verifier-value",
    redirectUri: "http://127.0.0.1:4177/api/platform/auth/callback",
  });
  assert.equal(tokens.id_token, expectedIdToken);
  const expectedBasicValue = Buffer.from(
    "computer+agents%2Fclient:secret+with+spaces%3Aand%2Fslashes",
  ).toString("base64");
  assert.equal(tokenRequest.authorization, `Basic ${expectedBasicValue}`);
  const tokenBody = new URLSearchParams(tokenRequest.body);
  assert.equal(tokenBody.get("client_id"), null);
  assert.equal(tokenBody.get("code_verifier"), "verifier-value");

  const payload = await client.verifyIdToken(tokens.id_token, nonce);
  assert.equal(payload.sub, "enterprise-user-1");
  await assert.rejects(
    client.verifyIdToken(tokens.id_token, "another-nonce"),
    /nonce validation failed/,
  );

  const multipleAudienceToken = await new SignJWT({
    nonce,
    azp: "another-client",
  })
    .setProtectedHeader({ alg: "RS256", kid: publicJwk.kid, typ: "JWT" })
    .setIssuer(issuer)
    .setAudience([clientId, "another-audience"])
    .setSubject("enterprise-user-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  await assert.rejects(
    client.verifyIdToken(multipleAudienceToken, nonce),
    /unexpected authorized party/,
  );
});

test("OIDC discovery rejects issuer substitution", async () => {
  const client = createOidcClient({
    issuerUrl: "https://identity.example.test/realm/",
    clientId: "platform",
    clientSecret: "",
    audience: "platform",
    scopes: ["openid"],
    tokenEndpointAuthMethod: "none",
    allowedAlgorithms: ["RS256"],
  }, {
    fetchImpl: async () => new Response(JSON.stringify({
      issuer: "https://attacker.example.test/realm/",
      authorization_endpoint: "https://attacker.example.test/authorize",
      token_endpoint: "https://attacker.example.test/token",
      jwks_uri: "https://attacker.example.test/jwks",
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  });

  await assert.rejects(
    client.getDiscovery(),
    /issuer does not exactly match/,
  );
});
