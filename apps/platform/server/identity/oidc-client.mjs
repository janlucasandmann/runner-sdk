import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const MAXIMUM_DISCOVERY_DOCUMENT_BYTES = 256 * 1024;
const MAXIMUM_TOKEN_RESPONSE_BYTES = 1024 * 1024;

function isSecureOrLoopbackUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) return false;
    return parsed.protocol === "https:" || (
      parsed.protocol === "http:"
      && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function equalSecretValues(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}

function formEncode(value) {
  const encoded = new URLSearchParams({ value: String(value || "") }).toString();
  return encoded.slice("value=".length);
}

async function readLimitedJson(response, maximumBytes) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error("OIDC response exceeded the configured size limit.");
  }
  if (!response.body) return {};
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value?.byteLength || 0;
      if (totalBytes > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("OIDC response exceeded the configured size limit.");
      }
      if (value) chunks.push(Buffer.from(value));
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // The body can already be closed after cancellation.
    }
  }
  const text = Buffer.concat(chunks, totalBytes).toString("utf8");
  if (!text) return {};
  return JSON.parse(text);
}

export function createOidcClient(config, { fetchImpl = fetch } = {}) {
  let discoveryPromise;
  let remoteJwks;

  async function getDiscovery() {
    if (!discoveryPromise) {
      discoveryPromise = (async () => {
        const discoveryUrl = new URL(
          `${config.issuerUrl.replace(/\/+$/, "")}/.well-known/openid-configuration`,
        );
        const response = await fetchImpl(discoveryUrl, {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        const document = await readLimitedJson(
          response,
          MAXIMUM_DISCOVERY_DOCUMENT_BYTES,
        ).catch(() => ({}));
        if (!response.ok) {
          throw new Error(`OIDC discovery failed with HTTP ${response.status}.`);
        }
        if (document.issuer !== config.issuerUrl) {
          throw new Error("OIDC discovery issuer does not exactly match OIDC_ISSUER_URL.");
        }
        for (const field of ["authorization_endpoint", "token_endpoint", "jwks_uri"]) {
          if (!isSecureOrLoopbackUrl(document[field])) {
            throw new Error(`OIDC discovery returned an unsafe ${field}.`);
          }
        }
        if (
          Array.isArray(document.code_challenge_methods_supported)
          && !document.code_challenge_methods_supported.includes("S256")
        ) {
          throw new Error("The OIDC provider does not advertise PKCE S256 support.");
        }
        if (
          Array.isArray(document.token_endpoint_auth_methods_supported)
          && !document.token_endpoint_auth_methods_supported.includes(
            config.tokenEndpointAuthMethod,
          )
        ) {
          throw new Error(
            "The OIDC provider does not support the configured token endpoint authentication method.",
          );
        }
        if (
          Array.isArray(document.id_token_signing_alg_values_supported)
          && !config.allowedAlgorithms.some(
            (algorithm) => document.id_token_signing_alg_values_supported.includes(
              algorithm,
            ),
          )
        ) {
          throw new Error(
            "The OIDC provider and platform have no shared ID-token signing algorithm.",
          );
        }
        return Object.freeze(document);
      })().catch((error) => {
        discoveryPromise = undefined;
        throw error;
      });
    }
    return discoveryPromise;
  }

  async function createAuthorizationUrl({
    redirectUri,
    state,
    nonce,
    codeChallenge,
    prompt,
  }) {
    const discovery = await getDiscovery();
    const target = new URL(discovery.authorization_endpoint);
    target.searchParams.set("response_type", "code");
    target.searchParams.set("client_id", config.clientId);
    target.searchParams.set("redirect_uri", redirectUri);
    target.searchParams.set("scope", config.scopes.join(" "));
    target.searchParams.set("state", state);
    target.searchParams.set("nonce", nonce);
    target.searchParams.set("code_challenge", codeChallenge);
    target.searchParams.set("code_challenge_method", "S256");
    if (prompt) target.searchParams.set("prompt", prompt);
    return target;
  }

  async function exchangeAuthorizationCode({
    code,
    codeVerifier,
    redirectUri,
  }) {
    const discovery = await getDiscovery();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
    const headers = {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    };
    if (config.tokenEndpointAuthMethod === "client_secret_basic") {
      headers.authorization = `Basic ${Buffer.from(
        `${formEncode(config.clientId)}:${formEncode(config.clientSecret)}`,
      ).toString("base64")}`;
      body.delete("client_id");
    } else if (config.tokenEndpointAuthMethod === "client_secret_post") {
      body.set("client_secret", config.clientSecret);
    }
    const response = await fetchImpl(discovery.token_endpoint, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const tokens = await readLimitedJson(
      response,
      MAXIMUM_TOKEN_RESPONSE_BYTES,
    ).catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        `OIDC token exchange failed: ${tokens.error_description || tokens.error || response.status}.`,
      );
    }
    if (typeof tokens.id_token !== "string" || !tokens.id_token) {
      throw new Error("OIDC token response did not contain an ID token.");
    }
    return tokens;
  }

  async function verifyIdToken(idToken, expectedNonce) {
    const discovery = await getDiscovery();
    if (!remoteJwks) {
      remoteJwks = createRemoteJWKSet(new URL(discovery.jwks_uri), {
        cooldownDuration: 30_000,
        cacheMaxAge: 10 * 60 * 1000,
        timeoutDuration: 10_000,
      });
    }
    const { payload } = await jwtVerify(idToken, remoteJwks, {
      issuer: config.issuerUrl,
      audience: config.audience,
      algorithms: config.allowedAlgorithms,
      clockTolerance: 5,
      maxTokenAge: "10m",
    });
    if (
      typeof payload.nonce !== "string"
      || !equalSecretValues(payload.nonce, expectedNonce)
    ) {
      throw new Error("OIDC ID token nonce validation failed.");
    }
    if (!payload.sub) {
      throw new Error("OIDC ID token is missing its subject.");
    }
    if (String(payload.sub).length > 512) {
      throw new Error("OIDC ID token subject exceeds its maximum length.");
    }
    if (
      typeof payload.azp === "string"
      && payload.azp !== config.clientId
    ) {
      throw new Error("OIDC ID token has an unexpected authorized party.");
    }
    if (
      Array.isArray(payload.aud)
      && payload.aud.length > 1
      && payload.azp !== config.clientId
    ) {
      throw new Error(
        "OIDC ID token with multiple audiences is missing the expected authorized party.",
      );
    }
    return payload;
  }

  return Object.freeze({
    createAuthorizationUrl,
    exchangeAuthorizationCode,
    getDiscovery,
    verifyIdToken,
  });
}
