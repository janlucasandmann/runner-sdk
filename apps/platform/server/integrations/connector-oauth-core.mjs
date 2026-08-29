import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import fs from "node:fs";

import { createGcpConnectorOAuthAdapter } from "../../../../src/adapters/gcp/connector-oauth-gcp-adapter.mjs";
import {
  createApplianceConnectorDocumentStore,
} from "./appliance-connector-document-store.mjs";
import { createConnectorCredentialRegistry } from "./connector-credential-registry.mjs";
import { createConnectorSettingsStore } from "./connector-settings-store.mjs";

const FIRESTORE_TOKEN_COLLECTION = "user_oauth_tokens";
const OAUTH_STATE_COLLECTION = "oauth_states";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_IV_LENGTH = 12;
const ENCRYPTION_TAG_LENGTH = 16;

const cachedEnvironmentMaps = new Map();
const gcpConnectorOAuthAdapter = createGcpConnectorOAuthAdapter({
  readEnvironmentValue: getConnectorRuntimeEnvValue,
});

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
  const user = await gcpConnectorOAuthAdapter.verifyFirebaseUser(
    idToken,
    firebaseApiKey,
  );
  if (!user) {
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
  const document = await connectorStorageConsumeDocument(
    path,
    envFileCandidates,
  );
  if (!document) return null;
  const fields = document?.fields || {};
  const storedProvider = getFirestoreString(fields.provider);
  const expiresAt = getFirestoreInteger(fields.expiresAt);
  if (storedProvider !== provider || !expiresAt || Date.now() > expiresAt) {
    return null;
  }
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
  makeDefault = false,
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
  if (makeDefault || !store.defaultCredentialId) {
    store.defaultCredentialId = normalizedCredentialId;
  }
  const writtenStore = await writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
  const nextCredential = writtenStore.credentials[normalizedCredentialId];
  if (
    existing?.organizationId
    && existing.organizationId !== nextCredential.organizationId
  ) {
    await unregisterOrganizationConnectorCredential({
      organizationId: existing.organizationId,
      provider,
      credentialId: normalizedCredentialId,
      envFileCandidates,
    });
  }
  if (nextCredential.organizationId) {
    await registerOrganizationConnectorCredential({
      organizationId: nextCredential.organizationId,
      provider,
      credential: nextCredential,
      ownerUserId: uid,
      makeDefault,
      envFileCandidates,
    });
  }
  return writtenStore;
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
  if (credentialId && !normalizedCredentialId) return null;
  if (normalizedCredentialId && !store.credentials[normalizedCredentialId]) {
    return null;
  }
  const candidateIds = listConnectorCredentialLoadCandidateIds(
    store,
    normalizedCredentialId,
  );
  let firstDecryptionError = null;
  for (const selectedId of candidateIds) {
    const credential = store.credentials[selectedId];
    if (!credential) continue;
    let decrypted = "";
    try {
      decrypted = await decryptConnectorToken(
        credential.encryptedToken,
        envFileCandidates,
        encryptionKeyNames,
      );
    } catch (error) {
      if (normalizedCredentialId) throw error;
      firstDecryptionError ||= error;
      continue;
    }
    let token = {};
    try {
      token = JSON.parse(decrypted);
    } catch {
      token = {};
    }
    if (!normalizedCredentialId && selectedId !== store.defaultCredentialId) {
      store.defaultCredentialId = selectedId;
      await writeConnectorCredentialStore(
        provider,
        uid,
        store,
        envFileCandidates,
      );
    }
    return { ...credential, token, credentialId: selectedId, store };
  }
  if (firstDecryptionError) throw firstDecryptionError;
  return null;
}

export function listConnectorCredentialLoadCandidateIds(
  store,
  credentialId = "",
) {
  const normalizedCredentialId = normalizeConnectorCredentialId(credentialId);
  if (normalizedCredentialId) return [normalizedCredentialId];
  const credentials = Object.values(store?.credentials || {})
    .sort((left, right) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))
    .map((credential) => normalizeConnectorCredentialId(credential?.id))
    .filter(Boolean);
  return [...new Set([
    normalizeConnectorCredentialId(store?.defaultCredentialId),
    ...credentials,
  ].filter(Boolean))];
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
  const writtenStore = await writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
  const nextCredential = writtenStore.credentials[normalizedCredentialId];
  if (
    current.organizationId
    && current.organizationId !== nextCredential.organizationId
  ) {
    await unregisterOrganizationConnectorCredential({
      organizationId: current.organizationId,
      provider,
      credentialId: normalizedCredentialId,
      envFileCandidates,
    });
  }
  if (nextCredential.organizationId) {
    await registerOrganizationConnectorCredential({
      organizationId: nextCredential.organizationId,
      provider,
      credential: nextCredential,
      ownerUserId: uid,
      envFileCandidates,
    });
  }
  return writtenStore;
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
  const writtenStore = await writeConnectorCredentialStore(
    provider,
    uid,
    store,
    envFileCandidates,
  );
  for (const removedCredential of removedCredentials) {
    if (!removedCredential.organizationId) continue;
    await unregisterOrganizationConnectorCredential({
      organizationId: removedCredential.organizationId,
      provider,
      credentialId: removedCredential.id,
      envFileCandidates,
    });
  }
  return writtenStore;
}

export async function registerOrganizationConnectorCredential({
  organizationId,
  provider,
  credential,
  ownerUserId,
  makeDefault = false,
  envFileCandidates,
}) {
  const normalizedCredentialId = normalizeConnectorCredentialId(
    credential?.id || credential?.credentialId,
  );
  if (
    !normalizeConnectorOrganizationId(organizationId)
    || !normalizedCredentialId
    || !String(ownerUserId || "").trim()
  ) {
    return null;
  }
  return getOrganizationCredentialRegistry(envFileCandidates).register({
    organizationId,
    provider,
    credentialId: normalizedCredentialId,
    ownerUserId,
    name: credential?.name,
    identity: credential?.identity,
    status: credential?.status,
    makeDefault,
    createdAt: credential?.createdAt,
    updatedAt: credential?.updatedAt,
  });
}

export async function unregisterOrganizationConnectorCredential({
  organizationId,
  provider,
  credentialId,
  envFileCandidates,
}) {
  return getOrganizationCredentialRegistry(envFileCandidates).unregister({
    organizationId,
    provider,
    credentialId,
  });
}

export async function listOrganizationConnectorCredentials({
  organizationId,
  provider,
  envFileCandidates,
}) {
  const normalizedOrganizationId =
    normalizeConnectorOrganizationId(organizationId);
  const normalizedProvider = normalizeConnectorProviderId(provider);
  if (!normalizedOrganizationId || !normalizedProvider) return [];

  const references = await getOrganizationCredentialRegistry(
    envFileCandidates,
  ).list({
    organizationId: normalizedOrganizationId,
    provider: normalizedProvider,
  });
  return references.map((reference) => ({
    id: reference.credentialId,
    credentialId: reference.credentialId,
    provider: reference.provider,
    name: reference.name,
    identity: reference.identity,
    status: reference.status,
    isDefault: reference.isDefault === true,
    createdAt: new Date(reference.createdAt).toISOString(),
    updatedAt: new Date(reference.updatedAt).toISOString(),
  }));
}

export async function listOrganizationConnectorCredentialProviders({
  organizationId,
  envFileCandidates,
}) {
  const normalizedOrganizationId =
    normalizeConnectorOrganizationId(organizationId);
  if (!normalizedOrganizationId) return [];

  const registry = getOrganizationCredentialRegistry(envFileCandidates);
  const providers = await registry.listProviders({
    organizationId: normalizedOrganizationId,
  });
  const catalogs = await Promise.all(
    providers.map(async ({ provider }) => ({
      provider,
      credentials: await listOrganizationConnectorCredentials({
        organizationId: normalizedOrganizationId,
        provider,
        envFileCandidates,
      }),
    })),
  );
  return catalogs.filter((catalog) => catalog.credentials.length > 0);
}

export async function resolveConnectorCredentialForOrganization({
  provider,
  organizationId,
  credentialId = "",
  requestingUserId = "",
  envFileCandidates,
  encryptionKeyNames = [],
}) {
  const normalizedOrganizationId =
    normalizeConnectorOrganizationId(organizationId);
  const normalizedCredentialId =
    normalizeConnectorCredentialId(credentialId);
  const normalizedRequestingUserId = String(requestingUserId || "").trim();
  if (
    !normalizedOrganizationId
    || (credentialId && !normalizedCredentialId)
  ) {
    return null;
  }

  const registry = getOrganizationCredentialRegistry(envFileCandidates);
  const defaultReference = await registry.resolve({
    organizationId: normalizedOrganizationId,
    provider,
    credentialId: normalizedCredentialId,
  });
  const references = [];
  const referenceKeys = new Set();
  const addReference = (reference) => {
    const ownerUserId = String(reference?.ownerUserId || "").trim();
    const candidateCredentialId = normalizeConnectorCredentialId(
      reference?.credentialId || reference?.id,
    );
    const candidateOrganizationId = normalizeConnectorOrganizationId(
      reference?.organizationId,
    );
    const key = `${ownerUserId}:${candidateCredentialId}`;
    if (
      !ownerUserId
      || !candidateCredentialId
      || candidateOrganizationId !== normalizedOrganizationId
      || referenceKeys.has(key)
    ) {
      return;
    }
    referenceKeys.add(key);
    references.push({
      ...reference,
      ownerUserId,
      credentialId: candidateCredentialId,
      organizationId: candidateOrganizationId,
    });
  };
  addReference(defaultReference);

  if (!normalizedCredentialId) {
    const registeredReferences = await registry.list({
      organizationId: normalizedOrganizationId,
      provider,
      repairDefault: false,
    });
    registeredReferences.forEach(addReference);
  }

  if (normalizedRequestingUserId) {
    const legacyStore = await readConnectorCredentialStore(
      provider,
      normalizedRequestingUserId,
      envFileCandidates,
    );
    for (const candidateCredentialId of listConnectorCredentialLoadCandidateIds(
      legacyStore,
      normalizedCredentialId,
    )) {
      const candidate = legacyStore.credentials[candidateCredentialId];
      if (
        !candidate
        || candidate.status === "invalid"
        || candidate.organizationId !== normalizedOrganizationId
      ) {
        continue;
      }
      addReference({
        ...candidate,
        credentialId: candidateCredentialId,
        ownerUserId: normalizedRequestingUserId,
      });
    }
  }

  let firstLoadError = null;
  for (const reference of references) {
    if (reference.status === "invalid") continue;
    let credential = null;
    try {
      credential = await loadConnectorCredential({
        provider,
        uid: reference.ownerUserId,
        credentialId: reference.credentialId,
        envFileCandidates,
        encryptionKeyNames,
      });
    } catch (error) {
      firstLoadError ||= error;
      if (normalizedCredentialId) throw error;
      continue;
    }
    if (
      !credential
      || credential.status === "invalid"
      || credential.organizationId !== normalizedOrganizationId
    ) {
      continue;
    }
    await registerOrganizationConnectorCredential({
      organizationId: normalizedOrganizationId,
      provider,
      credential,
      ownerUserId: reference.ownerUserId,
      makeDefault: !normalizedCredentialId,
      envFileCandidates,
    });
    return {
      ...credential,
      credentialOwnerId: reference.ownerUserId,
    };
  }
  if (firstLoadError) throw firstLoadError;
  return null;
}

export async function resolveConnectorSettingsForPrincipal({
  userId,
  organizationId = "",
  connectorIds = [],
  envFileCandidates = [],
}) {
  const store = createConnectorSettingsStore({
    async getDocument(path) {
      return parseFirestoreRecord(
        await firestoreGetDocument(path, envFileCandidates),
      );
    },
  });
  return store.resolve({ userId, organizationId, connectorIds });
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

function normalizeConnectorProviderId(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : "";
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

function getOrganizationCredentialRegistry(envFileCandidates) {
  return createConnectorCredentialRegistry({
    async getDocument(path) {
      return parseFirestoreRecord(
        await firestoreGetDocument(path, envFileCandidates),
      );
    },
    async setDocument(path, value) {
      const fields = createFirestoreFields(value);
      await firestorePatchDocument(
        path,
        fields,
        Object.keys(fields),
        envFileCandidates,
      );
    },
    async deleteDocument(path) {
      await firestoreDeleteDocument(path, envFileCandidates);
    },
    async listDocuments(path) {
      return (
        await firestoreListDocuments(path, envFileCandidates)
      ).map(parseFirestoreRecord);
    },
  });
}

async function encryptConnectorToken(
  value,
  envFileCandidates,
  encryptionKeyNames,
) {
  const [key] = await getEncryptionKeys(
    envFileCandidates,
    encryptionKeyNames,
  );
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
  const buffer = Buffer.from(value, "base64");
  const iv = buffer.subarray(0, ENCRYPTION_IV_LENGTH);
  const tag = buffer.subarray(
    ENCRYPTION_IV_LENGTH,
    ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH,
  );
  const encrypted = buffer.subarray(
    ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH,
  );
  let firstError = null;
  for (const key of await getEncryptionKeys(
    envFileCandidates,
    encryptionKeyNames,
  )) {
    try {
      const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString("utf8");
    } catch (error) {
      firstError ||= error;
    }
  }
  throw firstError || new Error("Unable to decrypt connector token");
}

async function getEncryptionKeys(envFileCandidates, encryptionKeyNames) {
  const keyNames = [
    ...new Set([
      ...(Array.isArray(encryptionKeyNames) ? encryptionKeyNames : []),
      "CONNECTOR_TOKEN_ENCRYPTION_KEY",
      "GITHUB_TOKEN_ENCRYPTION_KEY",
    ]),
  ];
  const keys = [];
  const fingerprints = new Set();
  for (const keyName of keyNames) {
    const value = await getConnectorRuntimeEnvValue(
      keyName,
      envFileCandidates,
    );
    if (!value) continue;
    const key = decodeEncryptionKey(value, keyName);
    const fingerprint = key.toString("hex");
    if (fingerprints.has(fingerprint)) continue;
    fingerprints.add(fingerprint);
    keys.push(key);
  }
  if (!keys.length) {
    throw new Error(`Missing ${keyNames[0] || "connector encryption key"}`);
  }
  return keys;
}

function decodeEncryptionKey(value, keyName) {
  try {
    const decoded = Buffer.from(value, "base64");
    if (decoded.length === 32) return decoded;
  } catch {}
  if (value.length === 32) return Buffer.from(value, "utf8");
  throw new Error(`${keyName} must be a 32-byte connector encryption key`);
}

async function firestoreGetDocument(documentPath, envFileCandidates) {
  return connectorStorageGetDocument(
    documentPath,
    envFileCandidates,
  );
}

async function firestoreListDocuments(collectionPath, envFileCandidates) {
  return connectorStorageListDocuments(
    collectionPath,
    envFileCandidates,
  );
}

async function firestoreDeleteDocument(documentPath, envFileCandidates) {
  return connectorStorageDeleteDocument(
    documentPath,
    envFileCandidates,
  );
}

async function firestorePatchDocument(
  documentPath,
  fields,
  updateFieldPaths,
  envFileCandidates,
) {
  return connectorStoragePatchDocument(
    documentPath,
    fields,
    updateFieldPaths,
    envFileCandidates,
  );
}

export async function connectorStorageGetDocument(
  documentPath,
  envFileCandidates,
) {
  return getConnectorDocumentStore().getDocument(
    documentPath,
    envFileCandidates,
  );
}

export async function connectorStorageListDocuments(
  collectionPath,
  envFileCandidates,
) {
  return getConnectorDocumentStore().listDocuments(
    collectionPath,
    envFileCandidates,
  );
}

export async function connectorStorageDeleteDocument(
  documentPath,
  envFileCandidates,
) {
  return getConnectorDocumentStore().deleteDocument(
    documentPath,
    envFileCandidates,
  );
}

export async function connectorStoragePatchDocument(
  documentPath,
  fields,
  updateFieldPaths,
  envFileCandidates,
) {
  return getConnectorDocumentStore().patchDocument(
    documentPath,
    fields,
    updateFieldPaths,
    envFileCandidates,
  );
}

export async function connectorStorageConsumeDocument(
  documentPath,
  envFileCandidates,
) {
  const store = getConnectorDocumentStore();
  if (typeof store.consumeDocument === "function") {
    return store.consumeDocument(documentPath, envFileCandidates);
  }
  const document = await store.getDocument(documentPath, envFileCandidates);
  if (document) {
    await store.deleteDocument(documentPath, envFileCandidates);
  }
  return document;
}

function getConnectorDocumentStore() {
  return createApplianceConnectorDocumentStore() || gcpConnectorOAuthAdapter;
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

function parseFirestoreRecord(document) {
  if (!document || typeof document !== "object") return null;
  const fields =
    document.fields && typeof document.fields === "object"
      ? document.fields
      : {};
  return Object.entries(fields).reduce((record, [key, value]) => {
    const parsed = parseFirestoreValue(value);
    if (parsed !== undefined) record[key] = parsed;
    return record;
  }, {});
}

function parseFirestoreValue(value) {
  if (!value || typeof value !== "object") return undefined;
  if (Object.hasOwn(value, "nullValue")) return null;
  if (typeof value.stringValue === "string") return value.stringValue;
  if (
    typeof value.integerValue === "string"
    || typeof value.integerValue === "number"
  ) {
    return Number(value.integerValue);
  }
  if (typeof value.doubleValue === "number") return value.doubleValue;
  if (typeof value.booleanValue === "boolean") return value.booleanValue;
  if (typeof value.timestampValue === "string") return value.timestampValue;
  if (typeof value.bytesValue === "string") return value.bytesValue;
  if (typeof value.referenceValue === "string") return value.referenceValue;
  if (value.mapValue && typeof value.mapValue === "object") {
    const fields = value.mapValue.fields;
    if (!fields || typeof fields !== "object") return {};
    return Object.entries(fields).reduce((record, [key, entry]) => {
      const parsed = parseFirestoreValue(entry);
      if (parsed !== undefined) record[key] = parsed;
      return record;
    }, {});
  }
  if (value.arrayValue && typeof value.arrayValue === "object") {
    const values = Array.isArray(value.arrayValue.values)
      ? value.arrayValue.values
      : [];
    return values
      .map(parseFirestoreValue)
      .filter((entry) => entry !== undefined);
  }
  return undefined;
}

function createFirestoreFields(value) {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  return Object.entries(source).reduce((fields, [key, entry]) => {
    if (typeof entry === "string") {
      fields[key] = { stringValue: entry };
    } else if (typeof entry === "number" && Number.isFinite(entry)) {
      fields[key] = { integerValue: String(Math.floor(entry)) };
    } else if (typeof entry === "boolean") {
      fields[key] = { booleanValue: entry };
    }
    return fields;
  }, {});
}
