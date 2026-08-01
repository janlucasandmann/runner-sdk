import {
  getConnectorRuntimeEnvValue,
  resolveConnectorCredentialForOrganization,
  saveConnectorCredential,
} from "../../connector-oauth-core.mjs";

export const DEFAULT_REFRESH_SKEW_MS = 60_000;
export const DEFAULT_MAX_INLINE_BYTES = 20 * 1024 * 1024;

export const stringSchema = (description, options = {}) => ({
  type: "string",
  description,
  ...options,
});

export const numberSchema = (description, options = {}) => ({
  type: "number",
  description,
  ...options,
});

export const booleanSchema = (description) => ({
  type: "boolean",
  description,
});

export const stringArraySchema = (description) => ({
  type: "array",
  description,
  items: { type: "string" },
});

export const objectSchema = (properties = {}, required = [], options = {}) => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
  ...options,
});

export function defineRuntimeTools(providerLabel, definitions) {
  const names = new Set();
  const tools = Object.freeze(
    definitions.map((definition) => {
      const name = readString(definition?.name);
      if (!name || names.has(name)) {
        throw new TypeError(`${providerLabel} runtime tool names must be unique: ${name}`);
      }
      names.add(name);
      return Object.freeze({
        name,
        access: definition.access === "interactive" ? "interactive" : "read-only",
        description: `${readString(definition.description)} Uses the ${providerLabel} credential already selected for this thread; do not ask the user for credentials.`,
        inputSchema: definition.inputSchema || objectSchema(),
      });
    }),
  );
  const byName = new Map(tools.map((definition) => [definition.name, definition]));

  return Object.freeze({
    get(name) {
      return byName.get(readString(name)) || null;
    },
    list(actionIds) {
      if (!Array.isArray(actionIds)) return tools;
      const allowed = new Set(actionIds.map(String));
      return tools.filter((definition) => allowed.has(definition.name));
    },
    capabilities() {
      return tools.map((definition) =>
        Object.freeze({
          id: definition.name,
          access: definition.access,
        }),
      );
    },
  });
}

export class ConnectorRuntimeError extends Error {
  constructor(
    message,
    { code = "connector_provider_request_failed", statusCode = 502, details } = {},
  ) {
    super(message);
    this.name = "ConnectorRuntimeError";
    this.code = code;
    this.statusCode = statusCode;
    if (details !== undefined) this.details = details;
  }
}

export function createOAuthCredentialRuntime({
  provider,
  clientIdEnv,
  clientSecretEnv,
  tokenUrl,
  tokenAuth = "body",
  tokenSlot = {},
  validateRefreshPayload,
  buildRefreshParameters,
  resolveCredential = resolveConnectorCredentialForOrganization,
  persistCredential = saveConnectorCredential,
  getEnvironmentValue = getConnectorRuntimeEnvValue,
  fetchImpl = globalThis.fetch,
  envFileCandidates = [],
  encryptionKeyNames = [
    `${toEnvironmentPrefix(provider)}_TOKEN_ENCRYPTION_KEY`,
    "CONNECTOR_TOKEN_ENCRYPTION_KEY",
  ],
  refreshSkewMs = DEFAULT_REFRESH_SKEW_MS,
  now = () => Date.now(),
} = {}) {
  const normalizedProvider = readString(provider).toLowerCase();
  if (!normalizedProvider) {
    throw new TypeError("OAuth credential runtime requires a provider.");
  }
  if (!readString(clientIdEnv) || !readString(clientSecretEnv)) {
    throw new TypeError(
      `${normalizedProvider} OAuth credential runtime requires client environment keys.`,
    );
  }
  if (!readString(tokenUrl)) {
    throw new TypeError(`${normalizedProvider} OAuth credential runtime requires a token URL.`);
  }
  if (typeof resolveCredential !== "function") {
    throw new TypeError(
      `${normalizedProvider} OAuth credential runtime requires a credential resolver.`,
    );
  }
  if (typeof persistCredential !== "function") {
    throw new TypeError(
      `${normalizedProvider} OAuth credential runtime requires credential persistence.`,
    );
  }
  if (typeof getEnvironmentValue !== "function") {
    throw new TypeError(
      `${normalizedProvider} OAuth credential runtime requires an environment resolver.`,
    );
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError(`${normalizedProvider} OAuth credential runtime requires fetch.`);
  }

  const readAccessToken =
    typeof tokenSlot.readAccessToken === "function"
      ? tokenSlot.readAccessToken
      : defaultReadAccessToken;
  const readRefreshToken =
    typeof tokenSlot.readRefreshToken === "function"
      ? tokenSlot.readRefreshToken
      : defaultReadRefreshToken;
  const readExpiresAt =
    typeof tokenSlot.readExpiresAt === "function" ? tokenSlot.readExpiresAt : defaultReadExpiresAt;
  const mergeRefreshPayload =
    typeof tokenSlot.mergeRefreshPayload === "function"
      ? tokenSlot.mergeRefreshPayload
      : mergeDefaultRefreshPayload;
  const refreshes = new Map();

  async function resolve(grant, { forceRefresh = false } = {}) {
    let credential = await resolveCredential({
      provider: normalizedProvider,
      organizationId: grant?.organizationId,
      credentialId: grant?.credentialId,
      envFileCandidates,
      encryptionKeyNames,
    });
    if (!credential) throw unavailableCredential(normalizedProvider);

    const token = isRecord(credential.token) ? credential.token : {};
    const accessToken = readString(readAccessToken(token));
    const refreshToken = readString(readRefreshToken(token));
    const expiresAt = Number(readExpiresAt(token) || 0);
    const shouldRefresh = forceRefresh || (expiresAt > 0 && expiresAt <= now() + refreshSkewMs);

    if (shouldRefresh) {
      if (!refreshToken) {
        throw expiredCredential(normalizedProvider);
      }
      credential = await refresh(credential, { force: forceRefresh });
    } else if (!accessToken) {
      if (!refreshToken) throw unavailableCredential(normalizedProvider);
      credential = await refresh(credential);
    }

    const resolvedAccessToken = readString(readAccessToken(credential.token || {}));
    if (!resolvedAccessToken) throw unavailableCredential(normalizedProvider);
    return Object.freeze({
      accessToken: resolvedAccessToken,
      credential,
    });
  }

  async function invoke(grant, execute) {
    let context = await resolve(grant);
    try {
      return await execute(context);
    } catch (error) {
      if (
        Number(error?.statusCode) !== 401 ||
        !readString(readRefreshToken(context.credential?.token || {}))
      ) {
        throw error;
      }
      context = await resolve(grant, { forceRefresh: true });
      return execute(context);
    }
  }

  async function refresh(credential, { force = false } = {}) {
    const token = isRecord(credential?.token) ? credential.token : {};
    const refreshToken = readString(readRefreshToken(token));
    if (!refreshToken) throw expiredCredential(normalizedProvider);
    if (!force) {
      const expiresAt = Number(readExpiresAt(token) || 0);
      if (readString(readAccessToken(token)) && (!expiresAt || expiresAt > now() + refreshSkewMs)) {
        return credential;
      }
    }

    const refreshKey = [
      normalizedProvider,
      credential.organizationId,
      credential.credentialId,
      readString(tokenSlot.id) || "primary",
    ].join(":");
    if (refreshes.has(refreshKey)) return refreshes.get(refreshKey);

    const refreshPromise = performRefresh({
      credential,
      refreshToken,
    }).finally(() => {
      refreshes.delete(refreshKey);
    });
    refreshes.set(refreshKey, refreshPromise);
    return refreshPromise;
  }

  async function performRefresh({ credential, refreshToken }) {
    const [clientId, clientSecret] = await Promise.all([
      getEnvironmentValue(clientIdEnv, envFileCandidates),
      getEnvironmentValue(clientSecretEnv, envFileCandidates),
    ]);
    if (!clientId || !clientSecret) {
      throw new ConnectorRuntimeError(
        `${providerLabel(normalizedProvider)} OAuth is not configured on this deployment.`,
        {
          code: "connector_oauth_configuration_missing",
          statusCode: 503,
        },
      );
    }

    const previousToken = isRecord(credential.token) ? credential.token : {};
    const customParameters =
      typeof buildRefreshParameters === "function"
        ? buildRefreshParameters({
            credential,
            token: previousToken,
            refreshToken,
          })
        : {};
    const parameters = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      ...compactStringRecord(customParameters),
    });
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (tokenAuth === "basic") {
      headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString(
        "base64",
      )}`;
    } else {
      parameters.set("client_id", clientId);
      parameters.set("client_secret", clientSecret);
    }

    const response = await fetchImpl(tokenUrl, {
      method: "POST",
      headers,
      body: parameters.toString(),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    const payloadAccepted =
      typeof validateRefreshPayload === "function"
        ? validateRefreshPayload(payload)
        : Boolean(defaultReadAccessToken(payload));
    if (!response.ok || !payloadAccepted) {
      throw new ConnectorRuntimeError(
        readProviderErrorMessage(
          payload,
          `${providerLabel(normalizedProvider)} rejected the stored refresh token.`,
        ),
        {
          code: "connector_credentials_expired",
          statusCode: 401,
          details: sanitizeProviderDetails(payload),
        },
      );
    }

    const nextToken = mergeRefreshPayload(previousToken, payload, now());
    const ownerUserId = readString(credential.credentialOwnerId);
    if (!ownerUserId) throw unavailableCredential(normalizedProvider);
    await persistCredential({
      provider: normalizedProvider,
      uid: ownerUserId,
      credentialId: credential.credentialId,
      credentialName: credential.name,
      organizationId: credential.organizationId,
      identity: credential.identity,
      profile: credential.profile,
      token: nextToken,
      envFileCandidates,
      encryptionKeyNames,
    });
    return { ...credential, token: nextToken };
  }

  return Object.freeze({
    invoke,
    refresh,
    resolve,
  });
}

export function mergeDefaultRefreshPayload(previousToken, payload, now) {
  const accessToken = defaultReadAccessToken(payload);
  const refreshToken = defaultReadRefreshToken(payload) || defaultReadRefreshToken(previousToken);
  const expiresIn = Math.max(0, Number(payload?.expires_in || 0));
  const scope = normalizeScopeValue(payload?.scope ?? previousToken?.scope ?? "");
  const tokenType =
    readString(
      payload?.token_type ?? previousToken?.tokenType ?? previousToken?.token_type ?? "Bearer",
    ) || "Bearer";
  return {
    ...previousToken,
    accessToken,
    access_token: accessToken,
    refreshToken,
    refresh_token: refreshToken,
    tokenType,
    token_type: tokenType,
    scope,
    expiresAt: expiresIn ? now + expiresIn * 1000 : null,
    raw: {
      ...(isRecord(previousToken?.raw) ? previousToken.raw : {}),
      ...sanitizeTokenMetadata(payload),
    },
  };
}

export function defaultReadAccessToken(token) {
  return readString(token?.accessToken || token?.access_token);
}

export function defaultReadRefreshToken(token) {
  return readString(token?.refreshToken || token?.refresh_token);
}

export function defaultReadExpiresAt(token) {
  return Number(token?.expiresAt || token?.expires_at || 0);
}

export function createProviderRequestError(provider, response, payload, fallback = "") {
  const statusCode = Number(response?.status) || 502;
  const code =
    statusCode === 401 || statusCode === 403
      ? "connector_provider_access_denied"
      : statusCode === 429
        ? "connector_provider_rate_limited"
        : statusCode === 409
          ? "connector_provider_conflict"
          : statusCode === 404
            ? "connector_provider_not_found"
            : "connector_provider_request_failed";
  return new ConnectorRuntimeError(
    readProviderErrorMessage(
      payload,
      fallback || response?.statusText || `${providerLabel(provider)} request failed.`,
    ),
    {
      code,
      statusCode,
      details: compactObject({
        provider: sanitizeProviderDetails(payload),
        retryAfter: response?.headers?.get?.("retry-after") || undefined,
      }),
    },
  );
}

export function invalidInput(message, details) {
  return new ConnectorRuntimeError(message, {
    code: "connector_input_invalid",
    statusCode: 400,
    details,
  });
}

export function unavailableCredential(provider) {
  return new ConnectorRuntimeError(
    `The selected ${providerLabel(provider)} credentials are unavailable or incomplete.`,
    {
      code: "connector_credentials_unavailable",
      statusCode: 401,
    },
  );
}

export function expiredCredential(provider) {
  return new ConnectorRuntimeError(
    `The ${providerLabel(provider)} connection has expired. Reconnect it to continue.`,
    {
      code: "connector_credentials_expired",
      statusCode: 401,
    },
  );
}

export async function readJsonResponse(response) {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text));
  }
}

export async function readBinaryResponse(
  response,
  { provider, maxBytes = DEFAULT_MAX_INLINE_BYTES, metadata } = {},
) {
  if (!response.ok) {
    throw createProviderRequestError(provider, response, await readJsonResponse(response));
  }
  const normalizedMaximum = normalizePositiveInteger(maxBytes, DEFAULT_MAX_INLINE_BYTES);
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (declaredSize > normalizedMaximum) {
    throw inlineContentTooLarge(provider, normalizedMaximum, declaredSize);
  }
  const content = Buffer.from(await response.arrayBuffer());
  if (content.byteLength > normalizedMaximum) {
    throw inlineContentTooLarge(provider, normalizedMaximum, content.byteLength);
  }
  const contentType = readString(response.headers.get("content-type") || "application/octet-stream")
    .split(";")[0]
    .trim();
  return {
    ...(metadata === undefined ? {} : { metadata }),
    contentType,
    size: content.byteLength,
    contentBase64: content.toString("base64"),
    ...(isTextContentType(contentType) ? { text: content.toString("utf8") } : {}),
  };
}

export function inlineContentTooLarge(provider, maximum, actual) {
  return new ConnectorRuntimeError(
    `The ${providerLabel(provider)} content is too large for an inline connector response (${actual} bytes).`,
    {
      code: "connector_file_too_large",
      statusCode: 413,
      details: {
        actualBytes: actual,
        maximumBytes: maximum,
      },
    },
  );
}

export function readInlineContent(
  args,
  {
    textKey = "content",
    base64Key = "contentBase64",
    pathKey = "contentPath",
    provider = "connector",
  } = {},
) {
  if (typeof args?.[base64Key] === "string" && args[base64Key].trim()) {
    const normalized = args[base64Key].replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
      throw invalidInput(`${base64Key} is not valid base64.`);
    }
    return Buffer.from(normalized, "base64");
  }
  if (typeof args?.[textKey] === "string") {
    return Buffer.from(args[textKey], "utf8");
  }
  if (readString(args?.[pathKey])) {
    throw new ConnectorRuntimeError(
      `The remote ${providerLabel(provider)} connector cannot read a runner workspace path directly. Supply ${textKey} or ${base64Key}.`,
      {
        code: "connector_file_transfer_unavailable",
        statusCode: 422,
      },
    );
  }
  throw invalidInput(`${providerLabel(provider)} upload requires ${textKey} or ${base64Key}.`);
}

export function requireString(value, label) {
  const normalized = readString(value);
  if (!normalized) throw invalidInput(`${label} is required.`);
  return normalized;
}

export function requireStringArray(value, label) {
  if (!Array.isArray(value)) throw invalidInput(`${label} is required.`);
  const normalized = value.map(readString).filter(Boolean);
  if (!normalized.length) throw invalidInput(`${label} is required.`);
  return normalized;
}

export function normalizeOptionalEnum(value, allowed, label) {
  const normalized = readString(value);
  if (!normalized) return undefined;
  if (allowed.includes(normalized)) return normalized;
  throw invalidInput(`${label} must be one of: ${allowed.join(", ")}.`);
}

export function normalizeCursorUrl(value, allowedOrigins) {
  const normalized = readString(value);
  if (!normalized) return "";
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw invalidInput("The pagination cursor is invalid.");
  }
  const origins = new Set(
    (Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins])
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
  if (!origins.has(url.origin) || url.username || url.password) {
    throw invalidInput("The pagination cursor does not belong to this provider.");
  }
  return url.toString();
}

export function readString(value) {
  return String(value ?? "").trim();
}

export function readBoolean(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const normalized = readString(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

export function clampInteger(value, minimum, maximum, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized)) return fallback;
  return Math.min(maximum, Math.max(minimum, normalized));
}

export function compactObject(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== null && entry !== "",
    ),
  );
}

export function compactStringRecord(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, readString(entry)])
      .filter(([, entry]) => Boolean(entry)),
  );
}

export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizePositiveInteger(value, fallback) {
  const normalized = Math.floor(Number(value));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

export function providerLabel(value) {
  return readString(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join(" ");
}

export function encodePath(value) {
  return encodeURIComponent(requireString(value, "Provider resource ID"));
}

export function normalizeScopeValue(value) {
  return Array.isArray(value) ? value.map(readString).filter(Boolean).join(" ") : readString(value);
}

export function sanitizeTokenMetadata(payload) {
  if (!isRecord(payload)) return {};
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([key]) => !["access_token", "refresh_token", "id_token", "authed_user"].includes(key),
    ),
  );
}

function readProviderErrorMessage(payload, fallback) {
  const error = isRecord(payload?.error) ? payload.error : {};
  return (
    readString(payload?.error_description) ||
    readString(payload?.error_summary) ||
    readString(error?.message) ||
    readString(payload?.message) ||
    (typeof payload?.error === "string" ? readString(payload.error) : "") ||
    readString(fallback) ||
    "Provider request failed."
  );
}

function sanitizeProviderDetails(payload) {
  if (!isRecord(payload)) return payload;
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([key]) => !["access_token", "refresh_token", "id_token", "token"].includes(key),
    ),
  );
}

function inlineContentType(value) {
  return readString(value).toLowerCase();
}

function isTextContentType(value) {
  const type = inlineContentType(value);
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    type.endsWith("+json") ||
    type === "application/xml" ||
    type.endsWith("+xml") ||
    type === "application/javascript"
  );
}

function toEnvironmentPrefix(value) {
  return readString(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}
