import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { PLATFORM_SESSION_API_KEY_SENTINEL } from "../gateway/http-utils.mjs";
import { createBrowserAuthModuleSource } from "./browser-auth-module.mjs";
import {
  clearCookie,
  readCookie,
  readCookies,
  serializeCookie,
} from "./cookies.mjs";
import { createDexLocalAccountService } from "./dex-local-account-service.mjs";
import {
  createSignUpRateLimiter,
  readUrlEncodedForm,
  renderSignUpPage,
  validateSignUpFields,
} from "./local-account-pages.mjs";
import { createOidcClient } from "./oidc-client.mjs";
import { createPrincipalAssertionSigner } from "./principal-assertion.mjs";
import { createPlatformSessionCodec } from "./session-codec.mjs";

const OIDC_TRANSACTION_TTL_SECONDS = 10 * 60;
const SIGN_UP_CSRF_TTL_SECONDS = 15 * 60;
const ACCOUNT_JSON_REQUEST_BODY_LIMIT_BYTES = 1024 * 1024;
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

function sendHtml(response, status, html) {
  response.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(html);
}

async function readBoundedRequestBody(request, limitBytes) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > limitBytes) {
      const error = new Error("Request body is too large.");
      error.code = "REQUEST_BODY_TOO_LARGE";
      throw error;
    }
    chunks.push(buffer);
  }
  return chunks.length ? Buffer.concat(chunks, totalBytes) : undefined;
}

async function relayJsonFetchResponse(upstream, response) {
  const body = Buffer.from(await upstream.arrayBuffer());
  response.writeHead(upstream.status, {
    "Content-Type": upstream.headers.get("content-type")
      || "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
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

function reportIdentityRejection(operation, reason, details = {}) {
  console.warn(`[platform-identity] ${operation} rejected`, {
    reason,
    ...details,
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
  const localAccountService = dependencies.localAccountService
    || createDexLocalAccountService(config.oidc.localAccounts);
  const signUpRateLimiter = dependencies.signUpRateLimiter
    || createSignUpRateLimiter();
  const controlApiRoot = deriveControlApiRoot(config.defaultUpstreamOrigin);
  const transactionCookieName = `${config.platformSessionCookieName}_oidc`;
  const transactionCookiePrefix = `${transactionCookieName}_`;
  const cookieOptions = Object.freeze({
    httpOnly: true,
    secure: config.platformCookieSecure,
    sameSite: "Lax",
    path: "/",
  });
  const callbackUri = new URL(config.oidc.callbackPath, config.platformOrigin).toString();

  function transactionCookieNameForState(state) {
    const stateDigest = createHash("sha256")
      .update(String(state || ""), "utf8")
      .digest("hex")
      .slice(0, 24);
    return `${transactionCookiePrefix}${stateDigest}`;
  }

  function transactionCookieNamesInRequest(request) {
    return [...readCookies(request).keys()].filter((name) =>
      name === transactionCookieName || name.startsWith(transactionCookiePrefix));
  }

  function clearTransactionCookies(
    request,
    names = [],
    { includeAll = false } = {},
  ) {
    const candidates = new Set(names.filter(Boolean));
    if (includeAll) {
      for (const name of transactionCookieNamesInRequest(request)) {
        candidates.add(name);
      }
    }
    if (candidates.size === 0) candidates.add(transactionCookieName);
    return [...candidates].map((name) => clearCookie(name, cookieOptions));
  }

  function callbackTransactionContext(request, state) {
    const stateCookieName = state
      ? transactionCookieNameForState(state)
      : "";
    const stateToken = stateCookieName
      ? readCookie(request, stateCookieName)
      : "";
    const legacyToken = stateToken
      ? ""
      : readCookie(request, transactionCookieName);
    return Object.freeze({
      cookieName: stateToken ? stateCookieName : transactionCookieName,
      stateCookieName,
      token: stateToken || legacyToken,
      usedLegacyCookie: Boolean(!stateToken && legacyToken),
    });
  }

  function requestClientAddress(request) {
    const forwarded = String(request.headers["x-forwarded-for"] || "")
      .split(",", 1)[0]
      .trim();
    return forwarded || request.socket?.remoteAddress || "unknown";
  }

  async function createSignUpCsrfToken() {
    return sessionCodec.seal(
      "signup_csrf",
      { nonce: randomBase64Url() },
      SIGN_UP_CSRF_TTL_SECONDS,
    );
  }

  async function writeSignUpPage(response, { status = 200, values, error } = {}) {
    const csrfToken = await createSignUpCsrfToken();
    sendHtml(response, status, renderSignUpPage({ csrfToken, values, error }));
  }

  async function handleSignUpRequest(request, response) {
    if (!localAccountService) {
      sendJson(response, 404, {
        error: "Not found",
        message: "Local account registration is not enabled.",
      });
      return;
    }
    if (request.method === "GET") {
      await writeSignUpPage(response);
      return;
    }
    let fields;
    try {
      fields = await readUrlEncodedForm(request);
    } catch (error) {
      await writeSignUpPage(response, {
        status: 400,
        error: error instanceof Error ? error.message : "The form could not be read.",
      });
      return;
    }
    const csrf = await sessionCodec.open(fields.csrf, "signup_csrf");
    if (!csrf?.nonce) {
      await writeSignUpPage(response, {
        status: 400,
        values: fields,
        error: "This sign-up form expired. Please try again.",
      });
      return;
    }
    if (!signUpRateLimiter.consume(requestClientAddress(request))) {
      await writeSignUpPage(response, {
        status: 429,
        values: fields,
        error: "Too many sign-up attempts. Please try again in a few minutes.",
      });
      return;
    }
    const validation = validateSignUpFields(fields);
    if (!validation.ok) {
      await writeSignUpPage(response, {
        status: 400,
        values: validation.values,
        error: validation.error,
      });
      return;
    }
    const result = await localAccountService.createAccount({
      email: validation.values.email,
      displayName: validation.values.name,
      password: validation.password,
    });
    if (result.alreadyExists) {
      await writeSignUpPage(response, {
        status: 409,
        values: validation.values,
        error: "An account with this email already exists. Sign in instead.",
      });
      return;
    }
    const principal = normalizePrincipal({
      sub: result.subject,
      email: validation.values.email,
      email_verified: true,
      name: validation.values.name,
    }, config.oidc.issuerUrl);
    let sessionToken;
    try {
      sessionToken = await createPlatformSessionToken(principal);
    } catch (error) {
      reportIdentityFailure("post-registration session provisioning", error);
      writeRedirect(response, "/api/platform/auth/login?return_to=%2F");
      return;
    }
    writeRedirect(response, new URL("/", config.platformOrigin).toString(), [
      serializeCookie(config.platformSessionCookieName, sessionToken, {
        ...cookieOptions,
        maxAge: config.platformSessionTtlSeconds,
      }),
      ...clearTransactionCookies(request, [], { includeAll: true }),
    ]);
  }

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

  async function createPlatformSessionToken(principal) {
    const exchange = await exchangePrincipal(principal);
    return sessionCodec.seal(
      "platform_session",
      {
        principal,
        profile: exchange.profile,
        subscription: exchange.subscription || {},
        credential: exchange.credential,
      },
      config.platformSessionTtlSeconds,
    );
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
      url.searchParams.get("return_to") || "/",
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
      serializeCookie(transactionCookieNameForState(state), transaction, {
        ...cookieOptions,
        maxAge: OIDC_TRANSACTION_TTL_SECONDS,
      }),
    ]);
  }

  async function handleCallbackRequest(request, response, url) {
    const state = String(url.searchParams.get("state") || "");
    const transactionContext = callbackTransactionContext(request, state);
    const transaction = await sessionCodec.open(
      transactionContext.token,
      "oidc_transaction",
    );
    if (!transaction) {
      reportIdentityRejection("OIDC callback", "transaction_missing_or_expired", {
        hasState: Boolean(state),
        hasProviderError: Boolean(url.searchParams.get("error")),
        usedLegacyCookie: transactionContext.usedLegacyCookie,
      });
      sendJson(response, 400, {
        error: "OIDC transaction expired",
        message: "Start the sign-in flow again.",
      }, {
        "Set-Cookie": clearTransactionCookies(
          request,
          [transactionContext.stateCookieName],
        ),
      });
      return;
    }
    if (url.searchParams.get("error")) {
      reportIdentityRejection("OIDC callback", "provider_authorization_error", {
        hasState: Boolean(state),
        usedLegacyCookie: transactionContext.usedLegacyCookie,
      });
      sendJson(response, 401, {
        error: "OIDC authorization failed",
        message: "The identity provider did not authorize this sign-in.",
      }, {
        "Set-Cookie": clearTransactionCookies(
          request,
          [transactionContext.cookieName],
        ),
      });
      return;
    }
    const code = String(url.searchParams.get("code") || "");
    if (!code || !equalSecretValues(state, transaction.state)) {
      reportIdentityRejection("OIDC callback", "state_or_code_mismatch", {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        usedLegacyCookie: transactionContext.usedLegacyCookie,
      });
      sendJson(response, 400, {
        error: "OIDC callback rejected",
        message: "The authorization response did not match the login transaction.",
      }, {
        "Set-Cookie": clearTransactionCookies(
          request,
          [transactionContext.cookieName],
        ),
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
    const sessionToken = await createPlatformSessionToken(principal);
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
        clearCookie(transactionContext.cookieName, cookieOptions),
        ...(transactionContext.usedLegacyCookie
          ? []
          : [clearCookie(transactionCookieName, cookieOptions)]),
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
        ...clearTransactionCookies(request, [], { includeAll: true }),
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
    const apiKeysCollectionMatch = path === "/api/user/api-keys";
    const apiKeyOperationMatch = path.match(
      /^\/api\/user\/api-keys\/([^/]+)\/(revoke|reveal)$/,
    );
    const isSupportedApiKeyRequest = (
      apiKeysCollectionMatch && (method === "GET" || method === "POST")
    ) || (
      apiKeyOperationMatch
      && (
        (apiKeyOperationMatch[2] === "revoke" && method === "POST")
        || (apiKeyOperationMatch[2] === "reveal" && method === "GET")
      )
    );
    if (isSupportedApiKeyRequest) {
      try {
        let controlPath = "/api-keys";
        if (apiKeyOperationMatch) {
          const keyId = encodeURIComponent(
            decodeURIComponent(apiKeyOperationMatch[1]),
          );
          controlPath = `/api-keys/${keyId}/${apiKeyOperationMatch[2]}`;
        } else {
          const requestUrl = new URL(request.url || "/", config.platformOrigin);
          controlPath += requestUrl.search;
        }
        const body = method === "GET" || method === "HEAD"
          ? undefined
          : await readBoundedRequestBody(
              request,
              ACCOUNT_JSON_REQUEST_BODY_LIMIT_BYTES,
            );
        const upstream = await fetchControlApi(request, controlPath, {
          method,
          headers: {
            accept: "application/json",
            ...(body ? { "content-type": "application/json" } : {}),
          },
          body,
          signal: AbortSignal.timeout(15_000),
        });
        await relayJsonFetchResponse(upstream, response);
      } catch (error) {
        if (error?.code === "REQUEST_BODY_TOO_LARGE") {
          sendJson(response, 413, {
            error: "Request body too large",
            code: "REQUEST_BODY_TOO_LARGE",
            message: "The API key request body exceeds the allowed size.",
          });
          return true;
        }
        reportIdentityFailure("API key account proxy", error);
        sendJson(response, 502, {
          error: "API key service unavailable",
          code: "API_KEY_SERVICE_UNAVAILABLE",
          message: "The appliance control API could not complete the API key request.",
        });
      }
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
      ["GET", "POST"].includes(request.method)
      && url.pathname === "/signup"
    ) {
      void handleSignUpRequest(request, response).catch((error) => {
        reportIdentityFailure("local account registration", error);
        if (!response.headersSent) {
          void writeSignUpPage(response, {
            status: 503,
            error: "Account creation is temporarily unavailable. Please try again.",
          });
        }
      });
      return true;
    }
    if (request.method === "GET" && url.pathname === "/signin") {
      writeRedirect(response, "/api/platform/auth/login");
      return true;
    }
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
            "Set-Cookie": clearTransactionCookies(
              request,
              [
                url.searchParams.get("state")
                  ? transactionCookieNameForState(url.searchParams.get("state"))
                  : "",
              ],
            ),
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
