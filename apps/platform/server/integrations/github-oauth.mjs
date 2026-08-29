import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import fs from "node:fs";
import {
  handleGithubRepositoryCreate,
  handleGithubRepositories,
  handleGithubRepositoryDetail,
} from "./github-repository-api.mjs";
import {
  fetchGithubJson,
  validateGithubCredential,
} from "./github-api-client.mjs";
import {
  connectorStorageConsumeDocument,
  connectorStorageGetDocument,
  connectorStoragePatchDocument,
  registerOrganizationConnectorCredential,
  sanitizeConnectorRedirectTarget,
  unregisterOrganizationConnectorCredential,
} from "./connector-oauth-core.mjs";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
const FIRESTORE_TOKEN_COLLECTION = "user_oauth_tokens";
const OAUTH_STATE_COLLECTION = "oauth_states";
const ENCRYPTION_ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

let cachedEnvMap = null;

export function isGithubApiRequestPath(pathname) {
  return pathname === "/api/github/callback"
    || pathname.startsWith("/api/github/")
    || pathname.startsWith("/api/aios/github/");
}

export async function handleGithubApiRequest({
  req,
  res,
  url,
  platformOrigin,
  envFileCandidates = [],
  allowedOrigins = [],
  verifyUser = verifyRequestUser,
}) {
  const normalizedPathname = normalizeGithubApiPath(url.pathname);
  if (!normalizedPathname) {
    return false;
  }

  if (req.method === "OPTIONS") {
    return sendCorsPreflight(req, res, allowedOrigins);
  }

  try {
    if (req.method === "POST" && normalizedPathname === "/api/github/login") {
      return await handleGithubLogin(req, res, {
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/callback") {
      return await handleGithubCallback(req, res, {
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/user") {
      return await handleGithubUser(req, res, {
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }

    if (req.method === "POST" && normalizedPathname === "/api/github/disconnect") {
      return await handleGithubDisconnect(req, res, {
        envFileCandidates,
        allowedOrigins,
        verifyUser,
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/repos") {
      return await handleGithubRepositories({
        req,
        res,
        url,
        envFileCandidates,
        allowedOrigins,
        verifyRequestUser: verifyUser,
        loadGithubToken: (uid, candidates, credentialId = "") => loadGithubRequestToken(
          req,
          uid,
          candidates,
          credentialId,
        ),
        deleteGithubToken,
        sendJson: sendGithubJson,
      });
    }

    if (req.method === "POST" && normalizedPathname === "/api/github/repos") {
      return await handleGithubRepositoryCreate({
        req,
        res,
        url,
        body: await readRequestBody(req),
        envFileCandidates,
        allowedOrigins,
        verifyRequestUser: verifyUser,
        loadGithubToken: (uid, candidates, credentialId = "") => loadGithubRequestToken(
          req,
          uid,
          candidates,
          credentialId,
        ),
        deleteGithubToken,
        sendJson: sendGithubJson,
      });
    }

    if (req.method === "GET" && normalizedPathname.startsWith("/api/github/repos/")) {
      return await handleGithubRepositoryDetail({
        req,
        res,
        url,
        normalizedPathname,
        envFileCandidates,
        allowedOrigins,
        verifyRequestUser: verifyUser,
        loadGithubToken: (uid, candidates, credentialId = "") => loadGithubRequestToken(
          req,
          uid,
          candidates,
          credentialId,
        ),
        deleteGithubToken,
        sendJson: sendGithubJson,
      });
    }

    return sendGithubJson(req, res, 404, {
      error: "Not found",
      message: "GitHub API route not found.",
    }, allowedOrigins);
  } catch (error) {
    if (error?.code === "unauthorized") {
      return sendGithubJson(req, res, 401, {
        error: error instanceof Error ? error.message : "Unauthorized",
      }, allowedOrigins);
    }
    return sendGithubJson(req, res, 500, {
      error: "GitHub integration error",
      message: error instanceof Error ? error.message : String(error),
    }, allowedOrigins);
  }
}

function normalizeGithubApiPath(pathname) {
  if (pathname === "/api/github/callback") return pathname;
  if (pathname.startsWith("/api/github/")) return pathname;
  if (pathname.startsWith("/api/aios/github/")) {
    return pathname.replace(/^\/api\/aios/, "/api");
  }
  return null;
}

async function loadGithubRequestToken(req, uid, envFileCandidates, credentialId = "") {
  const organizationId = normalizeGithubOrganizationId(
    urlSearchParam(req, "organizationId")
      || req.headers["x-computer-agents-organization"],
  );
  if (!organizationId) {
    return loadGithubToken(uid, envFileCandidates, credentialId);
  }
  const completeStore = await readGithubCredentialStore(uid, envFileCandidates);
  return loadGithubToken(
    uid,
    envFileCandidates,
    credentialId,
    scopeGithubCredentialStore(completeStore, organizationId),
  );
}

async function handleGithubLogin(req, res, {
  platformOrigin,
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  const body = await readRequestBody(req);
  const verifiedUser = await verifyUser(req, envFileCandidates);
  const clientId = await getRuntimeEnvValue("GITHUB_OAUTH_CLIENT_ID", envFileCandidates);
  if (!clientId) {
    return sendGithubJson(req, res, 500, {
      error: "GitHub OAuth not configured",
    }, allowedOrigins);
  }

  const redirectTarget = sanitizeConnectorRedirectTarget(
    body?.redirectTo,
    platformOrigin,
  );
  const overrideRedirectUri = await resolveOAuthCallbackUrl(platformOrigin, envFileCandidates);
  const hasRedirectUriOverride = Boolean(overrideRedirectUri);
  const state = randomBytes(16).toString("hex");
  const pkceVerifier = randomBytes(48).toString("base64url");
  const pkceChallenge = createGithubPkceChallenge(pkceVerifier);
  const scope = typeof body?.scope === "string" && body.scope.trim()
    ? body.scope.trim()
    : "repo read:user read:org workflow admin:repo_hook project admin:org";

  await saveOAuthState(state, {
    provider: "github",
    uid: verifiedUser.uid,
    redirectTarget,
    callbackHandler: "platform",
    callbackTarget: new URL("/api/github/callback", `${platformOrigin}/`).toString(),
    credentialId: normalizeGithubCredentialId(body?.credentialId),
    credentialName: normalizeGithubCredentialName(body?.credentialName),
    organizationId: normalizeGithubOrganizationId(body?.organizationId),
    pkceVerifier,
  }, envFileCandidates);

  const authUrl = buildGithubAuthorizationUrl({
    clientId,
    ...(hasRedirectUriOverride ? { redirectUri: overrideRedirectUri } : {}),
    state,
    scope,
    pkceChallenge,
  });

  return sendGithubJson(req, res, 200, {
    authUrl,
    state,
    uid: verifiedUser.uid,
  }, allowedOrigins);
}

async function handleGithubCallback(req, res, { platformOrigin, envFileCandidates, allowedOrigins }) {
  const stateParam = urlSearchParam(req, "state");
  if (!stateParam) {
    return sendGithubJson(req, res, 400, {
      error: "Invalid OAuth callback",
    }, allowedOrigins);
  }

  const stateData = await getOAuthState(stateParam, "github", envFileCandidates);
  if (!stateData) {
    return sendGithubJson(req, res, 400, {
      error: "Invalid or expired OAuth state. Please try again.",
    }, allowedOrigins);
  }

  const providerError = normalizeGithubOAuthError(
    urlSearchParam(req, "error") || urlSearchParam(req, "error_description"),
  );
  if (providerError) {
    return sendRedirect(
      req,
      res,
      302,
      appendGithubOAuthResultToRedirectTarget(stateData.redirectTarget, {
        result: "error",
        error: providerError,
      }),
      allowedOrigins,
    );
  }

  const code = urlSearchParam(req, "code");
  if (!code) {
    return sendRedirect(
      req,
      res,
      302,
      appendGithubOAuthResultToRedirectTarget(stateData.redirectTarget, {
        result: "error",
        error: "authorization_code_missing",
      }),
      allowedOrigins,
    );
  }

  const clientId = await getRuntimeEnvValue("GITHUB_OAUTH_CLIENT_ID", envFileCandidates);
  const clientSecret = await getRuntimeEnvValue("GITHUB_OAUTH_CLIENT_SECRET", envFileCandidates);
  if (!clientId || !clientSecret) {
    return sendGithubJson(req, res, 500, {
      error: "GitHub OAuth not configured",
    }, allowedOrigins);
  }

  const redirectUri = await resolveOAuthCallbackUrl(platformOrigin, envFileCandidates);
  const hasRedirectUriOverride = Boolean(redirectUri);

  const tokenRequestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });
  if (stateData.pkceVerifier) {
    tokenRequestBody.set("code_verifier", stateData.pkceVerifier);
  }
  if (hasRedirectUriOverride) {
    tokenRequestBody.set("redirect_uri", redirectUri);
  }

  const response = await fetch(GITHUB_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: tokenRequestBody,
  });
  const token = await response.json().catch(() => ({}));
  if (!response.ok || token?.error || !token?.access_token) {
    return sendRedirect(
      req,
      res,
      302,
      appendGithubOAuthResultToRedirectTarget(stateData.redirectTarget, {
        result: "error",
        error: normalizeGithubOAuthError(token?.error) || "token_exchange_failed",
      }),
      allowedOrigins,
    );
  }

  try {
    let profile = {};
    try {
      profile = await fetchGithubJson("/user", token.access_token);
    } catch (error) {
      // Token exchange is the durable authorization boundary. Profile
      // enrichment can be repaired by the status endpoint after a temporary
      // GitHub API failure and must not discard a newly issued token.
      console.warn("[github-oauth] GitHub profile enrichment deferred.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
    await saveGithubToken(stateData.uid, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      scope: token.scope,
      tokenType: token.token_type,
      expiresIn: token.expires_in,
      obtainedAt: Date.now(),
      credentialId: stateData.credentialId,
      credentialName: stateData.credentialName,
      organizationId: stateData.organizationId,
      profile,
    }, envFileCandidates);
  } catch {
    return sendRedirect(
      req,
      res,
      302,
      appendGithubOAuthResultToRedirectTarget(stateData.redirectTarget, {
        result: "error",
        error: "credential_save_failed",
      }),
      allowedOrigins,
    );
  }

  return sendRedirect(
    req,
    res,
    302,
    appendGithubOAuthResultToRedirectTarget(stateData.redirectTarget, {
      result: "success",
    }),
    allowedOrigins,
  );
}

export function createGithubPkceChallenge(verifier) {
  const normalizedVerifier = String(verifier || "").trim();
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(normalizedVerifier)) {
    throw new TypeError("GitHub PKCE verifier must contain 43 to 128 valid characters.");
  }
  return createHash("sha256").update(normalizedVerifier, "ascii").digest("base64url");
}

export function buildGithubAuthorizationUrl({
  clientId,
  redirectUri = "",
  state,
  scope,
  pkceChallenge,
}) {
  const authUrl = new URL(GITHUB_AUTHORIZE_URL);
  authUrl.searchParams.set("client_id", String(clientId || "").trim());
  if (String(redirectUri || "").trim()) {
    authUrl.searchParams.set("redirect_uri", String(redirectUri).trim());
  }
  authUrl.searchParams.set("state", String(state || "").trim());
  authUrl.searchParams.set("scope", String(scope || "").trim());
  authUrl.searchParams.set("allow_signup", "false");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("code_challenge", String(pkceChallenge || "").trim());
  authUrl.searchParams.set("code_challenge_method", "S256");
  return authUrl.toString();
}

export function appendGithubOAuthResultToRedirectTarget(
  redirectTarget,
  { result, error = "" },
) {
  try {
    const url = new URL(String(redirectTarget || ""));
    if (url.searchParams.get("connectorAuthReturn") !== "1") {
      return url.toString();
    }
    url.searchParams.set("connectorAuthResult", result === "success" ? "success" : "error");
    const normalizedError = normalizeGithubOAuthError(error);
    if (result !== "success" && normalizedError) {
      url.searchParams.set("connectorAuthError", normalizedError);
    } else {
      url.searchParams.delete("connectorAuthError");
    }
    return url.toString();
  } catch {
    return String(redirectTarget || "");
  }
}

function normalizeGithubOAuthError(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

async function handleGithubUser(req, res, {
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  try {
    const verifiedUser = await verifyUser(req, envFileCandidates);
    const requestedCredentialId = urlSearchParam(req, "credentialId");
    const requestedOrganizationId = normalizeGithubOrganizationId(
      urlSearchParam(req, "organizationId")
        || req.headers["x-computer-agents-organization"],
    );
    const completeStore = await readGithubCredentialStore(
      verifiedUser.uid,
      envFileCandidates,
    );
    const scopedStore = scopeGithubCredentialStore(
      completeStore,
      requestedOrganizationId,
    );
    await trySyncGithubCredentialRegistry(
      verifiedUser.uid,
      scopedStore,
      envFileCandidates,
    );
    const token = await loadGithubToken(
      verifiedUser.uid,
      envFileCandidates,
      requestedCredentialId,
      scopedStore,
    );
    if (!token) {
      return sendGithubJson(req, res, 200, {
        connected: false,
        credentials: listPublicGithubCredentials(scopedStore),
        defaultCredentialId: scopedStore.defaultCredentialId || undefined,
      }, allowedOrigins);
    }

    const validation = await validateGithubCredential(token.accessToken);
    if (validation.state === "valid") {
      const profile = validation.profile;
      const store = await updateGithubCredentialMetadata(
        verifiedUser.uid,
        token.credentialId,
        {
          profile,
          identity: getGithubProfileIdentity(profile),
          lastCheckedAt: Date.now(),
          status: "valid",
        },
        envFileCandidates,
      );
      const nextScopedStore = scopeGithubCredentialStore(
        store,
        requestedOrganizationId,
      );
      return sendGithubJson(req, res, 200, {
        connected: true,
        profile,
        credentials: listPublicGithubCredentials(nextScopedStore),
        defaultCredentialId: nextScopedStore.defaultCredentialId || undefined,
        scope: token.scope || "",
        tokenType: token.tokenType || "bearer",
        expiresAt: token.expiresAt ?? null,
      }, allowedOrigins);
    }
    if (validation.state === "invalid") {
      const store = await updateGithubCredentialMetadata(
        verifiedUser.uid,
        token.credentialId,
        {
          status: "invalid",
          lastCheckedAt: Date.now(),
        },
        envFileCandidates,
      );
      const nextScopedStore = scopeGithubCredentialStore(
        store,
        requestedOrganizationId,
      );
      const credentials = listPublicGithubCredentials(nextScopedStore);
      return sendGithubJson(req, res, 200, {
        connected: credentials.some(({ status }) => status === "valid"),
        profile: token.profile || undefined,
        credentials,
        defaultCredentialId: nextScopedStore.defaultCredentialId || undefined,
        reason: "token_revoked",
      }, allowedOrigins);
    }

    // Provider validation is advisory. A temporary GitHub outage must not
    // erase or visually disconnect a credential that is safely stored.
    return sendGithubJson(req, res, 200, {
      connected: true,
      profile: token.profile || undefined,
      credentials: listPublicGithubCredentials(scopedStore),
      defaultCredentialId: scopedStore.defaultCredentialId || undefined,
      scope: token.scope || "",
      tokenType: token.tokenType || "bearer",
      expiresAt: token.expiresAt ?? null,
      reason: "validation_unavailable",
    }, allowedOrigins);
  } catch (error) {
    if (error?.code === "unauthorized") {
      return sendGithubJson(req, res, 200, {
        connected: false,
        credentials: [],
      }, allowedOrigins);
    }
    throw error;
  }
}

async function handleGithubDisconnect(req, res, {
  envFileCandidates,
  allowedOrigins,
  verifyUser,
}) {
  const verifiedUser = await verifyUser(req, envFileCandidates);
  const body = await readRequestBody(req);
  const credentialId = normalizeGithubCredentialId(body?.credentialId);
  const store = await deleteGithubToken(
    verifiedUser.uid,
    envFileCandidates,
    credentialId,
  );
  return sendGithubJson(req, res, 200, {
    success: true,
    connected: Object.keys(store.credentials).length > 0,
    credentials: listPublicGithubCredentials(store),
    defaultCredentialId: store.defaultCredentialId || undefined,
  }, allowedOrigins);
}

async function resolveOAuthCallbackUrl(origin, envFileCandidates) {
  const explicit = await getRuntimeEnvValue("GITHUB_OAUTH_REDIRECT_URI", envFileCandidates)
    || await getRuntimeEnvValue("GITHUB_OAUTH_REDIRECT_URL", envFileCandidates);
  return explicit || "";
}

async function verifyRequestUser(req, envFileCandidates) {
  const idToken = extractIdToken(req);
  if (!idToken) {
    const error = new Error("Missing ID token");
    error.code = "unauthorized";
    throw error;
  }

  const firebaseApiKey = await getRuntimeEnvValue("FIREBASE_WEB_API_KEY", envFileCandidates)
    || await getRuntimeEnvValue("NEXT_PUBLIC_FIREBASE_API_KEY", envFileCandidates);
  if (!firebaseApiKey) {
    throw new Error("Firebase API key not configured");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const payload = await response.json().catch(() => ({}));
  const user = Array.isArray(payload?.users) ? payload.users[0] : null;
  if (!response.ok || !user?.localId) {
    const error = new Error("Unauthorized");
    error.code = "unauthorized";
    throw error;
  }

  return {
    uid: user.localId,
    email: user.email || "",
    idToken,
  };
}

function extractIdToken(req) {
  const authorization = String(req.headers.authorization || "");
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  const cookies = parseCookieHeader(req.headers.cookie || "");
  return cookies.__session || cookies.tb_id_token || "";
}

function parseCookieHeader(value) {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, entry) => {
      const index = entry.indexOf("=");
      if (index === -1) return accumulator;
      const key = entry.slice(0, index).trim();
      const rawValue = entry.slice(index + 1).trim();
      try {
        accumulator[key] = decodeURIComponent(rawValue);
      } catch {
        accumulator[key] = rawValue;
      }
      return accumulator;
    }, {});
}

function urlSearchParam(req, key) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  return requestUrl.searchParams.get(key) || "";
}

async function saveOAuthState(state, data, envFileCandidates) {
  const now = Date.now();
  await connectorStoragePatchDocument(`${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`, {
    state: { stringValue: state },
    redirectTarget: { stringValue: data.redirectTarget },
    provider: { stringValue: data.provider },
    uid: { stringValue: data.uid },
    callbackHandler: { stringValue: data.callbackHandler || "" },
    callbackTarget: { stringValue: data.callbackTarget || "" },
    credentialId: { stringValue: data.credentialId || "" },
    credentialName: { stringValue: data.credentialName || "" },
    organizationId: { stringValue: data.organizationId || "" },
    pkceVerifier: { stringValue: data.pkceVerifier || "" },
    createdAt: { integerValue: String(now) },
    expiresAt: { integerValue: String(now + 600_000) },
  }, [], envFileCandidates);
}

async function getOAuthState(state, provider, envFileCandidates) {
  const document = await connectorStorageConsumeDocument(
    `${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`,
    envFileCandidates,
  );
  if (!document) {
    return null;
  }
  const fields = document?.fields || {};
  const storedProvider = getFirestoreString(fields?.provider);
  const expiresAt = getFirestoreInteger(fields?.expiresAt);
  if (storedProvider !== provider || !expiresAt || Date.now() > expiresAt) {
    return null;
  }
  return {
    uid: getFirestoreString(fields?.uid) || "",
    redirectTarget: getFirestoreString(fields?.redirectTarget) || "",
    credentialId: normalizeGithubCredentialId(getFirestoreString(fields?.credentialId)),
    credentialName: normalizeGithubCredentialName(getFirestoreString(fields?.credentialName)),
    organizationId: normalizeGithubOrganizationId(getFirestoreString(fields?.organizationId)),
    pkceVerifier: normalizeGithubPkceVerifier(getFirestoreString(fields?.pkceVerifier)),
  };
}

function normalizeGithubPkceVerifier(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9._~-]{43,128}$/.test(normalized) ? normalized : "";
}

function normalizeGithubCredentialId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,120}$/.test(normalized) ? normalized : "";
}

function createGithubCredentialId() {
  return `github_${randomBytes(12).toString("base64url")}`;
}

function normalizeGithubCredentialName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function normalizeGithubOrganizationId(value) {
  return String(value || "").trim().slice(0, 200);
}

function sanitizeGithubProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return {};
  }
  return {
    id: typeof profile.id === "number" ? profile.id : undefined,
    login: typeof profile.login === "string" ? profile.login : "",
    name: typeof profile.name === "string" ? profile.name : "",
    email: typeof profile.email === "string" ? profile.email : "",
    avatar_url: typeof profile.avatar_url === "string" ? profile.avatar_url : "",
    html_url: typeof profile.html_url === "string" ? profile.html_url : "",
  };
}

function getGithubProfileIdentity(profile) {
  return [
    profile?.login,
    profile?.email,
    profile?.name,
  ].find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function normalizeStoredGithubCredential(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const id = normalizeGithubCredentialId(value.id);
  const encryptedToken = String(value.encryptedToken || "").trim();
  if (!id || !encryptedToken) {
    return null;
  }
  const createdAt = Math.max(0, Number(value.createdAt || 0)) || Date.now();
  return {
    id,
    name: normalizeGithubCredentialName(value.name) || "GitHub account",
    identity: String(value.identity || "").trim().slice(0, 200),
    organizationId: normalizeGithubOrganizationId(value.organizationId),
    encryptedToken,
    profile: sanitizeGithubProfile(value.profile),
    status: value.status === "invalid" ? "invalid" : "valid",
    createdAt,
    updatedAt: Math.max(createdAt, Number(value.updatedAt || 0)) || createdAt,
    lastCheckedAt: Math.max(0, Number(value.lastCheckedAt || 0)),
  };
}

function parseGithubCredentialStore(document) {
  const fields = document?.fields || {};
  let parsed = {};
  try {
    parsed = JSON.parse(getFirestoreString(fields.githubCredentialsJson) || "{}");
  } catch {
    parsed = {};
  }
  const rawCredentials =
    parsed?.credentials && typeof parsed.credentials === "object" && !Array.isArray(parsed.credentials)
      ? parsed.credentials
      : {};
  const credentials = Object.values(rawCredentials).reduce((result, value) => {
    const credential = normalizeStoredGithubCredential(value);
    if (credential) {
      result[credential.id] = credential;
    }
    return result;
  }, {});
  let defaultCredentialId = normalizeGithubCredentialId(
    getFirestoreString(fields.githubDefaultCredentialId)
      || parsed?.defaultCredentialId,
  );
  let migrated = false;

  if (Object.keys(credentials).length === 0) {
    const legacyFields = fields?.github?.mapValue?.fields || {};
    const legacyEncryptedToken = getFirestoreString(legacyFields.encryptedToken);
    if (legacyEncryptedToken) {
      const legacyUpdatedAt = getFirestoreInteger(legacyFields.updatedAt) || Date.now();
      const legacyCredential = normalizeStoredGithubCredential({
        id: "github_legacy_default",
        name: "GitHub account",
        encryptedToken: legacyEncryptedToken,
        createdAt: legacyUpdatedAt,
        updatedAt: legacyUpdatedAt,
        lastCheckedAt: 0,
        status: "valid",
      });
      if (legacyCredential) {
        credentials[legacyCredential.id] = legacyCredential;
        defaultCredentialId = legacyCredential.id;
        migrated = true;
      }
    }
  }

  if (!credentials[defaultCredentialId]) {
    defaultCredentialId = Object.keys(credentials)[0] || "";
  }

  return {
    credentials,
    defaultCredentialId,
    migrated,
  };
}

function scopeGithubCredentialStore(store, organizationId = "") {
  const normalizedOrganizationId = normalizeGithubOrganizationId(organizationId);
  if (!normalizedOrganizationId) return store;
  const credentials = Object.fromEntries(
    Object.entries(store?.credentials || {}).filter(([, credential]) => (
      credential.organizationId === normalizedOrganizationId
    )),
  );
  return {
    credentials,
    defaultCredentialId: credentials[store?.defaultCredentialId]
      ? store.defaultCredentialId
      : Object.keys(credentials)[0] || "",
    migrated: false,
  };
}

async function syncGithubCredentialRegistry(uid, store, envFileCandidates) {
  const credentials = Object.values(store?.credentials || {}).sort((left, right) => {
    if (left.id === store.defaultCredentialId) return -1;
    if (right.id === store.defaultCredentialId) return 1;
    return left.createdAt - right.createdAt;
  });
  await Promise.all(credentials.map((credential) => (
    credential.organizationId
      ? registerOrganizationConnectorCredential({
          organizationId: credential.organizationId,
          provider: "github",
          credential,
          ownerUserId: uid,
          envFileCandidates,
        })
      : null
  )));
  return store;
}

async function trySyncGithubCredentialRegistry(uid, store, envFileCandidates) {
  try {
    await syncGithubCredentialRegistry(uid, store, envFileCandidates);
    return true;
  } catch (error) {
    // The encrypted user credential store is authoritative. The organization
    // catalog is a derived index and is retried on every status read, so a
    // transient catalog failure must not make a persisted credential vanish.
    console.warn("[github-oauth] Credential catalog synchronization deferred.", {
      credentialCount: Object.keys(store?.credentials || {}).length,
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function readGithubCredentialStore(uid, envFileCandidates) {
  const document = await connectorStorageGetDocument(
    `${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`,
    envFileCandidates,
  );
  const store = parseGithubCredentialStore(document);
  if (store.migrated) {
    await writeGithubCredentialStore(uid, store, envFileCandidates);
    store.migrated = false;
  }
  return store;
}

async function writeGithubCredentialStore(uid, store, envFileCandidates) {
  const credentialIds = Object.keys(store.credentials);
  const defaultCredentialId = store.credentials[store.defaultCredentialId]
    ? store.defaultCredentialId
    : credentialIds[0] || "";
  const defaultCredential = store.credentials[defaultCredentialId] || null;
  const serializedStore = {
    version: 1,
    defaultCredentialId,
    credentials: store.credentials,
  };
  await connectorStoragePatchDocument(`${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`, {
    githubCredentialsJson: { stringValue: JSON.stringify(serializedStore) },
    githubDefaultCredentialId: { stringValue: defaultCredentialId },
    github: defaultCredential
      ? {
          mapValue: {
            fields: {
              encryptedToken: { stringValue: defaultCredential.encryptedToken },
              updatedAt: { integerValue: String(defaultCredential.updatedAt || Date.now()) },
            },
          },
        }
      : { nullValue: null },
  }, ["githubCredentialsJson", "githubDefaultCredentialId", "github"], envFileCandidates);
  return {
    credentials: store.credentials,
    defaultCredentialId,
    migrated: false,
  };
}

function listPublicGithubCredentials(store) {
  return Object.values(store?.credentials || {})
    .sort((left, right) => {
      if (left.id === store.defaultCredentialId) return -1;
      if (right.id === store.defaultCredentialId) return 1;
      return left.createdAt - right.createdAt;
    })
    .map((credential) => ({
      id: credential.id,
      name: credential.name,
      identity: credential.identity || getGithubProfileIdentity(credential.profile),
      method: "OAuth 2.0",
      status: credential.status || "valid",
      isDefault: credential.id === store.defaultCredentialId,
      createdAt: new Date(credential.createdAt).toISOString(),
      updatedAt: new Date(credential.updatedAt).toISOString(),
      lastCheckedAt: credential.lastCheckedAt
        ? new Date(credential.lastCheckedAt).toISOString()
        : undefined,
    }));
}

async function saveGithubToken(uid, payload, envFileCandidates) {
  const now = payload.obtainedAt ?? Date.now();
  const expiresAt = payload.expiresIn && payload.expiresIn > 0
    ? now + (payload.expiresIn * 1000)
    : undefined;
  const encryptedToken = await encryptToken(JSON.stringify({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType || "bearer",
    scope: payload.scope || "",
    expiresAt,
    updatedAt: now,
  }), envFileCandidates);
  const store = await readGithubCredentialStore(uid, envFileCandidates);
  const credentialId = normalizeGithubCredentialId(payload.credentialId)
    || createGithubCredentialId();
  const existing = store.credentials[credentialId];
  const profile = sanitizeGithubProfile(payload.profile);
  store.credentials[credentialId] = {
    id: credentialId,
    name: normalizeGithubCredentialName(payload.credentialName)
      || existing?.name
      || getGithubProfileIdentity(profile)
      || "GitHub account",
    identity: getGithubProfileIdentity(profile) || existing?.identity || "",
    organizationId: normalizeGithubOrganizationId(payload.organizationId)
      || existing?.organizationId
      || "",
    encryptedToken,
    profile,
    status: "valid",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastCheckedAt: now,
  };
  if (!store.defaultCredentialId || !store.credentials[store.defaultCredentialId]) {
    store.defaultCredentialId = credentialId;
  }
  const writtenStore = await writeGithubCredentialStore(
    uid,
    store,
    envFileCandidates,
  );
  const nextCredential = writtenStore.credentials[credentialId];
  if (
    existing?.organizationId
    && existing.organizationId !== nextCredential.organizationId
  ) {
    await unregisterOrganizationConnectorCredential({
      organizationId: existing.organizationId,
      provider: "github",
      credentialId,
      envFileCandidates,
    });
  }
  await trySyncGithubCredentialRegistry(uid, writtenStore, envFileCandidates);
  return writtenStore;
}

async function loadGithubToken(
  uid,
  envFileCandidates,
  credentialId = "",
  existingStore = null,
) {
  const store = existingStore || await readGithubCredentialStore(
    uid,
    envFileCandidates,
  );
  const selectedCredentialId = normalizeGithubCredentialId(credentialId)
    || store.defaultCredentialId;
  const credential = store.credentials[selectedCredentialId];
  if (!credential?.encryptedToken) {
    return null;
  }
  try {
    return {
      ...JSON.parse(await decryptToken(credential.encryptedToken, envFileCandidates)),
      credentialId: selectedCredentialId,
      profile: credential.profile,
    };
  } catch {
    return null;
  }
}

async function updateGithubCredentialMetadata(
  uid,
  credentialId,
  metadata,
  envFileCandidates,
) {
  const store = await readGithubCredentialStore(uid, envFileCandidates);
  const normalizedCredentialId = normalizeGithubCredentialId(credentialId);
  const current = store.credentials[normalizedCredentialId];
  if (!current) {
    return store;
  }
  store.credentials[normalizedCredentialId] = {
    ...current,
    ...(metadata.profile ? { profile: sanitizeGithubProfile(metadata.profile) } : {}),
    ...(typeof metadata.identity === "string"
      ? { identity: metadata.identity.trim().slice(0, 200) }
      : {}),
    ...(metadata.status === "invalid" || metadata.status === "valid"
      ? { status: metadata.status }
      : {}),
    ...(Number(metadata.lastCheckedAt) > 0
      ? { lastCheckedAt: Number(metadata.lastCheckedAt) }
      : {}),
    updatedAt: Date.now(),
  };
  const writtenStore = await writeGithubCredentialStore(
    uid,
    store,
    envFileCandidates,
  );
  await trySyncGithubCredentialRegistry(uid, writtenStore, envFileCandidates);
  return writtenStore;
}

async function deleteGithubToken(uid, envFileCandidates, credentialId = "") {
  const store = await readGithubCredentialStore(uid, envFileCandidates);
  const normalizedCredentialId = normalizeGithubCredentialId(credentialId);
  const removedCredentials = normalizedCredentialId
    ? [store.credentials[normalizedCredentialId]].filter(Boolean)
    : Object.values(store.credentials);
  if (normalizedCredentialId) {
    delete store.credentials[normalizedCredentialId];
  } else {
    store.credentials = {};
  }
  if (!store.credentials[store.defaultCredentialId]) {
    store.defaultCredentialId = Object.keys(store.credentials)[0] || "";
  }
  const writtenStore = await writeGithubCredentialStore(
    uid,
    store,
    envFileCandidates,
  );
  for (const removedCredential of removedCredentials) {
    if (!removedCredential.organizationId) continue;
    await unregisterOrganizationConnectorCredential({
      organizationId: removedCredential.organizationId,
      provider: "github",
      credentialId: removedCredential.id,
      envFileCandidates,
    });
  }
  return writtenStore;
}

async function encryptToken(value, envFileCandidates) {
  const key = await getEncryptionKey(envFileCandidates);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

async function decryptToken(value, envFileCandidates) {
  const key = await getEncryptionKey(envFileCandidates);
  const buffer = Buffer.from(value, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ENCRYPTION_ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

async function getEncryptionKey(envFileCandidates) {
  const key = await getRuntimeEnvValue(
    "GITHUB_TOKEN_ENCRYPTION_KEY",
    envFileCandidates,
  ) || await getRuntimeEnvValue(
    "CONNECTOR_TOKEN_ENCRYPTION_KEY",
    envFileCandidates,
  );
  if (!key) {
    throw new Error("Missing connector token encryption key");
  }
  try {
    const decoded = Buffer.from(key, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {}
  if (key.length === 32) {
    return Buffer.from(key, "utf8");
  }
  throw new Error("Connector token encryption key must be 32 bytes");
}

async function getRuntimeEnvValue(key, envFileCandidates) {
  const directValue = typeof process.env[key] === "string" ? process.env[key].trim() : "";
  if (directValue) {
    return directValue;
  }
  const envMap = await loadEnvMap(envFileCandidates);
  return envMap.get(key) || "";
}

async function loadEnvMap(envFileCandidates) {
  if (cachedEnvMap) {
    return cachedEnvMap;
  }
  cachedEnvMap = new Map();
  envFileCandidates.forEach((candidatePath) => {
    try {
      if (!candidatePath || !fs.existsSync(candidatePath)) {
        return;
      }
      const text = fs.readFileSync(candidatePath, "utf8");
      text.split(/\r?\n/).forEach((line) => {
        if (!line || line.trim().startsWith("#") || !line.includes("=")) {
          return;
        }
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();
        if (
          (value.startsWith("\"") && value.endsWith("\""))
          || (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!cachedEnvMap.has(key) && value) {
          cachedEnvMap.set(key, value);
        }
      });
    } catch {}
  });
  return cachedEnvMap;
}

function getFirestoreString(value) {
  if (!value || typeof value !== "object") return null;
  return typeof value.stringValue === "string" ? value.stringValue : null;
}

function getFirestoreInteger(value) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.integerValue === "string" || typeof value.integerValue === "number") {
    const parsed = Number(value.integerValue);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildCorsHeaders(req, allowedOrigins) {
  const requestOrigin = String(req.headers.origin || "").trim();
  const responseHeaders = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-API-Key,X-Computer-Agents-Organization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    responseHeaders["Access-Control-Allow-Origin"] = requestOrigin;
  }
  return responseHeaders;
}

function sendCorsPreflight(req, res, allowedOrigins) {
  res.writeHead(204, buildCorsHeaders(req, allowedOrigins));
  res.end();
  return true;
}

function sendGithubJson(req, res, status, payload, allowedOrigins) {
  res.writeHead(status, {
    ...buildCorsHeaders(req, allowedOrigins),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
  return true;
}

function sendRedirect(req, res, status, location, allowedOrigins) {
  res.writeHead(status, {
    ...buildCorsHeaders(req, allowedOrigins),
    Location: location,
    "Cache-Control": "no-store",
  });
  res.end();
  return true;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
