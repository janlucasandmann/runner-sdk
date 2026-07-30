import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { PLATFORM_SESSION_API_KEY_SENTINEL } from "../gateway/http-utils.mjs";
import { createBrowserAuthModuleSource } from "./browser-auth-module.mjs";
import { clearCookie, readCookie, serializeCookie } from "./cookies.mjs";
import { createOidcClient } from "./oidc-client.mjs";
import { createPrincipalAssertionSigner } from "./principal-assertion.mjs";
import { createPlatformSessionCodec } from "./session-codec.mjs";

const OIDC_TRANSACTION_TTL_SECONDS = 10 * 60;
const ALLOWED_OIDC_PROMPTS = new Set([
  "consent",
  "login",
  "select_account",
]);

function randomBase64Url(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function equalSecretValues(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeReturnTo(value, platformOrigin) {
  const fallback = "/";
  try {
    const candidate = new URL(String(value || fallback), platformOrigin);
    if (candidate.origin !== new URL(platformOrigin).origin) return fallback;
    const normalized = `${candidate.pathname}${candidate.search}${candidate.hash}`
      || fallback;
    return normalized.length <= 2_048 ? normalized : fallback;
  } catch {
    return fallback;
  }
}

function deriveControlApiRoot(defaultUpstreamOrigin) {
  const target = new URL(defaultUpstreamOrigin);
  target.pathname = target.pathname.replace(/\/v1\/?$/, "").replace(/\/+$/, "");
  target.search = "";
  target.hash = "";
  return target.toString().replace(/\/+$/, "");
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function sendJson(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(body);
}

function writeRedirect(response, location, setCookie = []) {
  response.writeHead(303, {
    Location: location,
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    ...(setCookie.length ? { "Set-Cookie": setCookie } : {}),
  });
  response.end();
}

function reportIdentityFailure(operation, error) {
  console.warn(`[platform-identity] ${operation} failed`, {
    message: error instanceof Error ? error.message : String(error),
  });
}

function normalizePrincipal(payload, issuer) {
  function optionalClaim(value, maximumLength) {
    if (typeof value !== "string") return "";
    const normalized = value.trim();
    if (normalized.length > maximumLength) {
      throw new Error("OIDC profile claim exceeds its maximum length.");
    }
    return normalized;
  }
  const subject = optionalClaim(payload.sub, 512);
  if (!subject) throw new Error("OIDC profile is missing its subject.");
  return Object.freeze({
    provider: "oidc",
    issuer,
    subject,
    email: optionalClaim(payload.email, 320),
    emailVerified: payload.email_verified === true,
    displayName: optionalClaim(
      typeof payload.name === "string"
        ? payload.name
        : payload.preferred_username,
      256,
    ),
    pictureUrl: optionalClaim(payload.picture, 2_048),
    tenant: optionalClaim(
      typeof payload.tid === "string" ? payload.tid : payload.tenant,
      512,
    ),
  });
}

export function createOidcIdentityService(config, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || fetch;
  const oidcClient = dependencies.oidcClient || createOidcClient(
    config.oidc,
    { fetchImpl },
  );
  const sessionCodec = dependencies.sessionCodec || createPlatformSessionCodec(
    config.platformSessionSecret,
  );
  const assertionSigner = dependencies.assertionSigner
    || createPrincipalAssertionSigner({
      secret: config.platformControlPlaneSecret,
      issuer: config.platformPrincipalAssertionIssuer,
      audience: config.platformPrincipalAssertionAudience,
    });
  const controlApiRoot = deriveControlApiRoot(config.defaultUpstreamOrigin);
  const transactionCookieName = `${config.platformSessionCookieName}_oidc`;
  const cookieOptions = Object.freeze({
    httpOnly: true,
    secure: config.platformCookieSecure,
    sameSite: "Lax",
    path: "/",
  });
  const callbackUri = new URL(config.oidc.callbackPath, config.platformOrigin).toString();

  async function readSession(request) {
    const token = readCookie(request, config.platformSessionCookieName);
    const session = await sessionCodec.open(token, "platform_session");
    if (
      !session?.principal
      || !session?.profile?.userId
      || !session?.credential?.key
      || !session?.credential?.id
      || Date.parse(session?.credential?.expiresAt || "") <= Date.now()
    ) {
      return null;
    }
    return session;
  }

  async function exchangePrincipal(principal) {
    const assertion = await assertionSigner.sign(principal);
    const response = await fetchImpl(
      `${controlApiRoot}/internal/principal-sessions`,
      {
        method: "POST",
        headers: {
          authorization: `ComputerAgentsPrincipal ${assertion}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ttlSeconds: config.platformSessionTtlSeconds,
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.profile?.userId || !payload?.credential?.key) {
      throw new Error(
        payload?.message
        || `Control-plane principal exchange failed with HTTP ${response.status}.`,
      );
    }
    return payload;
  }

  async function revokeCredential(session) {
    if (!session?.credential?.id || !session?.principal) return;
    try {
      const assertion = await assertionSigner.sign(session.principal);
      await fetchImpl(
        `${controlApiRoot}/internal/principal-sessions/${encodeURIComponent(
          session.credential.id,
        )}/revoke`,
        {
          method: "POST",
          headers: {
            authorization: `ComputerAgentsPrincipal ${assertion}`,
            "content-type": "application/json",
          },
          body: "{}",
          signal: AbortSignal.timeout(5_000),
        },
      );
    } catch {
      // The credential is time-bounded; local logout must not be blocked by a
      // temporarily unavailable control API.
    }
  }

  async function handleLoginRequest(request, response, url) {
    const state = randomBase64Url();
    const nonce = randomBase64Url();
    const codeVerifier = randomBase64Url();
    const codeChallenge = createHash("sha256")
      .update(codeVerifier, "ascii")
      .digest("base64url");
    const returnTo = normalizeReturnTo(
      url.searchParams.get("return_to") || request.headers.referer || "/",
      config.platformOrigin,
    );
    const requestedPrompt = String(url.searchParams.get("prompt") || "").trim();
    const prompt = ALLOWED_OIDC_PROMPTS.has(requestedPrompt)
      ? requestedPrompt
      : "";
    const transaction = await sessionCodec.seal(
      "oidc_transaction",
      { state, nonce, codeVerifier, returnTo },
      OIDC_TRANSACTION_TTL_SECONDS,
    );
    const authorizationUrl = await oidcClient.createAuthorizationUrl({
      redirectUri: callbackUri,
      state,
      nonce,
      codeChallenge,
      prompt,
    });
    writeRedirect(response, authorizationUrl.toString(), [
      serializeCookie(transactionCookieName, transaction, {
        ...cookieOptions,
        maxAge: OIDC_TRANSACTION_TTL_SECONDS,
      }),
    ]);
  }

  async function handleCallbackRequest(request, response, url) {
    const transactionToken = readCookie(request, transactionCookieName);
    const transaction = await sessionCodec.open(
      transactionToken,
      "oidc_transaction",
    );
    if (!transaction) {
      sendJson(response, 400, {
        error: "OIDC transaction expired",
        message: "Start the sign-in flow again.",
      });
      return;
    }
    if (url.searchParams.get("error")) {
      sendJson(response, 401, {
        error: "OIDC authorization failed",
        message: "The identity provider did not authorize this sign-in.",
      }, {
        "Set-Cookie": clearCookie(transactionCookieName, cookieOptions),
      });
      return;
    }
    const code = String(url.searchParams.get("code") || "");
    const state = String(url.searchParams.get("state") || "");
    if (!code || !equalSecretValues(state, transaction.state)) {
      sendJson(response, 400, {
        error: "OIDC callback rejected",
        message: "The authorization response did not match the login transaction.",
      }, {
        "Set-Cookie": clearCookie(transactionCookieName, cookieOptions),
      });
      return;
    }
    const tokens = await oidcClient.exchangeAuthorizationCode({
      code,
      codeVerifier: transaction.codeVerifier,
      redirectUri: callbackUri,
    });
    const idToken = await oidcClient.verifyIdToken(
      tokens.id_token,
      transaction.nonce,
    );
    const principal = normalizePrincipal(idToken, config.oidc.issuerUrl);
    const exchange = await exchangePrincipal(principal);
    const sessionPayload = {
      principal,
      profile: exchange.profile,
      subscription: exchange.subscription || {},
      credential: exchange.credential,
    };
    const sessionToken = await sessionCodec.seal(
      "platform_session",
      sessionPayload,
      config.platformSessionTtlSeconds,
    );
    writeRedirect(
      response,
      new URL(
        normalizeReturnTo(transaction.returnTo, config.platformOrigin),
        config.platformOrigin,
      ).toString(),
      [
        serializeCookie(config.platformSessionCookieName, sessionToken, {
          ...cookieOptions,
          maxAge: config.platformSessionTtlSeconds,
        }),
        clearCookie(transactionCookieName, cookieOptions),
      ],
    );
  }

  async function handleLogoutRequest(request, response, url) {
    const session = await readSession(request);
    await revokeCredential(session);
    const returnTo = normalizeReturnTo(
      url.searchParams.get("return_to") || "/",
      config.platformOrigin,
    );
    writeRedirect(
      response,
      new URL(returnTo, config.platformOrigin).toString(),
      [
        clearCookie(config.platformSessionCookieName, cookieOptions),
        clearCookie(transactionCookieName, cookieOptions),
      ],
    );
  }

  function sessionProfilePayload(session) {
    return {
      userId: session.profile.userId,
      email: session.profile.email || session.principal.email || "",
      emailVerified: Boolean(
        session.profile.emailVerified ?? session.principal.emailVerified,
      ),
      onboardingCompleted: true,
      profile: {
        projectId: "",
        displayName:
          session.profile.displayName || session.principal.displayName || "",
        photoURL: session.profile.photoURL || session.principal.pictureUrl || "",
      },
      subscription: {
        tier: session.subscription?.tier || "sandbox",
        status: session.subscription?.status || "",
      },
    };
  }

  async function handleSessionRequest(request, response) {
    const session = await readSession(request);
    if (!session) {
      sendJson(response, 401, {
        error: "Unauthorized",
        message: "A valid platform session is required.",
      }, {
        "Set-Cookie": clearCookie(
          config.platformSessionCookieName,
          cookieOptions,
        ),
      });
      return;
    }
    sendJson(response, 200, {
      profile: sessionProfilePayload(session),
      streaming: {
        apiKey: PLATFORM_SESSION_API_KEY_SENTINEL,
        backendUrl: "",
      },
      streamingOk: true,
      streamingStatus: 200,
    });
  }

  async function handleAccountJsonRequest(request, response, path, method) {
    const session = await readSession(request);
    if (!session) {
      sendJson(response, 401, {
        error: "Unauthorized",
        message: "A valid platform session is required.",
      });
      return true;
    }
    if (method === "GET" && path === "/api/user/profile") {
      sendJson(response, 200, sessionProfilePayload(session));
      return true;
    }
    if (method === "GET" && path === "/api/user/streaming-key") {
      sendJson(response, 200, {
        apiKey: PLATFORM_SESSION_API_KEY_SENTINEL,
        backendUrl: "",
      });
      return true;
    }
    sendJson(response, 501, {
      error: "Capability unavailable",
      code: "ON_PREM_ACCOUNT_CAPABILITY_UNAVAILABLE",
      message: "This hosted account or connector capability is not enabled on this appliance.",
    });
    return true;
  }

  async function fetchControlApi(request, upstreamPath, init = {}) {
    const session = await readSession(request);
    if (!session) {
      return jsonResponse(401, {
        error: "Unauthorized",
        message: "A valid platform session is required.",
      });
    }
    const normalizedPath = upstreamPath.startsWith("/")
      ? upstreamPath
      : `/${upstreamPath}`;
    const target = new URL(`${config.defaultUpstreamOrigin}${normalizedPath}`);
    const headers = new Headers(init.headers || {});
    headers.delete("cookie");
    headers.delete("authorization");
    headers.delete("x-api-key");
    headers.set("X-API-Key", session.credential.key);
    return fetchImpl(target, {
      method: init.method || "GET",
      headers,
      signal: init.signal,
      body: init.body,
    });
  }

  function handleRequest(request, response, url) {
    if (
      request.method === "GET"
      && url.pathname === "/api/platform/auth/browser-module.js"
    ) {
      const source = createBrowserAuthModuleSource("oidc");
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Content-Length": Buffer.byteLength(source),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(source);
      return true;
    }
    if (request.method === "GET" && url.pathname === "/api/platform/auth/login") {
      void handleLoginRequest(request, response, url).catch((error) => {
        reportIdentityFailure("OIDC sign-in initialization", error);
        if (!response.headersSent) {
          sendJson(response, 502, {
            error: "OIDC sign-in unavailable",
            message: "The identity provider is temporarily unavailable.",
          });
        }
      });
      return true;
    }
    if (
      request.method === "GET"
      && url.pathname === config.oidc.callbackPath
    ) {
      void handleCallbackRequest(request, response, url).catch((error) => {
        reportIdentityFailure("OIDC callback verification", error);
        if (!response.headersSent) {
          sendJson(response, 502, {
            error: "OIDC callback failed",
            message: "The sign-in response could not be verified.",
          }, {
            "Set-Cookie": clearCookie(transactionCookieName, cookieOptions),
          });
        }
      });
      return true;
    }
    if (request.method === "GET" && url.pathname === "/api/platform/auth/logout") {
      void handleLogoutRequest(request, response, url).catch((error) => {
        reportIdentityFailure("platform logout", error);
        if (!response.headersSent) {
          sendJson(response, 500, {
            error: "Logout failed",
            message: "The local platform session could not be cleared.",
          });
        }
      });
      return true;
    }
    return false;
  }

  return Object.freeze({
    provider: "oidc",
    fetchControlApi,
    handleAccountJsonRequest,
    handleRequest,
    handleSessionRequest,
    hasSession(request) {
      return Boolean(readCookie(request, config.platformSessionCookieName));
    },
    async readPrincipal(request) {
      const session = await readSession(request);
      if (!session) return null;
      return Object.freeze({
        provider: "oidc",
        userId: session.profile.userId,
        uid: session.profile.userId,
        email: session.profile.email || session.principal.email || "",
        principal: session.principal,
      });
    },
    readSession,
  });
}
