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
  renderForgotPasswordPage,
  renderResetPasswordPage,
  renderSignUpPage,
  validatePasswordFields,
  validateResetEmail,
  validateSignUpFields,
} from "./local-account-pages.mjs";
import { createOidcClient } from "./oidc-client.mjs";
import { createPasswordResetMailer } from "./password-reset-mailer.mjs";
import { createPasswordResetService } from "./password-reset-service.mjs";
import { createPrincipalAssertionSigner } from "./principal-assertion.mjs";
import { createPlatformSessionCodec } from "./session-codec.mjs";

const OIDC_TRANSACTION_TTL_SECONDS = 10 * 60;
const SIGN_UP_CSRF_TTL_SECONDS = 15 * 60;
const PASSWORD_RESET_CSRF_TTL_SECONDS = 15 * 60;
const ACCOUNT_JSON_REQUEST_BODY_LIMIT_BYTES = 1024 * 1024;
const PROFILE_IMAGE_RESPONSE_LIMIT_BYTES = 2 * 1024 * 1024;
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

function encodeDecodedPathSegment(value) {
  try {
    const decoded = decodeURIComponent(String(value || ""));
    return decoded ? encodeURIComponent(decoded) : "";
  } catch {
    return "";
  }
}

function matchApplianceProjectTriggerRequest(path, method) {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const collectionMatch = path.match(
    /^\/api\/projects\/([^/]+)\/triggers$/,
  );
  if (
    collectionMatch
    && ["GET", "POST"].includes(normalizedMethod)
    && encodeDecodedPathSegment(collectionMatch[1])
  ) {
    return Object.freeze({
      controlPath: "/triggers",
      method: normalizedMethod,
      responseShape: normalizedMethod === "GET" ? "list" : "passthrough",
    });
  }

  const testMatch = path.match(
    /^\/api\/projects\/([^/]+)\/triggers\/([^/]+)\/test$/,
  );
  if (testMatch && normalizedMethod === "POST") {
    const projectId = encodeDecodedPathSegment(testMatch[1]);
    const triggerId = encodeDecodedPathSegment(testMatch[2]);
    if (projectId && triggerId) {
      return Object.freeze({
        controlPath: `/triggers/${triggerId}/test`,
        method: normalizedMethod,
        responseShape: "passthrough",
      });
    }
  }

  const itemMatch = path.match(
    /^\/api\/projects\/([^/]+)\/triggers\/([^/]+)$/,
  );
  if (
    itemMatch
    && ["GET", "PATCH", "DELETE"].includes(normalizedMethod)
  ) {
    const projectId = encodeDecodedPathSegment(itemMatch[1]);
    const triggerId = encodeDecodedPathSegment(itemMatch[2]);
    if (projectId && triggerId) {
      return Object.freeze({
        controlPath: `/triggers/${triggerId}`,
        method: normalizedMethod,
        responseShape: normalizedMethod === "DELETE" ? "delete" : "passthrough",
      });
    }
  }

  return null;
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

function sendHtml(response, status, html, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    ...headers,
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

async function relayProfileImageFetchResponse(upstream, response) {
  if (upstream.status === 304) {
    response.writeHead(304, {
      "Cache-Control": upstream.headers.get("cache-control")
        || "private, max-age=31536000, immutable",
      ...(upstream.headers.get("etag")
        ? { ETag: upstream.headers.get("etag") }
        : {}),
    });
    response.end();
    return;
  }
  if (!upstream.ok) {
    await relayJsonFetchResponse(upstream, response);
    return;
  }
  const contentType = String(upstream.headers.get("content-type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("The control API returned an unsupported profile image type.");
  }
  const declaredLength = Number(upstream.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength)
    && declaredLength > PROFILE_IMAGE_RESPONSE_LIMIT_BYTES
  ) {
    throw new Error("The control API returned an oversized profile image.");
  }
  const body = Buffer.from(await upstream.arrayBuffer());
  if (body.length > PROFILE_IMAGE_RESPONSE_LIMIT_BYTES) {
    throw new Error("The control API returned an oversized profile image.");
  }
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": body.length,
    "Cache-Control": upstream.headers.get("cache-control")
      || "private, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    ...(upstream.headers.get("etag")
      ? { ETag: upstream.headers.get("etag") }
      : {}),
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
  const passwordResetRequestIpRateLimiter = dependencies.passwordResetRequestIpRateLimiter
    || createSignUpRateLimiter({ limit: 10, windowMs: 15 * 60_000 });
  const passwordResetRequestEmailRateLimiter = dependencies.passwordResetRequestEmailRateLimiter
    || createSignUpRateLimiter({ limit: 3, windowMs: 15 * 60_000 });
  const passwordResetAttemptRateLimiter = dependencies.passwordResetAttemptRateLimiter
    || createSignUpRateLimiter({ limit: 10, windowMs: 15 * 60_000 });
  const passwordResetMailer = dependencies.passwordResetMailer !== undefined
    ? dependencies.passwordResetMailer
    : dependencies.passwordResetService !== undefined
      ? null
      : createPasswordResetMailer(config.passwordReset, { fetchImpl });
  const passwordResetService = dependencies.passwordResetService !== undefined
    ? dependencies.passwordResetService
    : createPasswordResetService({
      accountService: localAccountService,
      mailer: passwordResetMailer,
      platformOrigin: config.platformOrigin,
      sessionCodec,
      statePath: config.passwordReset?.statePath,
      tokenTtlSeconds: config.passwordReset?.tokenTtlSeconds,
    });
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

  async function createPasswordResetRequestCsrfToken() {
    return sessionCodec.seal(
      "password_reset_request_csrf",
      { nonce: randomBase64Url() },
      PASSWORD_RESET_CSRF_TTL_SECONDS,
    );
  }

  async function createPasswordResetCsrfToken(token) {
    return sessionCodec.seal(
      "password_reset_csrf",
      {
        nonce: randomBase64Url(),
        tokenDigest: createHash("sha256").update(token).digest("hex"),
      },
      PASSWORD_RESET_CSRF_TTL_SECONDS,
    );
  }

  async function writeForgotPasswordPage(
    response,
    { status = 200, values, error, sent = false } = {},
  ) {
    const csrfToken = sent ? "" : await createPasswordResetRequestCsrfToken();
    sendHtml(response, status, renderForgotPasswordPage({
      csrfToken,
      values,
      error,
      sent,
    }));
  }

  async function handleForgotPasswordRequest(request, response) {
    if (!passwordResetService) {
      await writeForgotPasswordPage(response, {
        status: 503,
        error: "Password reset is temporarily unavailable. Please try again later.",
      });
      return;
    }
    if (request.method === "GET") {
      await writeForgotPasswordPage(response);
      return;
    }
    let fields;
    try {
      fields = await readUrlEncodedForm(request);
    } catch (error) {
      await writeForgotPasswordPage(response, {
        status: 400,
        error: error instanceof Error ? error.message : "The form could not be read.",
      });
      return;
    }
    const csrf = await sessionCodec.open(
      fields.csrf,
      "password_reset_request_csrf",
    );
    if (!csrf?.nonce) {
      await writeForgotPasswordPage(response, {
        status: 400,
        values: fields,
        error: "This password reset form expired. Please try again.",
      });
      return;
    }
    const validation = validateResetEmail(fields.email);
    if (!validation.ok) {
      await writeForgotPasswordPage(response, {
        status: 400,
        values: { email: validation.email },
        error: validation.error,
      });
      return;
    }
    const emailRateKey = createHash("sha256")
      .update(validation.email)
      .digest("hex");
    if (
      !passwordResetRequestIpRateLimiter.consume(requestClientAddress(request))
      || !passwordResetRequestEmailRateLimiter.consume(emailRateKey)
    ) {
      await writeForgotPasswordPage(response, {
        status: 429,
        values: { email: validation.email },
        error: "Too many password reset requests. Please try again later.",
      });
      return;
    }
    try {
      await passwordResetService.request(validation.email);
    } catch (error) {
      reportIdentityFailure("password reset email delivery", error);
    }
    await writeForgotPasswordPage(response, { sent: true });
  }

  async function writeResetPasswordPage(
    response,
    { status = 200, token = "", error, complete = false, invalid = false } = {},
  ) {
    const csrfToken = token && !complete && !invalid
      ? await createPasswordResetCsrfToken(token)
      : "";
    sendHtml(response, status, renderResetPasswordPage({
      csrfToken,
      token,
      error,
      complete,
      invalid,
    }), complete ? {
      "Set-Cookie": clearCookie(
        config.platformSessionCookieName,
        cookieOptions,
      ),
    } : {});
  }

  async function handleResetPasswordRequest(request, response, url) {
    if (!passwordResetService) {
      await writeResetPasswordPage(response, { status: 503, invalid: true });
      return;
    }
    if (request.method === "GET") {
      const token = String(url.searchParams.get("token") || "");
      if (!token || !(await passwordResetService.inspect(token))) {
        await writeResetPasswordPage(response, { status: 400, invalid: true });
        return;
      }
      await writeResetPasswordPage(response, { token });
      return;
    }
    let fields;
    try {
      fields = await readUrlEncodedForm(request);
    } catch {
      await writeResetPasswordPage(response, { status: 400, invalid: true });
      return;
    }
    const token = String(fields.token || "");
    const csrf = await sessionCodec.open(fields.csrf, "password_reset_csrf");
    const tokenDigest = createHash("sha256").update(token).digest("hex");
    if (
      !csrf?.nonce
      || !equalSecretValues(csrf.tokenDigest, tokenDigest)
      || !passwordResetAttemptRateLimiter.consume(requestClientAddress(request))
    ) {
      await writeResetPasswordPage(response, { status: 400, invalid: true });
      return;
    }
    const validation = validatePasswordFields(fields);
    if (!validation.ok) {
      if (!(await passwordResetService.inspect(token))) {
        await writeResetPasswordPage(response, { status: 400, invalid: true });
        return;
      }
      await writeResetPasswordPage(response, {
        status: 400,
        token,
        error: validation.error,
      });
      return;
    }
    const result = await passwordResetService.reset(token, validation.password);
    if (!result.updated) {
      await writeResetPasswordPage(response, { status: 400, invalid: true });
      return;
    }
    await writeResetPasswordPage(response, { complete: true });
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
    if (
      typeof localAccountService?.findAccount === "function"
      && session.principal.email
    ) {
      const account = await localAccountService.findAccount(
        session.principal.email,
      );
      const sessionPasswordFingerprint = String(
        session.localPasswordFingerprint || "",
      );
      const accountPasswordFingerprint = String(
        account?.passwordFingerprint || "",
      );
      if (
        account
        && sessionPasswordFingerprint
        && accountPasswordFingerprint
        && sessionPasswordFingerprint !== accountPasswordFingerprint
      ) {
        return null;
      }
      if (!account && sessionPasswordFingerprint) return null;
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
    const localAccount = typeof localAccountService?.findAccount === "function"
      && principal.email
      ? await localAccountService.findAccount(principal.email)
      : null;
    return sessionCodec.seal(
      "platform_session",
      {
        principal,
        profile: exchange.profile,
        subscription: exchange.subscription || {},
        credential: exchange.credential,
        ...(localAccount?.passwordFingerprint
          ? { localPasswordFingerprint: localAccount.passwordFingerprint }
          : {}),
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
    const sessionPhotoURL = typeof session.profile.photoURL === "string"
      ? session.profile.photoURL
      : session.principal.pictureUrl || "";
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
        photoURL: sessionPhotoURL,
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
    const projectTriggerRequest = matchApplianceProjectTriggerRequest(
      path,
      method,
    );
    if (projectTriggerRequest) {
      try {
        const requestUrl = new URL(request.url || "/", config.platformOrigin);
        const body = ["GET", "HEAD"].includes(projectTriggerRequest.method)
          ? undefined
          : await readBoundedRequestBody(
              request,
              ACCOUNT_JSON_REQUEST_BODY_LIMIT_BYTES,
            );
        const controlPath = projectTriggerRequest.responseShape === "list"
          ? `${projectTriggerRequest.controlPath}${requestUrl.search}`
          : projectTriggerRequest.controlPath;
        const upstream = await fetchControlApi(request, controlPath, {
          method: projectTriggerRequest.method,
          headers: {
            accept: "application/json",
            ...(body ? { "content-type": "application/json" } : {}),
          },
          body,
          signal: AbortSignal.timeout(30_000),
        });
        if (!upstream.ok || projectTriggerRequest.responseShape === "passthrough") {
          await relayJsonFetchResponse(upstream, response);
          return true;
        }
        if (projectTriggerRequest.responseShape === "list") {
          const payload = await upstream.json().catch(() => ({}));
          sendJson(response, upstream.status, {
            triggers: Array.isArray(payload?.data) ? payload.data : [],
          });
          return true;
        }
        await upstream.arrayBuffer();
        sendJson(response, upstream.status, { success: true });
      } catch (error) {
        if (error?.code === "REQUEST_BODY_TOO_LARGE") {
          sendJson(response, 413, {
            error: "Request body too large",
            code: "WEBHOOK_REQUEST_BODY_TOO_LARGE",
            message: "The webhook request body exceeds the allowed size.",
          });
          return true;
        }
        reportIdentityFailure("appliance webhook proxy", error);
        sendJson(response, 502, {
          error: "Webhook service unavailable",
          code: "WEBHOOK_SERVICE_UNAVAILABLE",
          message: "The appliance control API could not complete the webhook request.",
        });
      }
      return true;
    }
    if (method === "GET" && path === "/api/user/profile") {
      sendJson(response, 200, sessionProfilePayload(session));
      return true;
    }
    if (method === "PATCH" && path === "/api/user/profile") {
      try {
        const body = await readBoundedRequestBody(
          request,
          ACCOUNT_JSON_REQUEST_BODY_LIMIT_BYTES,
        );
        let profileUpdate;
        try {
          profileUpdate = JSON.parse(String(body || "{}"));
        } catch {
          sendJson(response, 400, {
            error: "Invalid profile request",
            code: "PROFILE_REQUEST_INVALID",
            message: "The profile request must contain valid JSON.",
          });
          return true;
        }
        if (
          !profileUpdate
          || typeof profileUpdate !== "object"
          || Array.isArray(profileUpdate)
        ) {
          sendJson(response, 400, {
            error: "Invalid profile request",
            code: "PROFILE_REQUEST_INVALID",
            message: "The profile request must be a JSON object.",
          });
          return true;
        }

        const normalizedUpdate = { ...profileUpdate };
        const currentPhotoURL = typeof session.profile.photoURL === "string"
          ? session.profile.photoURL
          : "";
        if (
          typeof normalizedUpdate.photoURL === "string"
          && normalizedUpdate.photoURL === currentPhotoURL
          && !normalizedUpdate.photoURL.startsWith("data:image/")
        ) {
          delete normalizedUpdate.photoURL;
        }

        const upstream = await fetchControlApi(request, "/account/profile", {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(normalizedUpdate),
          signal: AbortSignal.timeout(20_000),
        });
        const upstreamPayload = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          sendJson(response, upstream.status, upstreamPayload);
          return true;
        }

        const nextSession = {
          ...session,
          profile: {
            ...session.profile,
            displayName: typeof upstreamPayload.displayName === "string"
              ? upstreamPayload.displayName
              : session.profile.displayName || "",
            photoURL: typeof upstreamPayload.photoURL === "string"
              ? upstreamPayload.photoURL
              : currentPhotoURL,
          },
        };
        const credentialExpiry = Date.parse(
          nextSession.credential?.expiresAt || "",
        );
        const credentialTtlSeconds = Number.isFinite(credentialExpiry)
          ? Math.floor((credentialExpiry - Date.now()) / 1000)
          : config.platformSessionTtlSeconds;
        const sessionTtlSeconds = Math.max(
          1,
          Math.min(config.platformSessionTtlSeconds, credentialTtlSeconds),
        );
        const sessionToken = await sessionCodec.seal(
          "platform_session",
          nextSession,
          sessionTtlSeconds,
        );
        sendJson(response, 200, sessionProfilePayload(nextSession), {
          "Set-Cookie": serializeCookie(
            config.platformSessionCookieName,
            sessionToken,
            {
              ...cookieOptions,
              maxAge: sessionTtlSeconds,
            },
          ),
        });
      } catch (error) {
        if (error?.code === "REQUEST_BODY_TOO_LARGE") {
          sendJson(response, 413, {
            error: "Request body too large",
            code: "REQUEST_BODY_TOO_LARGE",
            message: "The profile image exceeds the allowed upload size.",
          });
          return true;
        }
        reportIdentityFailure("appliance profile update", error);
        sendJson(response, 502, {
          error: "Profile service unavailable",
          code: "PROFILE_SERVICE_UNAVAILABLE",
          message: "The appliance control API could not update the profile.",
        });
      }
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
    const avatarMatch = url.pathname.match(
      /^\/api\/platform\/account\/avatar\/([^/]+)$/,
    );
    if (request.method === "GET" && avatarMatch) {
      void (async () => {
        try {
          const upstream = await fetchControlApi(
            request,
            `/account/avatar/${avatarMatch[1]}${url.search}`,
            {
              method: "GET",
              headers: {
                accept: "image/webp,image/png,image/jpeg",
                ...(request.headers["if-none-match"]
                  ? { "if-none-match": request.headers["if-none-match"] }
                  : {}),
              },
              signal: AbortSignal.timeout(10_000),
            },
          );
          await relayProfileImageFetchResponse(upstream, response);
        } catch (error) {
          reportIdentityFailure("appliance profile image", error);
          if (!response.headersSent) {
            sendJson(response, 502, {
              error: "Profile image unavailable",
              code: "PROFILE_IMAGE_UNAVAILABLE",
            });
          }
        }
      })();
      return true;
    }
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
      ["GET", "POST"].includes(request.method)
      && url.pathname === "/forgot-password"
    ) {
      void handleForgotPasswordRequest(request, response).catch((error) => {
        reportIdentityFailure("password reset request", error);
        if (!response.headersSent) {
          void writeForgotPasswordPage(response, {
            status: 503,
            error: "Password reset is temporarily unavailable. Please try again later.",
          });
        }
      });
      return true;
    }
    if (
      ["GET", "POST"].includes(request.method)
      && url.pathname === "/reset-password"
    ) {
      void handleResetPasswordRequest(request, response, url).catch((error) => {
        reportIdentityFailure("password update", error);
        if (!response.headersSent) {
          void writeResetPasswordPage(response, {
            status: 503,
            invalid: true,
          });
        }
      });
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
