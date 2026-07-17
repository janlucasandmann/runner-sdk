import { createCipheriv, createDecipheriv, createPrivateKey, createSign, randomBytes } from "node:crypto";
import fs from "node:fs";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE = "https://api.github.com";
const FIRESTORE_TOKEN_COLLECTION = "user_oauth_tokens";
const OAUTH_STATE_COLLECTION = "oauth_states";
const ENCRYPTION_ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

let cachedEnvMap = null;
let cachedGoogleAccessToken = null;

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
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/callback") {
      return await handleGithubCallback(req, res, {
        platformOrigin,
        envFileCandidates,
        allowedOrigins,
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/user") {
      return await handleGithubUser(req, res, {
        envFileCandidates,
        allowedOrigins,
      });
    }

    if (req.method === "POST" && normalizedPathname === "/api/github/disconnect") {
      return await handleGithubDisconnect(req, res, {
        envFileCandidates,
        allowedOrigins,
      });
    }

    if (req.method === "GET" && normalizedPathname === "/api/github/repos") {
      return await handleGithubRepos(req, res, url, {
        envFileCandidates,
        allowedOrigins,
      });
    }

    if (req.method === "GET" && normalizedPathname.startsWith("/api/github/repos/")) {
      return await handleGithubRepoDetail(req, res, url, normalizedPathname, {
        envFileCandidates,
        allowedOrigins,
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

async function handleGithubLogin(req, res, { platformOrigin, envFileCandidates, allowedOrigins }) {
  const body = await readRequestBody(req);
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const clientId = await getRuntimeEnvValue("GITHUB_OAUTH_CLIENT_ID", envFileCandidates);
  if (!clientId) {
    return sendGithubJson(req, res, 500, {
      error: "GitHub OAuth not configured",
    }, allowedOrigins);
  }

  const redirectTarget = sanitizeOAuthRedirectTarget(body?.redirectTo, platformOrigin);
  const overrideRedirectUri = await resolveOAuthCallbackUrl(platformOrigin, envFileCandidates);
  const hasRedirectUriOverride = Boolean(overrideRedirectUri);
  const state = randomBytes(16).toString("hex");
  const scope = typeof body?.scope === "string" && body.scope.trim()
    ? body.scope.trim()
    : "repo read:user read:org workflow admin:repo_hook project admin:org";

  await saveOAuthState(state, {
    provider: "github",
    uid: verifiedUser.uid,
    redirectTarget,
  }, envFileCandidates);

  const authUrl = new URL(GITHUB_AUTHORIZE_URL);
  authUrl.searchParams.set("client_id", clientId);
  if (hasRedirectUriOverride) {
    authUrl.searchParams.set("redirect_uri", overrideRedirectUri);
  }
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("allow_signup", "false");

  return sendGithubJson(req, res, 200, {
    authUrl: authUrl.toString(),
    state,
    uid: verifiedUser.uid,
  }, allowedOrigins);
}

async function handleGithubCallback(req, res, { platformOrigin, envFileCandidates, allowedOrigins }) {
  const stateParam = urlSearchParam(req, "state");
  const code = urlSearchParam(req, "code");
  if (!stateParam || !code) {
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
    return sendGithubJson(req, res, 500, {
      error: token?.error_description || token?.error || "Failed to connect GitHub",
    }, allowedOrigins);
  }

  await saveGithubToken(stateData.uid, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    scope: token.scope,
    tokenType: token.token_type,
    expiresIn: token.expires_in,
    obtainedAt: Date.now(),
  }, envFileCandidates);

  return sendRedirect(req, res, 302, stateData.redirectTarget, allowedOrigins);
}

async function handleGithubUser(req, res, { envFileCandidates, allowedOrigins }) {
  try {
    const verifiedUser = await verifyRequestUser(req, envFileCandidates);
    const token = await loadGithubToken(verifiedUser.uid, envFileCandidates);
    if (!token) {
      return sendGithubJson(req, res, 200, { connected: false }, allowedOrigins);
    }

    try {
      const profile = await githubFetchJson("/user", token.accessToken);
      return sendGithubJson(req, res, 200, {
        connected: true,
        profile,
        scope: token.scope || "",
        tokenType: token.tokenType || "bearer",
        expiresAt: token.expiresAt ?? null,
      }, allowedOrigins);
    } catch (error) {
      if (error?.status === 401) {
        await deleteGithubToken(verifiedUser.uid, envFileCandidates);
        return sendGithubJson(req, res, 200, {
          connected: false,
          reason: "token_revoked",
        }, allowedOrigins);
      }
      throw error;
    }
  } catch (error) {
    if (error?.code === "unauthorized") {
      return sendGithubJson(req, res, 200, { connected: false }, allowedOrigins);
    }
    throw error;
  }
}

async function handleGithubDisconnect(req, res, { envFileCandidates, allowedOrigins }) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  await deleteGithubToken(verifiedUser.uid, envFileCandidates);
  return sendGithubJson(req, res, 200, { success: true }, allowedOrigins);
}

async function handleGithubRepos(req, res, url, { envFileCandidates, allowedOrigins }) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const token = await loadGithubToken(verifiedUser.uid, envFileCandidates);
  if (!token) {
    return sendGithubJson(req, res, 404, {
      error: "GitHub not connected",
    }, allowedOrigins);
  }

  try {
    const perPage = Math.min(Math.max(Number(url.searchParams.get("per_page")) || 30, 1), 100);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const affiliation = (url.searchParams.get("affiliation") || "").trim();
    const visibility = (url.searchParams.get("visibility") || "").trim();
    const searchQuery = (url.searchParams.get("search") || "").trim().toLowerCase();
    const params = new URLSearchParams();
    params.set("per_page", String(perPage));
    params.set("page", String(page));
    if (affiliation) params.set("affiliation", affiliation);
    if (visibility) params.set("visibility", visibility);
    const repos = await githubFetchJson(`/user/repos?${params.toString()}`, token.accessToken);
    const filteredRepos = searchQuery
      ? repos.filter((repo) =>
          String(repo?.name || "").toLowerCase().includes(searchQuery)
          || String(repo?.full_name || "").toLowerCase().includes(searchQuery))
      : repos;

    return sendGithubJson(req, res, 200, {
      repos: filteredRepos,
      pagination: {
        page,
        perPage,
        count: filteredRepos.length,
      },
    }, allowedOrigins);
  } catch (error) {
    if (error?.status === 401) {
      await deleteGithubToken(verifiedUser.uid, envFileCandidates);
      return sendGithubJson(req, res, 401, {
        error: "GitHub token revoked",
      }, allowedOrigins);
    }
    throw error;
  }
}

async function handleGithubRepoDetail(req, res, url, normalizedPathname, { envFileCandidates, allowedOrigins }) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const token = await loadGithubToken(verifiedUser.uid, envFileCandidates);
  if (!token) {
    return sendGithubJson(req, res, 404, {
      error: "GitHub not connected",
    }, allowedOrigins);
  }

  const suffix = normalizedPathname.replace(/^\/api\/github\/repos\//, "");
  const parts = suffix.split("/").filter(Boolean);
  if (parts.length < 2) {
    return sendGithubJson(req, res, 400, {
      error: "Invalid GitHub repository route",
    }, allowedOrigins);
  }

  const owner = parts[0];
  const repo = parts[1];
  const action = parts[2] || "";

  try {
    if (!action) {
      const [repoData, readme] = await Promise.all([
        githubFetchJson(`/repos/${owner}/${repo}`, token.accessToken),
        getGithubReadme(token.accessToken, owner, repo),
      ]);
      return sendGithubJson(req, res, 200, {
        repo: repoData,
        readme,
      }, allowedOrigins);
    }

    if (action === "branches") {
      const branches = await githubFetchJson(`/repos/${owner}/${repo}/branches`, token.accessToken);
      return sendGithubJson(req, res, 200, { branches }, allowedOrigins);
    }

    if (action === "contents") {
      const contentPath = url.searchParams.get("path") || "";
      const ref = url.searchParams.get("ref") || "";
      const encodedPath = contentPath
        ? `/${encodeURIComponent(contentPath).replace(/%2F/g, "/")}`
        : "";
      const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
      const contents = await githubFetchJson(`/repos/${owner}/${repo}/contents${encodedPath}${query}`, token.accessToken);
      const normalizedContents = Array.isArray(contents) ? contents : [contents];
      normalizedContents.sort((a, b) => {
        if (a?.type === "dir" && b?.type !== "dir") return -1;
        if (a?.type !== "dir" && b?.type === "dir") return 1;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      });
      return sendGithubJson(req, res, 200, {
        contents: normalizedContents,
        path: contentPath,
        ref: ref || undefined,
      }, allowedOrigins);
    }

    if (action === "download") {
      const filePath = url.searchParams.get("path") || "";
      const ref = url.searchParams.get("ref") || "";
      if (!filePath) {
        return sendGithubJson(req, res, 400, {
          error: "path query parameter is required",
        }, allowedOrigins);
      }
      const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
      const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
      const fileContent = await githubFetchJson(`/repos/${owner}/${repo}/contents/${encodedPath}${query}`, token.accessToken);
      const mimeType = getMimeTypeForPath(filePath);
      return sendGithubJson(req, res, 200, {
        name: fileContent.name,
        path: fileContent.path,
        content: fileContent.content,
        encoding: fileContent.encoding,
        size: fileContent.size,
        sha: fileContent.sha,
        mimeType,
      }, allowedOrigins);
    }

    return sendGithubJson(req, res, 404, {
      error: "Unknown GitHub route",
    }, allowedOrigins);
  } catch (error) {
    if (error?.status === 401) {
      await deleteGithubToken(verifiedUser.uid, envFileCandidates);
      return sendGithubJson(req, res, 401, {
        error: "GitHub token revoked",
      }, allowedOrigins);
    }
    if (error?.status === 404) {
      return sendGithubJson(req, res, 404, {
        error: "Not found",
      }, allowedOrigins);
    }
    throw error;
  }
}

async function githubFetchJson(pathname, accessToken) {
  const response = await fetch(`${GITHUB_API_BASE}${pathname}`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "computer-agents-platform",
    },
    cache: "no-store",
  });
  const text = await response.text().catch(() => "");
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = text;
  }
  if (!response.ok) {
    const error = new Error(typeof parsed === "string" ? parsed : parsed?.message || response.statusText);
    error.status = response.status;
    throw error;
  }
  return parsed;
}

async function getGithubReadme(accessToken, owner, repo) {
  try {
    const response = await githubFetchJson(`/repos/${owner}/${repo}/readme`, accessToken);
    if (response?.encoding === "base64" && typeof response.content === "string") {
      return Buffer.from(response.content, "base64").toString("utf8");
    }
    return response?.content || null;
  } catch (error) {
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
}

function getMimeTypeForPath(filePath) {
  const extension = String(filePath || "").split(".").pop()?.toLowerCase() || "";
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    pdf: "application/pdf",
    js: "text/javascript",
    mjs: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    jsx: "text/javascript",
    json: "application/json",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    md: "text/markdown",
    txt: "text/plain",
    py: "text/x-python",
    rb: "text/x-ruby",
    go: "text/x-go",
    rs: "text/x-rust",
    java: "text/x-java",
    c: "text/x-c",
    cpp: "text/x-c++",
    h: "text/x-c",
    sh: "text/x-sh",
    yaml: "text/yaml",
    yml: "text/yaml",
    xml: "application/xml",
  };
  return mimeTypes[extension] || "application/octet-stream";
}

function sanitizeOAuthRedirectTarget(redirectTo, origin) {
  if (!redirectTo) return origin;
  try {
    const url = new URL(redirectTo, origin);
    const originUrl = new URL(origin);
    const isSameOrigin = url.origin === originUrl.origin;
    const isTrustedComputerAgentsRedirect =
      url.protocol === "https:"
      && originUrl.protocol === "https:"
      && isTrustedComputerAgentsHost(url.hostname)
      && isTrustedComputerAgentsHost(originUrl.hostname);
    const isLocalDevRedirect =
      isLocalDevelopmentHost(url.hostname)
      && (isLocalDevelopmentHost(originUrl.hostname) || isTrustedComputerAgentsHost(originUrl.hostname));
    const isNativeAppRedirect =
      url.protocol === "computeragents:"
      && (url.hostname === "oauth" || url.hostname === "oauth-callback");

    if (!isSameOrigin && !isTrustedComputerAgentsRedirect && !isLocalDevRedirect && !isNativeAppRedirect) {
      return origin;
    }

    return url.toString();
  } catch {
    return origin;
  }
}

function isTrustedComputerAgentsHost(hostname) {
  return hostname === "computer-agents.com" || hostname.endsWith(".computer-agents.com");
}

function isLocalDevelopmentHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
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
  await firestorePatchDocument(`${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`, {
    state: { stringValue: state },
    redirectTarget: { stringValue: data.redirectTarget },
    provider: { stringValue: data.provider },
    uid: { stringValue: data.uid },
    createdAt: { integerValue: String(now) },
    expiresAt: { integerValue: String(now + 600_000) },
  }, [], envFileCandidates);
}

async function getOAuthState(state, provider, envFileCandidates) {
  const document = await firestoreGetDocument(`${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`, envFileCandidates);
  if (!document) {
    return null;
  }
  const fields = document?.fields || {};
  const storedProvider = getFirestoreString(fields?.provider);
  const expiresAt = getFirestoreInteger(fields?.expiresAt);
  if (storedProvider !== provider || !expiresAt || Date.now() > expiresAt) {
    await firestoreDeleteDocument(`${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`, envFileCandidates).catch(() => {});
    return null;
  }
  await firestoreDeleteDocument(`${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`, envFileCandidates).catch(() => {});
  return {
    uid: getFirestoreString(fields?.uid) || "",
    redirectTarget: getFirestoreString(fields?.redirectTarget) || "",
  };
}

async function saveGithubToken(uid, payload, envFileCandidates) {
  const expiresAt = payload.expiresIn && payload.expiresIn > 0
    ? (payload.obtainedAt ?? Date.now()) + (payload.expiresIn * 1000)
    : undefined;
  const encryptedToken = await encryptToken(JSON.stringify({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType || "bearer",
    scope: payload.scope || "",
    expiresAt,
    updatedAt: payload.obtainedAt ?? Date.now(),
  }), envFileCandidates);
  await firestorePatchDocument(`${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`, {
    github: {
      mapValue: {
        fields: {
          encryptedToken: { stringValue: encryptedToken },
          updatedAt: { integerValue: String(Date.now()) },
        },
      },
    },
  }, ["github"], envFileCandidates);
}

async function loadGithubToken(uid, envFileCandidates) {
  const document = await firestoreGetDocument(`${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`, envFileCandidates);
  const encryptedToken = getFirestoreString(document?.fields?.github?.mapValue?.fields?.encryptedToken);
  if (!encryptedToken) {
    return null;
  }
  try {
    return JSON.parse(await decryptToken(encryptedToken, envFileCandidates));
  } catch {
    return null;
  }
}

async function deleteGithubToken(uid, envFileCandidates) {
  await firestorePatchDocument(`${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`, {
    github: { nullValue: null },
  }, ["github"], envFileCandidates);
}

async function firestoreGetDocument(documentPath, envFileCandidates) {
  const { projectId, accessToken } = await getFirestoreAccessContext(envFileCandidates);
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Firestore GET failed (${response.status})`);
  }
  return response.json();
}

async function firestoreDeleteDocument(documentPath, envFileCandidates) {
  const { projectId, accessToken } = await getFirestoreAccessContext(envFileCandidates);
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Firestore DELETE failed (${response.status})`);
  }
}

async function firestorePatchDocument(documentPath, fields, updateFieldPaths, envFileCandidates) {
  const { projectId, accessToken } = await getFirestoreAccessContext(envFileCandidates);
  const target = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`
  );
  updateFieldPaths.forEach((fieldPath) => {
    target.searchParams.append("updateMask.fieldPaths", fieldPath);
  });
  const response = await fetch(target.toString(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Firestore PATCH failed (${response.status})`);
  }
}

async function getFirestoreAccessContext(envFileCandidates) {
  const serviceAccount = await getServiceAccountConfig(envFileCandidates);
  const projectId = serviceAccount?.projectId
    || await getRuntimeEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID", envFileCandidates)
    || "testbaseai";
  const accessToken = serviceAccount
    ? await getServiceAccountAccessToken(serviceAccount)
    : await getMetadataAccessToken();
  if (!accessToken) {
    throw new Error("Unable to acquire Firestore access token");
  }
  return { projectId, accessToken };
}

async function getServiceAccountAccessToken(serviceAccount) {
  const now = Date.now();
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt - 60_000 > now) {
    return cachedGoogleAccessToken.accessToken;
  }

  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + 3600;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: expiresAt,
    iat: issuedAt,
  })).toString("base64url");
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(serviceAccount.privateKey).toString("base64url");
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const payloadJson = await response.json().catch(() => ({}));
  if (!response.ok || !payloadJson?.access_token) {
    throw new Error(payloadJson?.error_description || payloadJson?.error || "Failed to obtain Google access token");
  }

  cachedGoogleAccessToken = {
    accessToken: payloadJson.access_token,
    expiresAt: now + Math.max((payloadJson.expires_in || 3600) * 1000, 60_000),
  };
  return payloadJson.access_token;
}

async function getMetadataAccessToken() {
  const now = Date.now();
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt - 60_000 > now) {
    return cachedGoogleAccessToken.accessToken;
  }

  const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
    method: "GET",
    headers: {
      "Metadata-Flavor": "Google",
    },
  }).catch(() => null);
  const payload = response ? await response.json().catch(() => ({})) : {};
  if (!response?.ok || !payload?.access_token) {
    return "";
  }
  cachedGoogleAccessToken = {
    accessToken: payload.access_token,
    expiresAt: now + Math.max((payload.expires_in || 3600) * 1000, 60_000),
  };
  return payload.access_token;
}

async function getServiceAccountConfig(envFileCandidates) {
  const raw = await getRuntimeEnvValue("FB_SERVICE_ACCOUNT_KEY", envFileCandidates);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const privateKey = typeof parsed.private_key === "string"
      ? parsed.private_key.replace(/\\n/g, "\n")
      : "";
    if (!parsed.client_email || !privateKey) {
      return null;
    }
    createPrivateKey(privateKey);
    return {
      clientEmail: parsed.client_email,
      privateKey,
      projectId: parsed.project_id || await getRuntimeEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID", envFileCandidates) || "testbaseai",
    };
  } catch {
    return null;
  }
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
  const key = await getRuntimeEnvValue("GITHUB_TOKEN_ENCRYPTION_KEY", envFileCandidates);
  if (!key) {
    throw new Error("Missing GITHUB_TOKEN_ENCRYPTION_KEY");
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
  throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be 32 bytes");
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
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-API-Key",
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
