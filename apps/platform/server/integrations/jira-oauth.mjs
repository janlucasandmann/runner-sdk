import { randomBytes } from "node:crypto";

import {
  appendConnectorOAuthResult,
  consumeConnectorOAuthState,
  deleteConnectorCredential,
  getConnectorRequestSearchParam,
  getConnectorRuntimeEnvValue,
  listPublicConnectorCredentials,
  loadConnectorCredential,
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
  updateConnectorCredentialMetadata,
  verifyConnectorRequestUser,
} from "./connector-oauth-core.mjs";

const JIRA_PROVIDER = "jira";
const JIRA_AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
const JIRA_TOKEN_URL = "https://auth.atlassian.com/oauth/token";
const JIRA_API_BASE = "https://api.atlassian.com";
const JIRA_DEFAULT_SCOPE =
  "offline_access read:jira-work write:jira-work read:jira-user";
const JIRA_ENCRYPTION_KEYS = [
  "JIRA_TOKEN_ENCRYPTION_KEY",
  "CONNECTOR_TOKEN_ENCRYPTION_KEY",
];

export function isJiraApiRequestPath(pathname) {
  return pathname === "/api/jira/callback"
    || pathname.startsWith("/api/jira/")
    || pathname.startsWith("/api/aios/jira/");
}

export async function handleJiraApiRequest({
  req,
  res,
  url,
  platformOrigin,
  envFileCandidates = [],
  allowedOrigins = [],
}) {
  const pathname = normalizeJiraApiPath(url.pathname);
  if (!pathname) return false;
  if (req.method === "OPTIONS") {
    return sendConnectorCorsPreflight(req, res, allowedOrigins);
  }
  try {
    if (req.method === "POST" && pathname === "/api/jira/login") {
      return await handleJiraLogin(req, res, {
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
      });
    }
    if (req.method === "GET" && pathname === "/api/jira/callback") {
      return await handleJiraCallback(req, res, {
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
      });
    }
    if (req.method === "GET" && pathname === "/api/jira/user") {
      return await handleJiraUser(req, res, {
        envFileCandidates,
        allowedOrigins,
      });
    }
    if (req.method === "POST" && pathname === "/api/jira/disconnect") {
      return await handleJiraDisconnect(req, res, {
        envFileCandidates,
        allowedOrigins,
      });
    }
    return sendConnectorJson(
      req,
      res,
      404,
      {
        error: "Not found",
        message: "Jira API route not found.",
      },
      allowedOrigins,
    );
  } catch (error) {
    if (error?.code === "unauthorized") {
      return sendConnectorJson(
        req,
        res,
        401,
        { error: error instanceof Error ? error.message : "Unauthorized" },
        allowedOrigins,
      );
    }
    return sendConnectorJson(
      req,
      res,
      500,
      {
        error: "Jira integration error",
        message: error instanceof Error ? error.message : String(error),
      },
      allowedOrigins,
    );
  }
}

function normalizeJiraApiPath(pathname) {
  if (pathname === "/api/jira/callback") return pathname;
  if (pathname.startsWith("/api/jira/")) return pathname;
  if (pathname.startsWith("/api/aios/jira/")) {
    return pathname.replace(/^\/api\/aios/, "/api");
  }
  return null;
}

async function handleJiraLogin(
  req,
  res,
  { platformOrigin, envFileCandidates, allowedOrigins },
) {
  const body = await readConnectorRequestBody(req);
  const user = await verifyConnectorRequestUser(req, envFileCandidates);
  const clientId = await getConnectorRuntimeEnvValue(
    "JIRA_OAUTH_CLIENT_ID",
    envFileCandidates,
  );
  if (!clientId) {
    return sendConnectorJson(
      req,
      res,
      500,
      { error: "Jira OAuth not configured" },
      allowedOrigins,
    );
  }
  const redirectTarget = sanitizeConnectorRedirectTarget(
    body?.redirectTo,
    platformOrigin,
  );
  const redirectUri = await resolveJiraCallbackUrl(
    platformOrigin,
    envFileCandidates,
  );
  const state = randomBytes(24).toString("base64url");
  await saveConnectorOAuthState(
    state,
    {
      provider: JIRA_PROVIDER,
      uid: user.uid,
      redirectTarget,
      callbackTarget: redirectUri,
      credentialId: normalizeConnectorCredentialId(body?.credentialId),
      credentialName: normalizeConnectorCredentialName(body?.credentialName),
      organizationId: normalizeConnectorOrganizationId(body?.organizationId),
      metadata: {
        siteId: normalizeJiraCloudId(body?.siteId),
      },
    },
    envFileCandidates,
  );
  return sendConnectorJson(
    req,
    res,
    200,
    {
      authUrl: buildJiraAuthorizationUrl({
        clientId,
        redirectUri,
        state,
        scope: normalizeJiraScope(body?.scope),
      }),
      state,
      uid: user.uid,
    },
    allowedOrigins,
  );
}

async function handleJiraCallback(
  req,
  res,
  { platformOrigin, envFileCandidates, allowedOrigins },
) {
  const stateValue = getConnectorRequestSearchParam(req, "state");
  if (!stateValue) {
    return sendConnectorJson(
      req,
      res,
      400,
      { error: "Invalid OAuth callback" },
      allowedOrigins,
    );
  }
  const state = await consumeConnectorOAuthState(
    stateValue,
    JIRA_PROVIDER,
    envFileCandidates,
  );
  if (!state) {
    return sendConnectorJson(
      req,
      res,
      400,
      { error: "Invalid or expired OAuth state. Please try again." },
      allowedOrigins,
    );
  }
  const providerError = normalizeConnectorOAuthError(
    getConnectorRequestSearchParam(req, "error")
      || getConnectorRequestSearchParam(req, "error_description"),
  );
  if (providerError) {
    return sendJiraCallbackResult(
      req,
      res,
      state.redirectTarget,
      { result: "error", error: providerError },
      allowedOrigins,
    );
  }
  const code = getConnectorRequestSearchParam(req, "code");
  if (!code) {
    return sendJiraCallbackResult(
      req,
      res,
      state.redirectTarget,
      { result: "error", error: "authorization_code_missing" },
      allowedOrigins,
    );
  }
  const clientId = await getConnectorRuntimeEnvValue(
    "JIRA_OAUTH_CLIENT_ID",
    envFileCandidates,
  );
  const clientSecret = await getConnectorRuntimeEnvValue(
    "JIRA_OAUTH_CLIENT_SECRET",
    envFileCandidates,
  );
  if (!clientId || !clientSecret) {
    return sendConnectorJson(
      req,
      res,
      500,
      { error: "Jira OAuth not configured" },
      allowedOrigins,
    );
  }
  const redirectUri = await resolveJiraCallbackUrl(
    platformOrigin,
    envFileCandidates,
  );
  try {
    const token = await exchangeJiraAuthorizationCode({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });
    const sites = await fetchJiraAccessibleResources(token.access_token);
    const requestedSiteId = normalizeJiraCloudId(state.metadata?.siteId);
    const site =
      sites.find((candidate) => candidate.id === requestedSiteId)
      || sites[0];
    if (!site?.id) {
      throw new Error("The Atlassian account does not expose an accessible Jira site.");
    }
    const profile = await fetchJiraProfile(token.access_token, site.id);
    const normalizedProfile = sanitizeJiraProfile(profile, site);
    await saveConnectorCredential({
      provider: JIRA_PROVIDER,
      uid: state.uid,
      credentialId: state.credentialId,
      credentialName: state.credentialName,
      organizationId: state.organizationId,
      identity: getJiraIdentity(normalizedProfile),
      profile: normalizedProfile,
      token: normalizeJiraToken(token, {
        cloudId: site.id,
        siteName: site.name,
        siteUrl: site.url,
      }),
      envFileCandidates,
      encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
    });
  } catch (error) {
    console.error("[jira-oauth] Failed to save Jira credentials.", error);
    return sendJiraCallbackResult(
      req,
      res,
      state.redirectTarget,
      {
        result: "error",
        error: error?.code || "credential_save_failed",
      },
      allowedOrigins,
    );
  }
  return sendJiraCallbackResult(
    req,
    res,
    state.redirectTarget,
    { result: "success" },
    allowedOrigins,
  );
}

async function handleJiraUser(
  req,
  res,
  { envFileCandidates, allowedOrigins },
) {
  try {
    const user = await verifyConnectorRequestUser(req, envFileCandidates);
    const credential = await loadValidJiraCredential({
      uid: user.uid,
      credentialId: getConnectorRequestSearchParam(req, "credentialId"),
      envFileCandidates,
    });
    if (!credential) {
      return sendConnectorJson(
        req,
        res,
        200,
        { connected: false, credentials: [] },
        allowedOrigins,
      );
    }
    try {
      const sites = await fetchJiraAccessibleResources(
        credential.token.accessToken,
      );
      const site =
        sites.find((candidate) => candidate.id === credential.token.cloudId)
        || sites[0];
      if (!site?.id) {
        throw unauthorizedProviderError();
      }
      const profile = await fetchJiraProfile(
        credential.token.accessToken,
        site.id,
      );
      const normalizedProfile = sanitizeJiraProfile(profile, site);
      const store = await updateConnectorCredentialMetadata({
        provider: JIRA_PROVIDER,
        uid: user.uid,
        credentialId: credential.credentialId,
        metadata: {
          profile: normalizedProfile,
          identity: getJiraIdentity(normalizedProfile),
          lastCheckedAt: Date.now(),
          status: "valid",
        },
        envFileCandidates,
      });
      return sendConnectorJson(
        req,
        res,
        200,
        {
          connected: true,
          profile: normalizedProfile,
          credentials: listPublicConnectorCredentials(store),
          defaultCredentialId: store.defaultCredentialId || undefined,
          scope: credential.token.scope || "",
          tokenType: credential.token.tokenType || "bearer",
          expiresAt: credential.token.expiresAt ?? null,
        },
        allowedOrigins,
      );
    } catch (error) {
      if (error?.status === 401) {
        const store = await deleteConnectorCredential({
          provider: JIRA_PROVIDER,
          uid: user.uid,
          credentialId: credential.credentialId,
          envFileCandidates,
        });
        return sendConnectorJson(
          req,
          res,
          200,
          {
            connected: Object.keys(store.credentials).length > 0,
            credentials: listPublicConnectorCredentials(store),
            defaultCredentialId: store.defaultCredentialId || undefined,
            reason: "token_revoked",
          },
          allowedOrigins,
        );
      }
      throw error;
    }
  } catch (error) {
    if (error?.code === "unauthorized") {
      return sendConnectorJson(
        req,
        res,
        200,
        { connected: false, credentials: [] },
        allowedOrigins,
      );
    }
    throw error;
  }
}

async function handleJiraDisconnect(
  req,
  res,
  { envFileCandidates, allowedOrigins },
) {
  const user = await verifyConnectorRequestUser(req, envFileCandidates);
  const body = await readConnectorRequestBody(req);
  const store = await deleteConnectorCredential({
    provider: JIRA_PROVIDER,
    uid: user.uid,
    credentialId: normalizeConnectorCredentialId(body?.credentialId),
    envFileCandidates,
  });
  return sendConnectorJson(
    req,
    res,
    200,
    {
      success: true,
      connected: Object.keys(store.credentials).length > 0,
      credentials: listPublicConnectorCredentials(store),
      defaultCredentialId: store.defaultCredentialId || undefined,
    },
    allowedOrigins,
  );
}

export function buildJiraAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  scope = JIRA_DEFAULT_SCOPE,
}) {
  const url = new URL(JIRA_AUTHORIZE_URL);
  url.searchParams.set("audience", "api.atlassian.com");
  url.searchParams.set("client_id", String(clientId || "").trim());
  url.searchParams.set("scope", normalizeJiraScope(scope));
  url.searchParams.set("redirect_uri", String(redirectUri || "").trim());
  url.searchParams.set("state", String(state || "").trim());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

async function loadValidJiraCredential({
  uid,
  credentialId,
  envFileCandidates,
}) {
  let credential = await loadConnectorCredential({
    provider: JIRA_PROVIDER,
    uid,
    credentialId,
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  if (!credential) return null;
  if (
    !credential.token?.expiresAt
    || credential.token.expiresAt > Date.now() + 60_000
  ) {
    return credential;
  }
  if (!credential.token.refreshToken) return credential;
  const clientId = await getConnectorRuntimeEnvValue(
    "JIRA_OAUTH_CLIENT_ID",
    envFileCandidates,
  );
  const clientSecret = await getConnectorRuntimeEnvValue(
    "JIRA_OAUTH_CLIENT_SECRET",
    envFileCandidates,
  );
  const refreshed = await refreshJiraToken({
    clientId,
    clientSecret,
    refreshToken: credential.token.refreshToken,
  });
  await saveConnectorCredential({
    provider: JIRA_PROVIDER,
    uid,
    credentialId: credential.credentialId,
    credentialName: credential.name,
    organizationId: credential.organizationId,
    identity: credential.identity,
    profile: credential.profile,
    token: normalizeJiraToken(refreshed, credential.token),
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  credential = await loadConnectorCredential({
    provider: JIRA_PROVIDER,
    uid,
    credentialId: credential.credentialId,
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  return credential;
}

async function exchangeJiraAuthorizationCode({
  clientId,
  clientSecret,
  code,
  redirectUri,
}) {
  return requestJiraToken({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });
}

async function refreshJiraToken({ clientId, clientSecret, refreshToken }) {
  return requestJiraToken({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });
}

async function requestJiraToken(body) {
  const response = await fetch(JIRA_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const error = new Error(
      payload?.error_description
      || payload?.error
      || "Jira token exchange failed",
    );
    error.code = normalizeConnectorOAuthError(payload?.error)
      || "token_exchange_failed";
    throw error;
  }
  return payload;
}

async function fetchJiraAccessibleResources(accessToken) {
  const response = await fetch(
    `${JIRA_API_BASE}/oauth/token/accessible-resources`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const error = new Error("Unable to load accessible Jira sites.");
    error.status = response.status;
    throw error;
  }
  return Array.isArray(payload)
    ? payload.flatMap((site) => {
        const id = normalizeJiraCloudId(site?.id);
        return id
          ? [{
              id,
              name: String(site?.name || "").trim(),
              url: String(site?.url || "").trim(),
              scopes: Array.isArray(site?.scopes) ? site.scopes : [],
              avatarUrl: String(site?.avatarUrl || "").trim(),
            }]
          : [];
      })
    : [];
}

async function fetchJiraProfile(accessToken, cloudId) {
  const response = await fetch(
    `${JIRA_API_BASE}/ex/jira/${encodeURIComponent(cloudId)}/rest/api/3/myself`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      payload?.errorMessages?.[0]
      || payload?.message
      || "Unable to load the Jira profile.",
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}

function sanitizeJiraProfile(profile, site) {
  const avatarUrls =
    profile?.avatarUrls
    && typeof profile.avatarUrls === "object"
    && !Array.isArray(profile.avatarUrls)
      ? profile.avatarUrls
      : {};
  return {
    accountId: String(profile?.accountId || "").trim(),
    accountType: String(profile?.accountType || "").trim(),
    displayName: String(profile?.displayName || "").trim(),
    email: String(profile?.emailAddress || "").trim(),
    active: profile?.active !== false,
    locale: String(profile?.locale || "").trim(),
    avatarUrl: String(
      avatarUrls["48x48"] || avatarUrls["32x32"] || site?.avatarUrl || "",
    ).trim(),
    cloudId: String(site?.id || "").trim(),
    siteName: String(site?.name || "").trim(),
    url: String(site?.url || "").trim(),
  };
}

function normalizeJiraToken(token, site) {
  const now = Date.now();
  return {
    accessToken: String(token?.access_token || token?.accessToken || "").trim(),
    refreshToken: String(
      token?.refresh_token || token?.refreshToken || "",
    ).trim(),
    tokenType: String(token?.token_type || token?.tokenType || "Bearer").trim(),
    scope: String(token?.scope || site?.scope || JIRA_DEFAULT_SCOPE).trim(),
    expiresAt:
      token?.expires_in
        ? now + Number(token.expires_in) * 1000
        : Number(token?.expiresAt || 0) || null,
    cloudId: normalizeJiraCloudId(site?.cloudId),
    siteName: String(site?.siteName || "").trim(),
    siteUrl: String(site?.siteUrl || "").trim(),
  };
}

function normalizeJiraCloudId(value) {
  return String(value || "").trim().slice(0, 200);
}

function normalizeJiraScope(value) {
  const normalized = String(value || "").trim();
  return normalized || JIRA_DEFAULT_SCOPE;
}

function getJiraIdentity(profile) {
  return [
    profile?.siteName,
    profile?.displayName,
    profile?.email,
    profile?.url,
  ].find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

async function resolveJiraCallbackUrl(platformOrigin, envFileCandidates) {
  return (
    await getConnectorRuntimeEnvValue(
      "JIRA_OAUTH_REDIRECT_URI",
      envFileCandidates,
    )
    || await getConnectorRuntimeEnvValue(
      "JIRA_OAUTH_REDIRECT_URL",
      envFileCandidates,
    )
    || new URL("/api/jira/callback", `${platformOrigin}/`).toString()
  );
}

function sendJiraCallbackResult(
  req,
  res,
  redirectTarget,
  result,
  allowedOrigins,
) {
  return sendConnectorRedirect(
    req,
    res,
    302,
    appendConnectorOAuthResult(redirectTarget, result),
    allowedOrigins,
  );
}

function unauthorizedProviderError() {
  const error = new Error("Jira credentials are no longer valid.");
  error.status = 401;
  return error;
}

export const JIRA_OAUTH_DEFAULT_SCOPE = JIRA_DEFAULT_SCOPE;
