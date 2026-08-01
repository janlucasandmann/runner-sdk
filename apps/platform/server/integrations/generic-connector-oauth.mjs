import { createHash, randomBytes } from "node:crypto";

import {
  appendConnectorOAuthResult,
  consumeConnectorOAuthState,
  deleteConnectorCredential,
  getConnectorRequestSearchParam,
  getConnectorRuntimeEnvValue,
  listPublicConnectorCredentials,
  normalizeConnectorCredentialId,
  normalizeConnectorCredentialName,
  normalizeConnectorOAuthError,
  normalizeConnectorOrganizationId,
  readConnectorCredentialStore,
  readConnectorRequestBody,
  sanitizeConnectorRedirectTarget,
  saveConnectorCredential,
  saveConnectorOAuthState,
  sendConnectorCorsPreflight,
  sendConnectorJson,
  sendConnectorRedirect,
  verifyConnectorRequestUser,
} from "./connector-oauth-core.mjs";
import {
  buildGenericConnectorCallbackUrl,
  getGenericConnectorProvider,
  isGenericConnectorProviderId,
} from "./connector-provider-registry.mjs";

const GENERIC_CONNECTOR_PATH =
  /^\/api\/(?:aios\/)?connectors\/([a-z0-9][a-z0-9-]{0,79})\/(login|callback|user|disconnect|credentials)\/?$/;

export function isGenericConnectorApiRequestPath(pathname) {
  const match = String(pathname || "").match(GENERIC_CONNECTOR_PATH);
  return Boolean(match && isGenericConnectorProviderId(match[1]));
}

export async function handleGenericConnectorApiRequest({
  req,
  res,
  url,
  platformOrigin,
  envFileCandidates = [],
  allowedOrigins = [],
  fetchImpl = globalThis.fetch,
  verifyUser = verifyConnectorRequestUser,
}) {
  const route = matchGenericConnectorRoute(url?.pathname);
  if (!route) return false;
  if (req.method === "OPTIONS") {
    return sendConnectorCorsPreflight(req, res, allowedOrigins);
  }

  try {
    if (req.method === "POST" && route.action === "login") {
      return await handleLogin({
        req,
        res,
        provider: route.provider,
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }
    if (req.method === "GET" && route.action === "callback") {
      return await handleCallback({
        req,
        res,
        provider: route.provider,
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
        fetchImpl,
      });
    }
    if (req.method === "GET" && route.action === "user") {
      return await handleStatus({
        req,
        res,
        provider: route.provider,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }
    if (req.method === "POST" && route.action === "disconnect") {
      return await handleDisconnect({
        req,
        res,
        provider: route.provider,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }
    if (req.method === "POST" && route.action === "credentials") {
      return await handleDirectCredentials({
        req,
        res,
        provider: route.provider,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }
    return sendConnectorJson(
      req,
      res,
      405,
      {
        error: "Method not allowed",
        code: "connector_method_not_allowed",
      },
      allowedOrigins,
    );
  } catch (error) {
    const status = normalizeErrorStatus(error);
    return sendConnectorJson(
      req,
      res,
      status,
      {
        error: error instanceof Error ? error.message : "Connector integration error",
        code: String(error?.code || "connector_integration_error"),
      },
      allowedOrigins,
    );
  }
}

function matchGenericConnectorRoute(pathname) {
  const match = String(pathname || "").match(GENERIC_CONNECTOR_PATH);
  if (!match) return null;
  const provider = getGenericConnectorProvider(match[1]);
  return provider ? { provider, action: match[2] } : null;
}

async function handleLogin({
  req,
  res,
  provider,
  platformOrigin,
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  requireAuthentication(provider, "oauth2");
  const body = await readConnectorRequestBody(req);
  const user = await verifyUser(req, envFileCandidates);
  const clientId = await requireProviderEnvironmentValue(
    provider,
    provider.clientIdEnv,
    envFileCandidates,
  );
  const callbackOverride = provider.callbackUrlEnv
    ? await getConnectorRuntimeEnvValue(provider.callbackUrlEnv, envFileCandidates)
    : "";
  const redirectUri = buildGenericConnectorCallbackUrl(provider, platformOrigin, callbackOverride);
  const state = randomBytes(24).toString("base64url");
  const pkceVerifier = provider.pkce ? randomBytes(48).toString("base64url") : "";
  const requestedScope = normalizeRequestedScope(provider, body?.scope);
  const redirectTarget = sanitizeConnectorRedirectTarget(body?.redirectTo, platformOrigin);

  await saveConnectorOAuthState(
    state,
    {
      provider: provider.id,
      uid: user.uid,
      redirectTarget,
      callbackTarget: redirectUri,
      credentialId: normalizeConnectorCredentialId(body?.credentialId),
      credentialName: normalizeConnectorCredentialName(body?.credentialName),
      organizationId: normalizeConnectorOrganizationId(body?.organizationId),
      metadata: {
        pkceVerifier,
        scope: requestedScope,
      },
    },
    envFileCandidates,
  );

  return sendConnectorJson(
    req,
    res,
    200,
    {
      authUrl: buildGenericConnectorAuthorizationUrl({
        provider,
        clientId,
        redirectUri,
        state,
        scope: requestedScope,
        pkceVerifier,
      }),
      state,
      uid: user.uid,
    },
    allowedOrigins,
  );
}

async function handleCallback({
  req,
  res,
  provider,
  platformOrigin,
  envFileCandidates,
  allowedOrigins,
  fetchImpl,
}) {
  requireAuthentication(provider, "oauth2");
  const stateValue = getConnectorRequestSearchParam(req, "state");
  if (!stateValue) {
    return sendConnectorJson(
      req,
      res,
      400,
      {
        error: "Invalid OAuth callback",
        code: "connector_oauth_state_missing",
      },
      allowedOrigins,
    );
  }
  const state = await consumeConnectorOAuthState(stateValue, provider.id, envFileCandidates);
  if (!state) {
    return sendConnectorJson(
      req,
      res,
      400,
      {
        error: "Invalid or expired OAuth state. Please try again.",
        code: "connector_oauth_state_invalid",
      },
      allowedOrigins,
    );
  }

  const providerError = normalizeConnectorOAuthError(
    getConnectorRequestSearchParam(req, "error") ||
      getConnectorRequestSearchParam(req, "error_description"),
  );
  if (providerError) {
    return redirectWithResult(
      req,
      res,
      state.redirectTarget,
      { result: "error", error: providerError },
      allowedOrigins,
    );
  }
  const code = getConnectorRequestSearchParam(req, "code");
  if (!code) {
    return redirectWithResult(
      req,
      res,
      state.redirectTarget,
      { result: "error", error: "authorization_code_missing" },
      allowedOrigins,
    );
  }

  const clientId = await requireProviderEnvironmentValue(
    provider,
    provider.clientIdEnv,
    envFileCandidates,
  );
  const clientSecret = await requireProviderEnvironmentValue(
    provider,
    provider.clientSecretEnv,
    envFileCandidates,
  );
  const callbackOverride = provider.callbackUrlEnv
    ? await getConnectorRuntimeEnvValue(provider.callbackUrlEnv, envFileCandidates)
    : "";
  const redirectUri = buildGenericConnectorCallbackUrl(provider, platformOrigin, callbackOverride);
  const tokenPayload = await exchangeAuthorizationCode({
    provider,
    code,
    clientId,
    clientSecret,
    redirectUri,
    pkceVerifier: String(state.metadata?.pkceVerifier || ""),
    fetchImpl,
  });
  const token = normalizeProviderToken(tokenPayload, String(state.metadata?.scope || ""));
  const profile = await fetchProviderProfile(provider, token, fetchImpl);
  const identity = readFirstString(
    profile,
    provider.profile?.identityFields || ["email", "name", "id"],
  );

  await saveConnectorCredential({
    provider: provider.id,
    uid: state.uid,
    credentialId: state.credentialId,
    credentialName: state.credentialName,
    organizationId: state.organizationId,
    identity,
    profile,
    token,
    envFileCandidates,
    encryptionKeyNames: provider.encryptionKeyNames,
  });

  return redirectWithResult(req, res, state.redirectTarget, { result: "success" }, allowedOrigins);
}

async function handleStatus({ req, res, provider, envFileCandidates, allowedOrigins, verifyUser }) {
  const user = await verifyUser(req, envFileCandidates);
  const store = await readConnectorCredentialStore(provider.id, user.uid, envFileCandidates);
  return sendConnectorJson(
    req,
    res,
    200,
    buildPublicConnectionStatus(provider, store),
    allowedOrigins,
  );
}

async function handleDisconnect({
  req,
  res,
  provider,
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  const user = await verifyUser(req, envFileCandidates);
  const body = await readConnectorRequestBody(req);
  const store = await deleteConnectorCredential({
    provider: provider.id,
    uid: user.uid,
    credentialId: normalizeConnectorCredentialId(body?.credentialId),
    envFileCandidates,
  });
  return sendConnectorJson(
    req,
    res,
    200,
    buildPublicConnectionStatus(provider, store),
    allowedOrigins,
  );
}

async function handleDirectCredentials({
  req,
  res,
  provider,
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  if (!["api-key", "service-account"].includes(provider.authentication)) {
    throw createHttpError(
      409,
      "connector_credentials_not_supported",
      `${provider.label} uses OAuth 2.0 credentials.`,
    );
  }
  const user = await verifyUser(req, envFileCandidates);
  const body = await readConnectorRequestBody(req);
  const values = isRecord(body?.values) ? body.values : {};
  for (const field of provider.credentialFields) {
    if (!String(values[field] || "").trim()) {
      throw createHttpError(
        400,
        "connector_credential_field_required",
        `${field} is required for ${provider.label}.`,
      );
    }
  }
  const validationError = provider.validateCredentials?.(values);
  if (validationError) {
    throw createHttpError(400, "connector_credentials_invalid", validationError);
  }
  const normalized = normalizeDirectConnectorCredential(provider, values);
  const identity = readFirstString(normalized.profile, provider.identityFields || []);
  const store = await saveConnectorCredential({
    provider: provider.id,
    uid: user.uid,
    credentialId: normalizeConnectorCredentialId(body?.credentialId),
    credentialName: normalizeConnectorCredentialName(body?.credentialName),
    organizationId: normalizeConnectorOrganizationId(body?.organizationId),
    identity,
    profile: normalized.profile,
    token: normalized.token,
    envFileCandidates,
    encryptionKeyNames: provider.encryptionKeyNames,
  });
  return sendConnectorJson(
    req,
    res,
    200,
    buildPublicConnectionStatus(provider, store),
    allowedOrigins,
  );
}

export function buildGenericConnectorAuthorizationUrl({
  provider,
  clientId,
  redirectUri,
  state,
  scope,
  pkceVerifier = "",
}) {
  const url = new URL(provider.authorizeUrl);
  url.searchParams.set("client_id", String(clientId || "").trim());
  url.searchParams.set("redirect_uri", String(redirectUri || "").trim());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", String(state || "").trim());
  if (scope) url.searchParams.set("scope", scope);
  if (Array.isArray(provider.userScopes) && provider.userScopes.length) {
    url.searchParams.set("user_scope", provider.userScopes.join(provider.scopeSeparator || " "));
  }
  Object.entries(provider.authorizeParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      url.searchParams.set(key, String(value));
    }
  });
  if (provider.pkce && pkceVerifier) {
    url.searchParams.set("code_challenge", createPkceChallenge(pkceVerifier));
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

async function exchangeAuthorizationCode({
  provider,
  code,
  clientId,
  clientSecret,
  redirectUri,
  pkceVerifier,
  fetchImpl,
}) {
  const request = buildGenericConnectorTokenRequest({
    provider,
    code,
    clientId,
    clientSecret,
    redirectUri,
    pkceVerifier,
  });
  const response = await fetchImpl(provider.tokenUrl, request);
  const payload = await readProviderResponse(response);
  if (
    !response.ok ||
    provider.validateToken?.(payload) === false ||
    !readProviderAccessToken(payload)
  ) {
    throw createHttpError(
      502,
      "connector_token_exchange_failed",
      readProviderError(payload) || `${provider.label} did not issue an access token.`,
    );
  }
  return payload;
}

export function buildGenericConnectorTokenRequest({
  provider,
  code,
  clientId,
  clientSecret,
  redirectUri,
  pkceVerifier = "",
}) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (provider.tokenAuth === "basic") {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString(
      "base64",
    )}`;
  } else {
    params.set("client_id", clientId);
    params.set("client_secret", clientSecret);
  }
  if (provider.pkce && pkceVerifier) {
    params.set("code_verifier", pkceVerifier);
  }
  return {
    method: "POST",
    headers,
    body: params.toString(),
  };
}

async function fetchProviderProfile(provider, token, fetchImpl) {
  if (!provider.profile?.url) return {};
  const response = await fetchImpl(
    provider.profile.url,
    buildGenericConnectorProfileRequest(provider, token),
  );
  const payload = await readProviderResponse(response);
  if (!response.ok || provider.profile.validate?.(payload) === false) {
    throw createHttpError(
      502,
      "connector_profile_fetch_failed",
      readProviderError(payload) ||
        `Unable to read the connected ${provider.label} identity (HTTP ${response.status}).`,
    );
  }
  return unwrapObject(payload, provider.profile.unwrap || []);
}

export function buildGenericConnectorProfileRequest(provider, token) {
  const accessToken = readProviderAccessToken(token);
  return {
    method: provider.profile.method || "GET",
    headers: {
      Accept: "application/json",
      // OAuth token_type is metadata, not necessarily an HTTP auth scheme.
      // Box returns `bearer` and Slack returns `bot`, while both APIs require
      // the canonical Bearer authorization scheme.
      Authorization: `Bearer ${accessToken}`,
      ...(provider.profile.headers || {}),
    },
    ...(provider.profile.body !== undefined ? { body: provider.profile.body } : {}),
  };
}

function normalizeProviderToken(payload, fallbackScope) {
  const accessToken = readProviderAccessToken(payload);
  const expiresIn = Math.max(0, Number(payload?.expires_in || 0));
  const primaryScope = normalizeTokenScope(payload?.scope || fallbackScope);
  const userScope = normalizeTokenScope(payload?.authed_user?.scope || "");
  const scope = [
    ...new Set(
      `${primaryScope} ${userScope}`
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].join(" ");
  const userAccessToken = String(payload?.authed_user?.access_token || "").trim();
  const userRefreshToken = String(payload?.authed_user?.refresh_token || "").trim();
  const userExpiresIn = Math.max(0, Number(payload?.authed_user?.expires_in || 0));
  return {
    accessToken,
    access_token: accessToken,
    refreshToken: String(payload?.refresh_token || "").trim(),
    refresh_token: String(payload?.refresh_token || "").trim(),
    tokenType: String(payload?.token_type || "Bearer").trim(),
    token_type: String(payload?.token_type || "Bearer").trim(),
    scope,
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    ...(userAccessToken
      ? {
          userAccessToken,
          user_access_token: userAccessToken,
          userRefreshToken,
          user_refresh_token: userRefreshToken,
          userTokenType: String(payload?.authed_user?.token_type || "user").trim(),
          user_token_type: String(payload?.authed_user?.token_type || "user").trim(),
          userScope,
          user_scope: userScope,
          userExpiresAt: userExpiresIn ? Date.now() + userExpiresIn * 1000 : null,
          user_expires_at: userExpiresIn ? Date.now() + userExpiresIn * 1000 : null,
        }
      : {}),
    raw: sanitizeTokenMetadata(payload),
  };
}

export function normalizeDirectConnectorCredential(provider, values) {
  const permissionClass = normalizePermissionClass(
    values.permissionClass,
    provider.defaultPermissionClass || "read_only",
  );
  const scope =
    provider.scopesByPermissionClass?.[permissionClass] || provider.defaultScope || permissionClass;
  if (provider.authentication === "service-account") {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(String(values.serviceAccountJson || ""));
    } catch {
      throw createHttpError(
        400,
        "connector_service_account_invalid",
        "The service account must be valid JSON.",
      );
    }
    if (
      !isRecord(serviceAccount) ||
      !String(serviceAccount.client_email || "").trim() ||
      !String(serviceAccount.private_key || "").trim() ||
      !String(serviceAccount.project_id || "").trim()
    ) {
      throw createHttpError(
        400,
        "connector_service_account_invalid",
        "The service account must include client_email, private_key, and project_id.",
      );
    }
    return {
      profile: {
        client_email: serviceAccount.client_email,
        project_id: serviceAccount.project_id,
      },
      token: {
        serviceAccount,
        serviceAccountJson: JSON.stringify(serviceAccount),
        scope,
        permissionClass,
      },
    };
  }
  const apiKey = String(values.apiKey || "").trim();
  return {
    profile: {
      accountName: String(values.accountName || "").trim(),
      accountId: String(values.accountId || "").trim(),
      displayName: String(values.displayName || "").trim(),
    },
    token: {
      apiKey,
      api_key: apiKey,
      scope: String(values.scope || scope),
      permissionClass,
    },
  };
}

function buildPublicConnectionStatus(provider, store) {
  const credentials = listPublicConnectorCredentials(
    store,
    provider.authentication === "oauth2"
      ? "OAuth 2.0"
      : provider.authentication === "service-account"
        ? "Service account"
        : "API key",
  );
  const defaultCredential = store.credentials?.[store.defaultCredentialId];
  return {
    connected: credentials.length > 0,
    credentials,
    defaultCredentialId: store.defaultCredentialId || "",
    profile: defaultCredential?.profile || {},
  };
}

async function requireProviderEnvironmentValue(provider, key, envFileCandidates) {
  const value = key ? await getConnectorRuntimeEnvValue(key, envFileCandidates) : "";
  if (value) return value;
  throw createHttpError(
    501,
    "connector_not_configured",
    `${provider.label} OAuth is not configured on this deployment.`,
  );
}

function requireAuthentication(provider, expected) {
  if (provider.authentication !== expected) {
    throw createHttpError(
      409,
      "connector_authentication_mismatch",
      `${provider.label} uses ${provider.authentication} credentials.`,
    );
  }
}

function normalizeRequestedScope(provider, value) {
  const requested = String(value || "").trim();
  if (!requested) return provider.scopes.join(provider.scopeSeparator || " ");
  const allowed = new Set(provider.scopes.map((scope) => scope.toLowerCase()));
  const requestedScopes = requested
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  if (!requestedScopes.length) {
    return provider.scopes.join(provider.scopeSeparator || " ");
  }
  const denied = requestedScopes.find((scope) => !allowed.has(scope.toLowerCase()));
  if (denied) {
    throw createHttpError(
      400,
      "connector_scope_not_allowed",
      `${denied} is not an allowed ${provider.label} scope.`,
    );
  }
  return requestedScopes.join(provider.scopeSeparator || " ");
}

function normalizePermissionClass(value, fallback) {
  const normalized = String(value || fallback || "")
    .trim()
    .toLowerCase();
  return ["read_only", "read_write"].includes(normalized) ? normalized : "read_only";
}

function normalizeTokenScope(value) {
  return Array.isArray(value)
    ? value
        .map((scope) => String(scope || "").trim())
        .filter(Boolean)
        .join(" ")
    : String(value || "").trim();
}

function createPkceChallenge(value) {
  return createHash("sha256").update(value).digest("base64url");
}

function readProviderAccessToken(payload) {
  return String(payload?.access_token || payload?.authed_user?.access_token || "").trim();
}

function readProviderError(payload) {
  return String(
    payload?.error_description ||
      payload?.error?.message ||
      payload?.error ||
      payload?.message ||
      "",
  ).trim();
}

async function readProviderResponse(response) {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text));
  }
}

function sanitizeTokenMetadata(payload) {
  if (!isRecord(payload)) return {};
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([key]) => !["access_token", "refresh_token", "id_token", "authed_user"].includes(key),
    ),
  );
}

function unwrapObject(value, path) {
  let current = value;
  for (const key of path) {
    current = isRecord(current) ? current[key] : undefined;
  }
  return isRecord(current) ? current : {};
}

function readFirstString(value, fields) {
  for (const field of fields) {
    const candidate = String(value?.[field] || "").trim();
    if (candidate) return candidate.slice(0, 240);
  }
  return "";
}

function redirectWithResult(req, res, redirectTarget, result, allowedOrigins) {
  return sendConnectorRedirect(
    req,
    res,
    302,
    appendConnectorOAuthResult(redirectTarget, result),
    allowedOrigins,
  );
}

function normalizeErrorStatus(error) {
  if (error?.code === "unauthorized") return 401;
  const status = Number(error?.statusCode || 0);
  return status >= 400 && status <= 599 ? status : 500;
}

function createHttpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
