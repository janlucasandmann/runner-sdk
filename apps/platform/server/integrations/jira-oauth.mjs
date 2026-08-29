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
  resolveConnectorCredentialForOrganization,
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
const JIRA_CONFLUENCE_CLASSIC_SPACE_SCOPE = "read:confluence-space.summary";
const JIRA_CONFLUENCE_GRANULAR_SPACE_SCOPE = "read:space:confluence";
const JIRA_CONFLUENCE_SEARCH_SCOPE = "search:confluence";
const JIRA_DEFAULT_SCOPE =
  "offline_access read:jira-work write:jira-work read:jira-user read:confluence-content.all read:confluence-content.summary read:confluence-space.summary read:confluence-user search:confluence write:confluence-content write:confluence-file";
const JIRA_ENCRYPTION_KEYS = [
  "JIRA_TOKEN_ENCRYPTION_KEY",
  "CONNECTOR_TOKEN_ENCRYPTION_KEY",
];
const JIRA_CLIENT_ID_KEYS = [
  "JIRA_OAUTH_CLIENT_ID",
  "ATLASSIAN_OAUTH_CLIENT_ID",
  "ATLASSIAN_CLIENT_ID",
];
const JIRA_CLIENT_SECRET_KEYS = [
  "JIRA_OAUTH_CLIENT_SECRET",
  "ATLASSIAN_OAUTH_CLIENT_SECRET",
  "ATLASSIAN_CLIENT_SECRET",
];
const JIRA_REDIRECT_URI_KEYS = [
  "JIRA_OAUTH_REDIRECT_URI",
  "JIRA_OAUTH_REDIRECT_URL",
  "ATLASSIAN_OAUTH_REDIRECT_URI",
  "ATLASSIAN_OAUTH_REDIRECT_URL",
];
const jiraRefreshes = new Map();

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
    if (req.method === "GET" && pathname === "/api/jira/resources") {
      return await handleJiraResources(req, res, {
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
        message: "Atlassian API route not found.",
      },
      allowedOrigins,
    );
  } catch (error) {
    if (error?.code === "jira_oauth_not_configured") {
      return sendJiraConfigurationError(
        req,
        res,
        error.missing,
        allowedOrigins,
      );
    }
    if (error?.code === "jira_reauthorization_required") {
      return sendConnectorJson(
        req,
        res,
        428,
        {
          error: "Atlassian authorization update required",
          code: error.code,
          message: error instanceof Error
            ? error.message
            : "Update Atlassian permissions to load Confluence spaces.",
          reauthorizationRequired: true,
          missingScopes: Array.isArray(error?.missingScopes)
            ? error.missingScopes
            : [
                JIRA_CONFLUENCE_CLASSIC_SPACE_SCOPE,
                JIRA_CONFLUENCE_SEARCH_SCOPE,
              ],
        },
        allowedOrigins,
      );
    }
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
        error: "Atlassian integration error",
        message: error instanceof Error ? error.message : String(error),
      },
      allowedOrigins,
    );
  }
}

async function handleJiraResources(
  req,
  res,
  { envFileCandidates, allowedOrigins },
) {
  const user = await verifyConnectorRequestUser(req, envFileCandidates);
  const credential = await loadValidJiraCredential({
    uid: user.uid,
    credentialId: getConnectorRequestSearchParam(req, "credentialId"),
    envFileCandidates,
  });
  if (!credential?.token?.accessToken) {
    return sendConnectorJson(
      req,
      res,
      401,
      { error: "Atlassian is not connected." },
      allowedOrigins,
    );
  }

  let cloudId = normalizeJiraCloudId(credential.token.cloudId);
  let siteName = String(credential.token.siteName || "Atlassian").trim() || "Atlassian";
  let siteUrl = String(credential.token.siteUrl || "").trim();
  if (!cloudId) {
    const sites = await fetchJiraAccessibleResources(credential.token.accessToken);
    const site = sites[0];
    cloudId = normalizeJiraCloudId(site?.id);
    siteName = String(site?.name || siteName).trim() || siteName;
    siteUrl = String(site?.url || siteUrl).trim();
  }
  if (!cloudId) {
    return sendConnectorJson(
      req,
      res,
      409,
      { error: "The Atlassian connection has no accessible cloud site." },
      allowedOrigins,
    );
  }

  const folderId = String(
    getConnectorRequestSearchParam(req, "folderId") || "root",
  ).trim() || "root";
  const requestedProduct = normalizeAtlassianResourceProduct(
    getConnectorRequestSearchParam(req, "product"),
  );
  const jiraFolderId = `atlassian:jira:${cloudId}`;
  const confluenceFolderId = `atlassian:confluence:${cloudId}`;
  let resources;
  if (folderId === "root" && requestedProduct === "jira") {
    resources = await buildJiraProjectResources({
      accessToken: credential.token.accessToken,
      cloudId,
      parentId: null,
      siteUrl,
    });
  } else if (folderId === "root" && requestedProduct === "confluence") {
    resources = await buildConfluenceSpaceResources({
      accessToken: credential.token.accessToken,
      scope: credential.token.scope,
      cloudId,
      parentId: null,
      siteUrl,
    });
  } else if (folderId === "root") {
    resources = [
      {
        id: jiraFolderId,
        name: `${siteName} · Jira`,
        path: "Jira",
        parentId: null,
        isFolder: true,
        mimeType: "application/x-atlassian-jira",
        resourceType: "jira_container",
        cloudId,
        siteUrl,
      },
      {
        id: confluenceFolderId,
        name: `${siteName} · Confluence`,
        path: "Confluence",
        parentId: null,
        isFolder: true,
        mimeType: "application/x-atlassian-confluence",
        resourceType: "confluence_container",
        cloudId,
        siteUrl,
      },
    ];
  } else if (folderId === jiraFolderId) {
    resources = await buildJiraProjectResources({
      accessToken: credential.token.accessToken,
      cloudId,
      parentId: jiraFolderId,
      siteUrl,
    });
  } else if (folderId === confluenceFolderId) {
    resources = await buildConfluenceSpaceResources({
      accessToken: credential.token.accessToken,
      scope: credential.token.scope,
      cloudId,
      parentId: confluenceFolderId,
      siteUrl,
    });
  } else {
    resources = [];
  }

  return sendConnectorJson(
    req,
    res,
    200,
    { resources },
    allowedOrigins,
  );
}

function normalizeAtlassianResourceProduct(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "jira" || normalized === "confluence"
    ? normalized
    : "";
}

async function buildJiraProjectResources({
  accessToken,
  cloudId,
  parentId,
  siteUrl,
}) {
  const projects = await fetchJiraProjects(accessToken, cloudId);
  return projects.map((project) => ({
    id: `atlassian:jira-project:${cloudId}:${project.id || project.key}`,
    name: project.name || project.key || "Untitled Jira project",
    path: project.key || project.id,
    parentId,
    isFolder: false,
    mimeType: "application/x-atlassian-jira-project",
    resourceType: "jira_project",
    resourceKey: project.key,
    cloudId,
    siteUrl,
  }));
}

async function buildConfluenceSpaceResources({
  accessToken,
  scope,
  cloudId,
  parentId,
  siteUrl,
}) {
  const spaces = await fetchConfluenceSpaces(accessToken, cloudId, { scope });
  return spaces.map((space) => ({
    id: `atlassian:confluence-space:${cloudId}:${space.id || space.key}`,
    name: space.name || space.key || "Untitled Confluence space",
    path: space.key || space.id,
    parentId,
    isFolder: false,
    mimeType: "application/x-atlassian-confluence-space",
    resourceType: "confluence_space",
    resourceKey: space.id || space.key,
    spaceKey: space.key || "",
    cloudId,
    siteUrl,
  }));
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
  const configuration = await resolveJiraOAuthConfiguration({
    platformOrigin,
    envFileCandidates,
  });
  if (!configuration.configured) {
    return sendJiraConfigurationError(
      req,
      res,
      configuration.missing,
      allowedOrigins,
    );
  }
  const redirectTarget = sanitizeConnectorRedirectTarget(
    body?.redirectTo,
    platformOrigin,
  );
  const state = randomBytes(24).toString("base64url");
  // Jira and Confluence deliberately share one Atlassian credential. Keep the
  // baseline on Atlassian's recommended classic scopes: an OAuth app rejects
  // an authorization URL as invalid when it requests granular scopes that
  // were not enabled for that client in the Developer Console.
  const requestedScope = normalizeJiraScope(body?.scope);
  await saveConnectorOAuthState(
    state,
    {
      provider: JIRA_PROVIDER,
      uid: user.uid,
      redirectTarget,
      callbackTarget: configuration.redirectUri,
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
        clientId: configuration.clientId,
        redirectUri: configuration.redirectUri,
        state,
        scope: requestedScope,
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
  const configuration = await resolveJiraOAuthConfiguration({
    platformOrigin,
    envFileCandidates,
  });
  if (!configuration.configured) {
    return sendJiraCallbackResult(
      req,
      res,
      state.redirectTarget,
      { result: "error", error: "jira_oauth_not_configured" },
      allowedOrigins,
    );
  }
  try {
    const token = await exchangeJiraAuthorizationCode({
      clientId: configuration.clientId,
      clientSecret: configuration.clientSecret,
      code,
      redirectUri: configuration.redirectUri,
    });
    const sites = await fetchJiraAccessibleResources(token.access_token);
    const requestedSiteId = normalizeJiraCloudId(state.metadata?.siteId);
    const site =
      sites.find((candidate) => candidate.id === requestedSiteId)
      || sites[0];
    if (!site?.id) {
      throw new Error("The Atlassian account does not expose an accessible cloud site.");
    }
    const grantedScope = mergeJiraScopes(
      token?.scope,
      sites
        .filter((candidate) => candidate.id === site.id)
        .flatMap((candidate) => candidate.scopes || []),
    );
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
      token: normalizeJiraToken({
        ...token,
        scope: grantedScope,
      }, {
        cloudId: site.id,
        siteName: site.name,
        siteUrl: site.url,
      }),
      makeDefault: true,
      envFileCandidates,
      encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
    });
  } catch (error) {
    console.error("[atlassian-oauth] Failed to save Atlassian credentials.", error);
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
    let activeCredential = credential;
    let normalizedProfile;
    try {
      normalizedProfile = await loadJiraCredentialProfile(activeCredential);
    } catch (error) {
      if (error?.status !== 401) throw error;
      const refreshedCredential = await loadValidJiraCredential({
        uid: user.uid,
        credentialId: activeCredential.credentialId,
        envFileCandidates,
        forceRefresh: true,
      }).catch(() => null);
      if (
        !refreshedCredential
        || refreshedCredential.token?.accessToken
          === activeCredential.token?.accessToken
      ) {
        return sendInvalidJiraCredentialResponse(
          req,
          res,
          {
            uid: user.uid,
            credentialId: activeCredential.credentialId,
            envFileCandidates,
          },
          allowedOrigins,
        );
      }
      activeCredential = refreshedCredential;
      try {
        normalizedProfile = await loadJiraCredentialProfile(activeCredential);
      } catch (retryError) {
        if (retryError?.status !== 401) throw retryError;
        return sendInvalidJiraCredentialResponse(
          req,
          res,
          {
            uid: user.uid,
            credentialId: activeCredential.credentialId,
            envFileCandidates,
          },
          allowedOrigins,
        );
      }
    }
    const store = await updateConnectorCredentialMetadata({
      provider: JIRA_PROVIDER,
      uid: user.uid,
      credentialId: activeCredential.credentialId,
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
        scope: activeCredential.token.scope || "",
        tokenType: activeCredential.token.tokenType || "bearer",
        expiresAt: activeCredential.token.expiresAt ?? null,
        capabilities: buildJiraAuthorizationCapabilities(
          activeCredential.token.scope,
        ),
      },
      allowedOrigins,
    );
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

async function loadJiraCredentialProfile(credential) {
  const sites = await fetchJiraAccessibleResources(
    credential.token.accessToken,
  );
  const site =
    sites.find((candidate) => candidate.id === credential.token.cloudId)
    || sites[0];
  if (!site?.id) throw unauthorizedProviderError();
  const profile = await fetchJiraProfile(
    credential.token.accessToken,
    site.id,
  );
  return sanitizeJiraProfile(profile, site);
}

async function sendInvalidJiraCredentialResponse(
  req,
  res,
  { uid, credentialId, envFileCandidates },
  allowedOrigins,
) {
  const store = await updateConnectorCredentialMetadata({
    provider: JIRA_PROVIDER,
    uid,
    credentialId,
    metadata: {
      lastCheckedAt: Date.now(),
      status: "invalid",
    },
    envFileCandidates,
  });
  return sendConnectorJson(
    req,
    res,
    200,
    {
      connected: Object.values(store.credentials || {})
        .some((candidate) => candidate.status !== "invalid"),
      credentials: listPublicConnectorCredentials(store),
      defaultCredentialId: store.defaultCredentialId || undefined,
      reason: "token_revoked",
    },
    allowedOrigins,
  );
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
  forceRefresh = false,
}) {
  let credential = await loadConnectorCredential({
    provider: JIRA_PROVIDER,
    uid,
    credentialId,
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  return refreshJiraCredentialIfNeeded({
    credential,
    ownerUserId: uid,
    envFileCandidates,
    forceRefresh,
  });
}

export async function resolveJiraCredentialForOrganization({
  organizationId,
  credentialId = "",
  requestingUserId = "",
  envFileCandidates = [],
  forceRefresh = false,
}) {
  const credential = await resolveConnectorCredentialForOrganization({
    provider: JIRA_PROVIDER,
    organizationId,
    credentialId,
    requestingUserId,
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  return refreshJiraCredentialIfNeeded({
    credential,
    ownerUserId: credential?.credentialOwnerId,
    envFileCandidates,
    forceRefresh,
  });
}

async function refreshJiraCredentialIfNeeded({
  credential,
  ownerUserId,
  envFileCandidates,
  forceRefresh = false,
}) {
  if (!credential) return null;
  if (
    !forceRefresh
    && (
    !credential.token?.expiresAt
    || credential.token.expiresAt > Date.now() + 60_000
    )
  ) {
    return credential;
  }
  if (!credential.token.refreshToken) return credential;
  const normalizedOwnerUserId = String(
    ownerUserId || credential.credentialOwnerId || "",
  ).trim();
  if (!normalizedOwnerUserId) {
    throw new Error("The Jira credential owner is unavailable.");
  }
  const refreshKey = [
    JIRA_PROVIDER,
    normalizedOwnerUserId,
    credential.credentialId,
  ].join(":");
  if (jiraRefreshes.has(refreshKey)) return jiraRefreshes.get(refreshKey);
  const refreshPromise = performJiraCredentialRefresh({
    credential,
    ownerUserId: normalizedOwnerUserId,
    envFileCandidates,
  }).finally(() => {
    jiraRefreshes.delete(refreshKey);
  });
  jiraRefreshes.set(refreshKey, refreshPromise);
  return refreshPromise;
}

async function performJiraCredentialRefresh({
  credential,
  ownerUserId,
  envFileCandidates,
}) {
  const configuration = await resolveJiraOAuthConfiguration({
    envFileCandidates,
  });
  if (!configuration.configured) {
    throw createJiraConfigurationError(configuration.missing);
  }
  const refreshed = await refreshJiraToken({
    clientId: configuration.clientId,
    clientSecret: configuration.clientSecret,
    refreshToken: credential.token.refreshToken,
  });
  await saveConnectorCredential({
    provider: JIRA_PROVIDER,
    uid: ownerUserId,
    credentialId: credential.credentialId,
    credentialName: credential.name,
    organizationId: credential.organizationId,
    identity: credential.identity,
    profile: credential.profile,
    token: normalizeJiraToken(refreshed, credential.token),
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  const refreshedCredential = await loadConnectorCredential({
    provider: JIRA_PROVIDER,
    uid: ownerUserId,
    credentialId: credential.credentialId,
    envFileCandidates,
    encryptionKeyNames: JIRA_ENCRYPTION_KEYS,
  });
  return refreshedCredential
    ? {
        ...refreshedCredential,
        credentialOwnerId: ownerUserId,
      }
    : null;
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
    const error = new Error("Unable to load accessible Atlassian sites.");
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

async function fetchJiraProjects(accessToken, cloudId) {
  const projects = [];
  let startAt = 0;
  for (let page = 0; page < 10; page += 1) {
    const url = new URL(
      `${JIRA_API_BASE}/ex/jira/${encodeURIComponent(cloudId)}/rest/api/3/project/search`,
    );
    url.searchParams.set("startAt", String(startAt));
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("orderBy", "name");
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        payload?.errorMessages?.[0]
        || payload?.message
        || "Unable to load Jira projects.",
      );
      error.status = response.status;
      throw error;
    }
    const values = Array.isArray(payload?.values) ? payload.values : [];
    projects.push(...values.map((project) => ({
      id: String(project?.id || "").trim(),
      key: String(project?.key || "").trim(),
      name: String(project?.name || "").trim(),
    })).filter((project) => project.id || project.key));
    startAt += values.length;
    if (values.length === 0 || payload?.isLast === true || startAt >= Number(payload?.total || 0)) break;
  }
  return projects;
}

export async function fetchConfluenceSpaces(
  accessToken,
  cloudId,
  { scope = "" } = {},
) {
  const granted = new Set(splitJiraScopes(scope));
  const scopeIsKnown = granted.size > 0;
  const canUseGranularCatalog = granted.has(
    JIRA_CONFLUENCE_GRANULAR_SPACE_SCOPE,
  );
  if (!scopeIsKnown || canUseGranularCatalog) {
    try {
      return await fetchConfluenceSpacesV2(accessToken, cloudId);
    } catch (error) {
      if (error?.status !== 401 && error?.status !== 403) throw error;
    }
  }

  // Existing shared Atlassian grants use the recommended classic Confluence
  // scopes. The v2 spaces endpoint accepts only the granular space scope, so
  // discover spaces through the classic-scope CQL catalog before asking the
  // user to reconnect. This preserves the Jira + Confluence connection that
  // worked before the product-specific explorer split.
  try {
    return await fetchConfluenceSpacesFromSearch(accessToken, cloudId);
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      throw createJiraReauthorizationRequiredError();
    }
    throw error;
  }
}

function createJiraReauthorizationRequiredError() {
  const error = new Error(
    "Reconnect Atlassian to restore access to Confluence spaces for this shared Jira and Confluence account.",
  );
  error.code = "jira_reauthorization_required";
  error.status = 428;
  error.missingScopes = [
    JIRA_CONFLUENCE_CLASSIC_SPACE_SCOPE,
    JIRA_CONFLUENCE_SEARCH_SCOPE,
  ];
  return error;
}

async function fetchConfluenceSpacesV2(accessToken, cloudId) {
  const spaces = [];
  let nextUrl = new URL(
    `${JIRA_API_BASE}/ex/confluence/${encodeURIComponent(cloudId)}/wiki/api/v2/spaces`,
  );
  nextUrl.searchParams.set("limit", "100");
  nextUrl.searchParams.set("type", "global");
  for (let page = 0; page < 10 && nextUrl; page += 1) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        payload?.errors?.[0]?.title
        || payload?.message
        || "Unable to load Confluence spaces.",
      );
      error.status = response.status;
      throw error;
    }
    const values = Array.isArray(payload?.results) ? payload.results : [];
    spaces.push(...values.map((space) => ({
      id: String(space?.id || "").trim(),
      key: String(space?.key || "").trim(),
      name: String(space?.name || "").trim(),
    })).filter((space) => space.id || space.key));
    const next = String(payload?._links?.next || "").trim();
    nextUrl = next
      ? buildConfluenceApiPaginationUrl(next, cloudId, nextUrl)
      : null;
  }
  return dedupeConfluenceSpaces(spaces);
}

async function fetchConfluenceSpacesFromSearch(accessToken, cloudId) {
  const spaces = [];
  let nextUrl = new URL(
    `${JIRA_API_BASE}/ex/confluence/${encodeURIComponent(cloudId)}/wiki/rest/api/search`,
  );
  nextUrl.searchParams.set("cql", "type in (page, blogpost)");
  nextUrl.searchParams.set("limit", "100");
  nextUrl.searchParams.set("includeArchivedSpaces", "false");
  for (let page = 0; page < 20 && nextUrl; page += 1) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        payload?.message
        || payload?.errors?.[0]?.title
        || "Unable to load Confluence spaces.",
      );
      error.status = response.status;
      throw error;
    }
    const values = Array.isArray(payload?.results) ? payload.results : [];
    spaces.push(...values.flatMap((result) => {
      const space = result?.space || result?.content?.space;
      const id = String(space?.id || "").trim();
      const key = String(space?.key || "").trim();
      const name = String(space?.name || "").trim();
      return id || key ? [{ id, key, name }] : [];
    }));
    const next = String(payload?._links?.next || "").trim();
    nextUrl = next
      ? buildConfluenceApiPaginationUrl(next, cloudId, nextUrl)
      : null;
  }
  return dedupeConfluenceSpaces(spaces);
}

function buildConfluenceApiPaginationUrl(next, cloudId, currentUrl) {
  const parsed = new URL(next, currentUrl);
  const apiPrefix = `/ex/confluence/${encodeURIComponent(cloudId)}`;
  if (parsed.origin === JIRA_API_BASE && parsed.pathname.startsWith(apiPrefix)) {
    return parsed;
  }
  const rebased = new URL(`${JIRA_API_BASE}${apiPrefix}${parsed.pathname}`);
  rebased.search = parsed.search;
  return rebased;
}

function dedupeConfluenceSpaces(spaces) {
  const byIdentity = new Map();
  (Array.isArray(spaces) ? spaces : []).forEach((space) => {
    const id = String(space?.id || "").trim();
    const key = String(space?.key || "").trim();
    const identity = id || key;
    if (!identity) return;
    byIdentity.set(identity, {
      id,
      key,
      name: String(space?.name || "").trim(),
    });
  });
  return Array.from(byIdentity.values());
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
      || "Unable to load the Atlassian profile.",
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

export function normalizeJiraToken(token, site) {
  const now = Date.now();
  return {
    accessToken: String(token?.access_token || token?.accessToken || "").trim(),
    // Atlassian may rotate refresh tokens, but it may also omit refresh_token
    // from a successful refresh response. Never discard a still-valid token.
    refreshToken: String(
      token?.refresh_token
      || token?.refreshToken
      || site?.refreshToken
      || "",
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
  return mergeJiraScopes(JIRA_DEFAULT_SCOPE, value);
}

function splitJiraScopes(value) {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((candidate) => String(candidate || "").split(/[\s,]+/))
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function mergeJiraScopes(...values) {
  return [...new Set(values.flatMap(splitJiraScopes))].join(" ");
}

export function buildJiraAuthorizationCapabilities(scope) {
  const granted = new Set(splitJiraScopes(scope));
  const hasConfluenceSpaces = granted.has(JIRA_CONFLUENCE_GRANULAR_SPACE_SCOPE)
    || (
      granted.has(JIRA_CONFLUENCE_CLASSIC_SPACE_SCOPE)
      && granted.has(JIRA_CONFLUENCE_SEARCH_SCOPE)
    );
  return {
    jira: granted.has("read:jira-work"),
    confluence: hasConfluenceSpaces,
    missingScopes: hasConfluenceSpaces
      ? []
      : [
          JIRA_CONFLUENCE_CLASSIC_SPACE_SCOPE,
          JIRA_CONFLUENCE_SEARCH_SCOPE,
        ],
  };
}

function getJiraIdentity(profile) {
  return [
    profile?.siteName,
    profile?.displayName,
    profile?.email,
    profile?.url,
  ].find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

export async function resolveJiraOAuthConfiguration({
  platformOrigin = "http://localhost",
  envFileCandidates = [],
}) {
  const [clientId, clientSecret, configuredRedirectUri] = await Promise.all([
    getFirstJiraRuntimeEnvValue(JIRA_CLIENT_ID_KEYS, envFileCandidates),
    getFirstJiraRuntimeEnvValue(JIRA_CLIENT_SECRET_KEYS, envFileCandidates),
    getFirstJiraRuntimeEnvValue(JIRA_REDIRECT_URI_KEYS, envFileCandidates),
  ]);
  const missing = [
    ...(!clientId ? ["JIRA_OAUTH_CLIENT_ID"] : []),
    ...(!clientSecret ? ["JIRA_OAUTH_CLIENT_SECRET"] : []),
  ];
  return {
    configured: missing.length === 0,
    clientId,
    clientSecret,
    redirectUri:
      configuredRedirectUri
      || new URL("/api/jira/callback", `${platformOrigin}/`).toString(),
    missing,
  };
}

async function getFirstJiraRuntimeEnvValue(keys, envFileCandidates) {
  for (const key of keys) {
    const value = await getConnectorRuntimeEnvValue(key, envFileCandidates);
    if (value) return value;
  }
  return "";
}

function sendJiraConfigurationError(
  req,
  res,
  missing,
  allowedOrigins,
) {
  return sendConnectorJson(
    req,
    res,
    503,
    {
      error: "Atlassian OAuth not configured",
      code: "jira_oauth_not_configured",
      message:
        "Atlassian authentication is unavailable because this deployment has no complete OAuth 2.0 client configured.",
      missing,
    },
    allowedOrigins,
  );
}

function createJiraConfigurationError(missing) {
  const error = new Error(
    "Atlassian authentication is unavailable because this deployment has no complete OAuth 2.0 client configured.",
  );
  error.code = "jira_oauth_not_configured";
  error.status = 503;
  error.missing = missing;
  return error;
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
