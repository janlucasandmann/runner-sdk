import {
  createCipheriv,
  createDecipheriv,
  createPrivateKey,
  createSign,
  randomBytes,
} from "node:crypto";
import fs from "node:fs";

const FIRESTORE_TOKEN_COLLECTION = "user_oauth_tokens";
const OAUTH_STATE_COLLECTION = "oauth_states";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_IV_LENGTH = 12;
const ENCRYPTION_TAG_LENGTH = 16;

let cachedGoogleAccessToken = null;
const cachedEnvironmentMaps = new Map();

export function normalizeConnectorCredentialId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,120}$/.test(normalized) ? normalized : "";
}

export function createConnectorCredentialId(provider) {
  const prefix = String(provider || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "connector";
  return `${prefix}_${randomBytes(12).toString("base64url")}`;
}

export function normalizeConnectorCredentialName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

export function normalizeConnectorOrganizationId(value) {
  return String(value || "").trim().slice(0, 200);
}

export function normalizeConnectorOAuthError(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

export function sanitizeConnectorRedirectTarget(redirectTo, origin) {
  if (!redirectTo) return origin;
  try {
    const url = new URL(redirectTo, origin);
    const originUrl = new URL(origin);
    const isSameOrigin = url.origin === originUrl.origin;
    const isComputerAgentsRedirect =
      url.protocol === "https:"
      && originUrl.protocol === "https:"
      && isTrustedComputerAgentsHost(url.hostname)
      && isTrustedComputerAgentsHost(originUrl.hostname);
    const isLocalRedirect =
      isLocalDevelopmentHost(url.hostname)
      && (
        isLocalDevelopmentHost(originUrl.hostname)
        || isTrustedComputerAgentsHost(originUrl.hostname)
      );
    const isNativeRedirect =
      url.protocol === "computeragents:"
      && (url.hostname === "oauth" || url.hostname === "oauth-callback");
    return isSameOrigin || isComputerAgentsRedirect || isLocalRedirect || isNativeRedirect
      ? url.toString()
      : origin;
  } catch {
    return origin;
  }
}

export function appendConnectorOAuthResult(
  redirectTarget,
  { result, error = "" },
) {
  try {
    const url = new URL(String(redirectTarget || ""));
    if (url.searchParams.get("connectorAuthReturn") !== "1") {
      return url.toString();
    }
    url.searchParams.set(
      "connectorAuthResult",
      result === "success" ? "success" : "error",
    );
    const normalizedError = normalizeConnectorOAuthError(error);
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

export async function verifyConnectorRequestUser(req, envFileCandidates) {
  const idToken = extractIdToken(req);
  if (!idToken) {
    throwUnauthorized("Missing ID token");
  }
  const firebaseApiKey =
    await getConnectorRuntimeEnvValue("FIREBASE_WEB_API_KEY", envFileCandidates)
    || await getConnectorRuntimeEnvValue(
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      envFileCandidates,
    );
  if (!firebaseApiKey) {
    throw new Error("Firebase API key not configured");
  }
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  const user = Array.isArray(payload?.users) ? payload.users[0] : null;
  if (!response.ok || !user?.localId) {
    throwUnauthorized("Unauthorized");
  }
  return {
    uid: user.localId,
    email: user.email || "",
    idToken,
  };
}

export async function saveConnectorOAuthState(
  state,
  data,
  envFileCandidates,
) {
  const now = Date.now();
  await firestorePatchDocument(
    `${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`,
    {
      state: { stringValue: state },
      redirectTarget: { stringValue: data.redirectTarget || "" },
      provider: { stringValue: data.provider || "" },
      uid: { stringValue: data.uid || "" },
      callbackTarget: { stringValue: data.callbackTarget || "" },
      credentialId: { stringValue: data.credentialId || "" },
      credentialName: { stringValue: data.credentialName || "" },
      organizationId: { stringValue: data.organizationId || "" },
      metadataJson: {
        stringValue: JSON.stringify(data.metadata || {}),
      },
      createdAt: { integerValue: String(now) },
      expiresAt: { integerValue: String(now + 600_000) },
    },
    [],
    envFileCandidates,
  );
}

export async function consumeConnectorOAuthState(
  state,
  provider,
  envFileCandidates,
) {
  const path = `${OAUTH_STATE_COLLECTION}/${encodeURIComponent(state)}`;
  const document = await firestoreGetDocument(path, envFileCandidates);
  if (!document) return null;
  const fields = document?.fields || {};
  const storedProvider = getFirestoreString(fields.provider);
  const expiresAt = getFirestoreInteger(fields.expiresAt);
  if (storedProvider !== provider || !expiresAt || Date.now() > expiresAt) {
    await firestoreDeleteDocument(path, envFileCandidates).catch(() => {});
    return null;
  }
  await firestoreDeleteDocument(path, envFileCandidates).catch(() => {});
  let metadata = {};
  try {
    metadata = JSON.parse(getFirestoreString(fields.metadataJson) || "{}");
  } catch {
    metadata = {};
  }
  return {
    uid: getFirestoreString(fields.uid) || "",
    redirectTarget: getFirestoreString(fields.redirectTarget) || "",
    credentialId: normalizeConnectorCredentialId(
      getFirestoreString(fields.credentialId),
    ),
    credentialName: normalizeConnectorCredentialName(
      getFirestoreString(fields.credentialName),
    ),
    organizationId: normalizeConnectorOrganizationId(
      getFirestoreString(fields.organizationId),
    ),
    metadata:
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? metadata
        : {},
  };
}

export async function readConnectorCredentialStore(
  provider,
  uid,
  envFileCandidates,
) {
  const document = await firestoreGetDocument(
    `${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`,
    envFileCandidates,
  );
  const fields = document?.fields || {};
  const fieldPrefix = getConnectorFieldPrefix(provider);
  let parsed = {};
  try {
    parsed = JSON.parse(
      getFirestoreString(fields[`${fieldPrefix}CredentialsJson`]) || "{}",
    );
  } catch {
    parsed = {};
  }
  const rawCredentials =
    parsed?.credentials
    && typeof parsed.credentials === "object"
    && !Array.isArray(parsed.credentials)
      ? parsed.credentials
      : {};
  const credentials = Object.values(rawCredentials).reduce((result, value) => {
    const credential = normalizeStoredCredential(provider, value);
    if (credential) result[credential.id] = credential;
    return result;
  }, {});
  let defaultCredentialId = normalizeConnectorCredentialId(
    getFirestoreString(fields[`${fieldPrefix}DefaultCredentialId`])
      || parsed?.defaultCredentialId,
  );
  if (!credentials[defaultCredentialId]) {
    defaultCredentialId = Object.keys(credentials)[0] || "";
  }
  return { credentials, defaultCredentialId };
}

export async function writeConnectorCredentialStore(
  provider,
  uid,
  store,
  envFileCandidates,
) {
  const fieldPrefix = getConnectorFieldPrefix(provider);
  const credentialIds = Object.keys(store.credentials || {});
  const defaultCredentialId = store.credentials?.[store.defaultCredentialId]
    ? store.defaultCredentialId
    : credentialIds[0] || "";
  const credentialsField = `${fieldPrefix}CredentialsJson`;
  const defaultField = `${fieldPrefix}DefaultCredentialId`;
  await firestorePatchDocument(
    `${FIRESTORE_TOKEN_COLLECTION}/${encodeURIComponent(uid)}`,
    {
      [credentialsField]: {
        stringValue: JSON.stringify({
          version: 1,
          defaultCredentialId,
          credentials: store.credentials || {},
        }),
      },
      [defaultField]: { stringValue: defaultCredentialId },
    },
    [credentialsField, defaultField],
    envFileCandidates,
  );
  return {
    credentials: store.credentials || {},
    defaultCredentialId,
  };
}

export function listPublicConnectorCredentials(store, method = "OAuth 2.0") {
  return Object.values(store?.credentials || {})
    .sort((left, right) => {
      if (left.id === store.defaultCredentialId) return -1;
      if (right.id === store.defaultCredentialId) return 1;
      return left.createdAt - right.createdAt;
    })
    .map((credential) => ({
      id: credential.id,
      name: credential.name,
      identity: credential.identity || "",
      method,
      status: credential.status || "valid",
      isDefault: credential.id === store.defaultCredentialId,
      createdAt: new Date(credential.createdAt).toISOString(),
      updatedAt: new Date(credential.updatedAt).toISOString(),
      lastCheckedAt: credential.lastCheckedAt
        ? new Date(credential.lastCheckedAt).toISOString()
        : undefined,
    }));
}

export async function saveConnectorCredential({
  provider,
  uid,
  credentialId,
  credentialName,
  organizationId,
  identity,
  profile,
  token,
  envFileCandidates,
  encryptionKeyNames = [],
}) {
  const now = Date.now();
  const encryptedToken = await encryptConnectorToken(
    JSON.stringify(token || {}),
    envFileCandidates,
    encryptionKeyNames,
  );
  const store = await readConnectorCredentialStore(
    provider,
    uid,
    envFileCandidates,
  );
  const normalizedCredentialId =
    normalizeConnectorCredentialId(credentialId)
    || createConnectorCredentialId(provider);
  const existing = store.credentials[normalizedCredentialId];
  store.credentials[normalizedCredentialId] = {
    id: normalizedCredentialId,
    name:
      normalizeConnectorCredentialName(credentialName)
      || existing?.name
      || String(identity || "").trim()
      || `${provider} account`,
    identity: String(identity || existing?.identity || "").trim().slice(0, 240),
    organizationId:
      normalizeConnectorOrganizationId(organizationId)
      || existing?.organizationId
      || "",
    encryptedToken,
    profile: normalizeJsonRecord(profile),
    status: "valid",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastCheckedAt: now,
  };
  if (!store.defaultCredentialId) {
    store.defaultCredentialId = normalizedCredentialId;
  }
  return writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
}

export async function loadConnectorCredential({
  provider,
  uid,
  credentialId = "",
  envFileCandidates,
  encryptionKeyNames = [],
}) {
  const store = await readConnectorCredentialStore(
    provider,
    uid,
    envFileCandidates,
  );
  const normalizedCredentialId = normalizeConnectorCredentialId(credentialId);
  const selectedId =
    (normalizedCredentialId && store.credentials[normalizedCredentialId]
      ? normalizedCredentialId
      : store.defaultCredentialId)
    || Object.keys(store.credentials)[0]
    || "";
  const credential = store.credentials[selectedId];
  if (!credential) return null;
  const decrypted = await decryptConnectorToken(
    credential.encryptedToken,
    envFileCandidates,
    encryptionKeyNames,
  );
  let token = {};
  try {
    token = JSON.parse(decrypted);
  } catch {
    token = {};
  }
  return { ...credential, token, credentialId: selectedId, store };
}

export async function updateConnectorCredentialMetadata({
  provider,
  uid,
  credentialId,
  metadata,
  envFileCandidates,
}) {
  const store = await readConnectorCredentialStore(
    provider,
    uid,
    envFileCandidates,
  );
  const normalizedCredentialId = normalizeConnectorCredentialId(credentialId);
  const current = store.credentials[normalizedCredentialId];
  if (!current) return store;
  store.credentials[normalizedCredentialId] = {
    ...current,
    ...metadata,
    profile: metadata?.profile
      ? normalizeJsonRecord(metadata.profile)
      : current.profile,
    updatedAt: Date.now(),
  };
  return writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
}

export async function deleteConnectorCredential({
  provider,
  uid,
  credentialId = "",
  envFileCandidates,
}) {
  const store = await readConnectorCredentialStore(
    provider,
    uid,
    envFileCandidates,
  );
  const normalizedCredentialId = normalizeConnectorCredentialId(credentialId);
  if (normalizedCredentialId) {
    delete store.credentials[normalizedCredentialId];
  } else {
    store.credentials = {};
  }
  if (!store.credentials[store.defaultCredentialId]) {
    store.defaultCredentialId = Object.keys(store.credentials)[0] || "";
  }
  return writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
}

export function getConnectorRequestSearchParam(req, key) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  return requestUrl.searchParams.get(key) || "";
}

export async function readConnectorRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

export function sendConnectorCorsPreflight(req, res, allowedOrigins) {
  res.writeHead(204, buildCorsHeaders(req, allowedOrigins));
  res.end();
  return true;
}

export function sendConnectorJson(
  req,
  res,
  status,
  payload,
  allowedOrigins,
) {
  res.writeHead(status, {
    ...buildCorsHeaders(req, allowedOrigins),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
  return true;
}

export function sendConnectorRedirect(
  req,
  res,
  status,
  location,
  allowedOrigins,
) {
  res.writeHead(status, {
    ...buildCorsHeaders(req, allowedOrigins),
    Location: location,
    "Cache-Control": "no-store",
  });
  res.end();
  return true;
}

export async function getConnectorRuntimeEnvValue(key, envFileCandidates) {
  const direct =
    typeof process.env[key] === "string" ? process.env[key].trim() : "";
  if (direct) return direct;
  const candidates = Array.isArray(envFileCandidates) ? envFileCandidates : [];
  const cacheKey = candidates.join("\n");
  if (!cachedEnvironmentMaps.has(cacheKey)) {
    const values = new Map();
    candidates.forEach((candidatePath) => {
      try {
        if (!candidatePath || !fs.existsSync(candidatePath)) return;
        const text = fs.readFileSync(candidatePath, "utf8");
        text.split(/\r?\n/).forEach((line) => {
          if (!line || line.trim().startsWith("#") || !line.includes("=")) return;
          const separator = line.indexOf("=");
          const name = line.slice(0, separator).trim();
          let value = line.slice(separator + 1).trim();
          if (
            (value.startsWith("\"") && value.endsWith("\""))
            || (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          if (!values.has(name) && value) values.set(name, value);
        });
      } catch {}
    });
    cachedEnvironmentMaps.set(cacheKey, values);
  }
  return cachedEnvironmentMaps.get(cacheKey)?.get(key) || "";
}

function normalizeStoredCredential(provider, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = normalizeConnectorCredentialId(value.id);
  const encryptedToken = String(value.encryptedToken || "").trim();
  if (!id || !encryptedToken) return null;
  const createdAt = Math.max(0, Number(value.createdAt || 0)) || Date.now();
  return {
    id,
    name:
      normalizeConnectorCredentialName(value.name)
      || `${String(provider || "Connector")} account`,
    identity: String(value.identity || "").trim().slice(0, 240),
    organizationId: normalizeConnectorOrganizationId(value.organizationId),
    encryptedToken,
    profile: normalizeJsonRecord(value.profile),
    status: value.status === "invalid" ? "invalid" : "valid",
    createdAt,
    updatedAt: Math.max(createdAt, Number(value.updatedAt || 0)) || createdAt,
    lastCheckedAt: Math.max(0, Number(value.lastCheckedAt || 0)),
  };
}

function normalizeJsonRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {};
  }
}

function getConnectorFieldPrefix(provider) {
  const normalized = String(provider || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/[^a-z0-9]/g, "");
  if (!normalized) throw new TypeError("A connector provider is required.");
  return normalized;
}

function isTrustedComputerAgentsHost(hostname) {
  return (
    hostname === "computer-agents.com"
    || hostname.endsWith(".computer-agents.com")
  );
}

function isLocalDevelopmentHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function throwUnauthorized(message) {
  const error = new Error(message);
  error.code = "unauthorized";
  throw error;
}

function extractIdToken(req) {
  const authorization = String(req.headers.authorization || "");
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  const cookies = String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((result, entry) => {
      const separator = entry.indexOf("=");
      if (separator === -1) return result;
      const key = entry.slice(0, separator).trim();
      const rawValue = entry.slice(separator + 1).trim();
      try {
        result[key] = decodeURIComponent(rawValue);
      } catch {
        result[key] = rawValue;
      }
      return result;
    }, {});
  return cookies.__session || cookies.tb_id_token || "";
}

async function encryptConnectorToken(
  value,
  envFileCandidates,
  encryptionKeyNames,
) {
  const key = await getEncryptionKey(envFileCandidates, encryptionKeyNames);
  const iv = randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}

async function decryptConnectorToken(
  value,
  envFileCandidates,
  encryptionKeyNames,
) {
  const key = await getEncryptionKey(envFileCandidates, encryptionKeyNames);
  const buffer = Buffer.from(value, "base64");
  const iv = buffer.subarray(0, ENCRYPTION_IV_LENGTH);
  const tag = buffer.subarray(
    ENCRYPTION_IV_LENGTH,
    ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH,
  );
  const encrypted = buffer.subarray(
    ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH,
  );
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}

async function getEncryptionKey(envFileCandidates, encryptionKeyNames) {
  const keyNames = [
    ...new Set([
      ...(Array.isArray(encryptionKeyNames) ? encryptionKeyNames : []),
      "CONNECTOR_TOKEN_ENCRYPTION_KEY",
      "GITHUB_TOKEN_ENCRYPTION_KEY",
    ]),
  ];
  let value = "";
  for (const keyName of keyNames) {
    value = await getConnectorRuntimeEnvValue(keyName, envFileCandidates);
    if (value) break;
  }
  if (!value) {
    throw new Error(`Missing ${keyNames[0] || "connector encryption key"}`);
  }
  try {
    const decoded = Buffer.from(value, "base64");
    if (decoded.length === 32) return decoded;
  } catch {}
  if (value.length === 32) return Buffer.from(value, "utf8");
  throw new Error("Connector token encryption key must be 32 bytes");
}

async function firestoreGetDocument(documentPath, envFileCandidates) {
  const { projectId, accessToken } = await getFirestoreAccessContext(
    envFileCandidates,
  );
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Firestore GET failed (${response.status})`);
  }
  return response.json();
}

async function firestoreDeleteDocument(documentPath, envFileCandidates) {
  const { projectId, accessToken } = await getFirestoreAccessContext(
    envFileCandidates,
  );
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok && response.status !== 404) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Firestore DELETE failed (${response.status})`);
  }
}

async function firestorePatchDocument(
  documentPath,
  fields,
  updateFieldPaths,
  envFileCandidates,
) {
  const { projectId, accessToken } = await getFirestoreAccessContext(
    envFileCandidates,
  );
  const target = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`,
  );
  updateFieldPaths.forEach((fieldPath) => {
    target.searchParams.append("updateMask.fieldPaths", fieldPath);
  });
  const response = await fetch(target, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Firestore PATCH failed (${response.status})`);
  }
}

async function getFirestoreAccessContext(envFileCandidates) {
  const serviceAccount = await getServiceAccountConfig(envFileCandidates);
  const projectId =
    serviceAccount?.projectId
    || await getConnectorRuntimeEnvValue(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      envFileCandidates,
    )
    || "testbaseai";
  const accessToken = serviceAccount
    ? await getServiceAccountAccessToken(serviceAccount)
    : await getMetadataAccessToken();
  if (!accessToken) throw new Error("Unable to acquire Firestore access token");
  return { projectId, accessToken };
}

async function getServiceAccountAccessToken(serviceAccount) {
  const now = Date.now();
  if (cachedGoogleAccessToken?.expiresAt - 60_000 > now) {
    return cachedGoogleAccessToken.accessToken;
  }
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + 3600;
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: serviceAccount.clientEmail,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      exp: expiresAt,
      iat: issuedAt,
    }),
  ).toString("base64url");
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion =
    `${unsignedToken}.${signer.sign(serviceAccount.privateKey).toString("base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const payloadJson = await response.json().catch(() => ({}));
  if (!response.ok || !payloadJson?.access_token) {
    throw new Error(
      payloadJson?.error_description
      || payloadJson?.error
      || "Failed to obtain Google access token",
    );
  }
  cachedGoogleAccessToken = {
    accessToken: payloadJson.access_token,
    expiresAt: now + Math.max((payloadJson.expires_in || 3600) * 1000, 60_000),
  };
  return payloadJson.access_token;
}

async function getMetadataAccessToken() {
  const now = Date.now();
  if (cachedGoogleAccessToken?.expiresAt - 60_000 > now) {
    return cachedGoogleAccessToken.accessToken;
  }
  const response = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    {
      method: "GET",
      headers: { "Metadata-Flavor": "Google" },
    },
  ).catch(() => null);
  const payload = response ? await response.json().catch(() => ({})) : {};
  if (!response?.ok || !payload?.access_token) return "";
  cachedGoogleAccessToken = {
    accessToken: payload.access_token,
    expiresAt: now + Math.max((payload.expires_in || 3600) * 1000, 60_000),
  };
  return payload.access_token;
}

async function getServiceAccountConfig(envFileCandidates) {
  const raw = await getConnectorRuntimeEnvValue(
    "FB_SERVICE_ACCOUNT_KEY",
    envFileCandidates,
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const privateKey =
      typeof parsed.private_key === "string"
        ? parsed.private_key.replace(/\\n/g, "\n")
        : "";
    if (!parsed.client_email || !privateKey) return null;
    createPrivateKey(privateKey);
    return {
      clientEmail: parsed.client_email,
      privateKey,
      projectId:
        parsed.project_id
        || await getConnectorRuntimeEnvValue(
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
          envFileCandidates,
        )
        || "testbaseai",
    };
  } catch {
    return null;
  }
}

function buildCorsHeaders(req, allowedOrigins) {
  const requestOrigin = String(req.headers.origin || "").trim();
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
  }
  return headers;
}

function getFirestoreString(value) {
  return value && typeof value === "object" && typeof value.stringValue === "string"
    ? value.stringValue
    : null;
}

function getFirestoreInteger(value) {
  if (!value || typeof value !== "object") return null;
  if (
    typeof value.integerValue === "string"
    || typeof value.integerValue === "number"
  ) {
    const parsed = Number(value.integerValue);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
