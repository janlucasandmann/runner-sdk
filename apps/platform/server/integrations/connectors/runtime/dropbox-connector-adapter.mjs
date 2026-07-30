import {
  getConnectorRuntimeEnvValue,
  resolveConnectorCredentialForOrganization,
  saveConnectorCredential,
} from "../../connector-oauth-core.mjs";

const DROPBOX_API_ORIGIN = "https://api.dropboxapi.com";
const DROPBOX_CONTENT_ORIGIN = "https://content.dropboxapi.com";
const DROPBOX_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";
const DROPBOX_REFRESH_SKEW_MS = 60_000;
const DEFAULT_MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;
const DROPBOX_ENCRYPTION_KEY_NAMES = Object.freeze([
  "DROPBOX_TOKEN_ENCRYPTION_KEY",
  "CONNECTOR_TOKEN_ENCRYPTION_KEY",
]);

const string = (description, options = {}) => ({
  type: "string",
  description,
  ...options,
});
const number = (description, options = {}) => ({
  type: "number",
  description,
  ...options,
});
const boolean = (description) => ({
  type: "boolean",
  description,
});
const input = (properties = {}, required = [], options = {}) => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
  ...options,
});

const INTERACTIVE_ACTION_IDS = new Set([
  "upload_file",
  "create_folder",
  "move_item",
  "delete_item",
  "create_shared_link",
]);

const TOOL_DEFINITIONS = Object.freeze([
  tool("get_current_account", "Get the connected Dropbox account profile."),
  tool(
    "list_folder",
    "List files and folders at a Dropbox path.",
    input({
      path: string("Dropbox folder path. Use an empty string for the root."),
      cursor: string("Cursor from a previous list_folder response."),
      limit: number("Maximum results.", { minimum: 1, maximum: 100 }),
      recursive: boolean("Include descendants recursively."),
    }),
  ),
  tool(
    "search_files",
    "Search files and folders in Dropbox.",
    input(
      {
        query: string("Dropbox search query."),
        path: string("Optional Dropbox path to search within."),
        cursor: string("Cursor from a previous search_files response."),
        limit: number("Maximum results.", { minimum: 1, maximum: 100 }),
      },
      [],
      {
        oneOf: [{ required: ["query"] }, { required: ["cursor"] }],
      },
    ),
  ),
  tool(
    "get_metadata",
    "Get metadata for a Dropbox file or folder.",
    input(
      {
        path: string("Dropbox file or folder path, ID, or revision."),
      },
      ["path"],
    ),
  ),
  tool(
    "download_file",
    "Download a Dropbox file and return its metadata and base64 content.",
    input(
      {
        path: string("Dropbox file path, ID, or revision."),
        revision: string("Optional file revision."),
      },
      ["path"],
    ),
  ),
  tool(
    "list_revisions",
    "List revisions of a Dropbox file.",
    input(
      {
        path: string("Dropbox file path or ID."),
        limit: number("Maximum revisions.", { minimum: 1, maximum: 100 }),
        beforeRevision: string("Only return revisions before this revision."),
      },
      ["path"],
    ),
  ),
  tool(
    "upload_file",
    "Upload supplied text or base64 file content to Dropbox.",
    input(
      {
        path: string("Destination Dropbox file path."),
        content: string("UTF-8 text content to upload."),
        contentBase64: string("Base64-encoded binary content to upload."),
        contentPath: string(
          "Workspace path for clients with a file-transfer bridge. A path alone cannot be read by the remote connector service.",
        ),
        mode: string("Write mode.", {
          enum: ["add", "overwrite", "update"],
        }),
        revision: string("Required existing revision when mode is update."),
        autorename: boolean("Automatically rename the file on conflicts."),
        mute: boolean("Suppress Dropbox notifications for this upload."),
      },
      ["path"],
      {
        oneOf: [{ required: ["content"] }, { required: ["contentBase64"] }],
      },
    ),
  ),
  tool(
    "create_folder",
    "Create a Dropbox folder.",
    input(
      {
        path: string("New Dropbox folder path."),
        autorename: boolean("Automatically rename the folder on conflicts."),
      },
      ["path"],
    ),
  ),
  tool(
    "move_item",
    "Move or rename a Dropbox file or folder.",
    input(
      {
        fromPath: string("Current Dropbox path or ID."),
        toPath: string("Destination Dropbox path."),
        autorename: boolean("Automatically rename the item on conflicts."),
      },
      ["fromPath", "toPath"],
    ),
  ),
  tool(
    "delete_item",
    "Delete a Dropbox file or folder.",
    input(
      {
        path: string("Dropbox path or ID."),
        parentRevision: string("Only delete the file if its current revision matches this value."),
      },
      ["path"],
    ),
  ),
  tool(
    "create_shared_link",
    "Create a Dropbox shared link for a file or folder.",
    input(
      {
        path: string("Dropbox path or ID."),
        audience: string("Who can use the shared link.", {
          enum: ["public", "team", "no_one"],
        }),
        access: string("Access granted by the shared link.", {
          enum: ["viewer", "editor", "max"],
        }),
        allowDownload: boolean("Allow link recipients to download the content."),
      },
      ["path"],
    ),
  ),
]);

const TOOL_BY_NAME = new Map(TOOL_DEFINITIONS.map((definition) => [definition.name, definition]));

export class DropboxConnectorError extends Error {
  constructor(message, { code = "dropbox_request_failed", statusCode = 502, details } = {}) {
    super(message);
    this.name = "DropboxConnectorError";
    this.code = code;
    this.statusCode = statusCode;
    if (details !== undefined) this.details = details;
  }
}

export function createDropboxConnectorAdapter({
  resolveCredential = resolveConnectorCredentialForOrganization,
  persistCredential = saveConnectorCredential,
  getEnvironmentValue = getConnectorRuntimeEnvValue,
  fetchImpl = globalThis.fetch,
  envFileCandidates = [],
  now = () => Date.now(),
  maxDownloadBytes = DEFAULT_MAX_DOWNLOAD_BYTES,
} = {}) {
  if (typeof resolveCredential !== "function") {
    throw new TypeError("Dropbox adapter requires a credential resolver.");
  }
  if (typeof persistCredential !== "function") {
    throw new TypeError("Dropbox adapter requires a credential persistence adapter.");
  }
  if (typeof getEnvironmentValue !== "function") {
    throw new TypeError("Dropbox adapter requires an environment resolver.");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Dropbox adapter requires fetch.");
  }
  if (typeof now !== "function") {
    throw new TypeError("Dropbox adapter requires a clock.");
  }
  const normalizedMaxDownloadBytes = normalizePositiveInteger(
    maxDownloadBytes,
    DEFAULT_MAX_DOWNLOAD_BYTES,
  );
  const refreshes = new Map();

  function listTools(actionIds) {
    if (!Array.isArray(actionIds)) return TOOL_DEFINITIONS;
    const allowed = new Set(actionIds.map(String));
    return TOOL_DEFINITIONS.filter((definition) => allowed.has(definition.name));
  }

  function listCapabilities() {
    return TOOL_DEFINITIONS.map((definition) =>
      Object.freeze({
        id: definition.name,
        access: definition.access,
      }),
    );
  }

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOL_BY_NAME.get(String(name || ""));
    if (!definition) {
      throw new DropboxConnectorError("Unknown Dropbox action.", {
        code: "connector_action_unknown",
        statusCode: 404,
      });
    }
    const args = isRecord(rawArguments) ? rawArguments : {};
    let credential = await resolveCredential({
      provider: "dropbox",
      organizationId: grant.organizationId,
      credentialId: grant.credentialId,
      envFileCandidates,
      encryptionKeyNames: DROPBOX_ENCRYPTION_KEY_NAMES,
    });
    if (!credential) {
      throw unavailableCredentials();
    }
    credential = await refreshCredentialIfNeeded(credential);
    const accessToken = readAccessToken(credential.token);
    if (!accessToken) {
      throw unavailableCredentials();
    }

    try {
      return await invokeDropboxAction(
        createDropboxClient({
          accessToken,
          fetchImpl,
          maxDownloadBytes: normalizedMaxDownloadBytes,
        }),
        definition.name,
        args,
      );
    } catch (error) {
      if (
        !(error instanceof DropboxConnectorError) ||
        error.statusCode !== 401 ||
        !readRefreshToken(credential.token)
      ) {
        throw error;
      }
      credential = await refreshCredential(credential, { force: true });
      return invokeDropboxAction(
        createDropboxClient({
          accessToken: readAccessToken(credential.token),
          fetchImpl,
          maxDownloadBytes: normalizedMaxDownloadBytes,
        }),
        definition.name,
        args,
      );
    }
  }

  async function refreshCredentialIfNeeded(credential) {
    const expiresAt = Number(credential?.token?.expiresAt || 0);
    if (!expiresAt || expiresAt > now() + DROPBOX_REFRESH_SKEW_MS) {
      return credential;
    }
    return refreshCredential(credential);
  }

  async function refreshCredential(credential, { force = false } = {}) {
    const refreshToken = readRefreshToken(credential?.token);
    if (!refreshToken) {
      throw new DropboxConnectorError(
        "The Dropbox connection has expired. Reconnect Dropbox to continue.",
        {
          code: "connector_credentials_expired",
          statusCode: 401,
        },
      );
    }
    if (!force) {
      const expiresAt = Number(credential?.token?.expiresAt || 0);
      if (!expiresAt || expiresAt > now() + DROPBOX_REFRESH_SKEW_MS) {
        return credential;
      }
    }
    const refreshKey = [credential.organizationId, credential.credentialId].join(":");
    if (refreshes.has(refreshKey)) return refreshes.get(refreshKey);

    const refreshPromise = refreshDropboxCredential({
      credential,
      refreshToken,
      fetchImpl,
      getEnvironmentValue,
      persistCredential,
      envFileCandidates,
      now,
    }).finally(() => {
      refreshes.delete(refreshKey);
    });
    refreshes.set(refreshKey, refreshPromise);
    return refreshPromise;
  }

  return Object.freeze({
    id: "dropbox",
    aliases: Object.freeze(["dropbox"]),
    invoke,
    listCapabilities,
    listTools,
  });
}

async function refreshDropboxCredential({
  credential,
  refreshToken,
  fetchImpl,
  getEnvironmentValue,
  persistCredential,
  envFileCandidates,
  now,
}) {
  const [clientId, clientSecret] = await Promise.all([
    getEnvironmentValue("DROPBOX_OAUTH_CLIENT_ID", envFileCandidates),
    getEnvironmentValue("DROPBOX_OAUTH_CLIENT_SECRET", envFileCandidates),
  ]);
  if (!clientId || !clientSecret) {
    throw new DropboxConnectorError("Dropbox OAuth is not configured on this deployment.", {
      code: "connector_oauth_configuration_missing",
      statusCode: 503,
    });
  }

  const response = await fetchImpl(DROPBOX_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    cache: "no-store",
  });
  const payload = await readJsonResponse(response);
  const accessToken = String(payload?.access_token || "").trim();
  if (!response.ok || !accessToken) {
    throw new DropboxConnectorError(
      readDropboxError(payload, "Dropbox rejected the stored refresh token."),
      {
        code: "connector_credentials_expired",
        statusCode: 401,
        details: payload,
      },
    );
  }

  const expiresIn = Math.max(0, Number(payload.expires_in || 0));
  const previousToken = isRecord(credential.token) ? credential.token : {};
  const nextRefreshToken = String(payload.refresh_token || "").trim() || refreshToken;
  const nextToken = {
    ...previousToken,
    accessToken,
    access_token: accessToken,
    refreshToken: nextRefreshToken,
    refresh_token: nextRefreshToken,
    tokenType: String(
      payload.token_type || previousToken.tokenType || previousToken.token_type || "bearer",
    ).trim(),
    token_type: String(
      payload.token_type || previousToken.token_type || previousToken.tokenType || "bearer",
    ).trim(),
    scope: String(payload.scope || previousToken.scope || "").trim(),
    expiresAt: expiresIn ? now() + expiresIn * 1000 : null,
    raw: compactObject({
      ...(isRecord(previousToken.raw) ? previousToken.raw : {}),
      account_id: payload.account_id,
      uid: payload.uid,
    }),
  };

  const ownerUserId = String(credential.credentialOwnerId || "").trim();
  if (!ownerUserId) {
    throw new DropboxConnectorError("The Dropbox credential owner could not be resolved.", {
      code: "connector_credentials_unavailable",
      statusCode: 401,
    });
  }
  await persistCredential({
    provider: "dropbox",
    uid: ownerUserId,
    credentialId: credential.credentialId,
    credentialName: credential.name,
    organizationId: credential.organizationId,
    identity: credential.identity,
    profile: credential.profile,
    token: nextToken,
    envFileCandidates,
    encryptionKeyNames: DROPBOX_ENCRYPTION_KEY_NAMES,
  });
  return { ...credential, token: nextToken };
}

async function invokeDropboxAction(client, name, args) {
  switch (name) {
    case "get_current_account":
      return client.rpc("/2/users/get_current_account", null);
    case "list_folder":
      if (readString(args.cursor)) {
        return client.rpc("/2/files/list_folder/continue", {
          cursor: readString(args.cursor),
        });
      }
      return client.rpc(
        "/2/files/list_folder",
        compactObject({
          path: normalizeDropboxPath(args.path, { allowRoot: true }),
          limit: clampInteger(args.limit, 1, 100),
          recursive: args.recursive === undefined ? undefined : Boolean(args.recursive),
        }),
      );
    case "search_files":
      if (readString(args.cursor)) {
        return client.rpc("/2/files/search/continue_v2", {
          cursor: readString(args.cursor),
        });
      }
      if (!readString(args.query)) {
        throw invalidInput("A Dropbox search query is required.");
      }
      return client.rpc(
        "/2/files/search_v2",
        compactObject({
          query: readString(args.query),
          options: compactObject({
            path: readString(args.path)
              ? normalizeDropboxPath(args.path, { allowRoot: true })
              : undefined,
            max_results: clampInteger(args.limit, 1, 100),
          }),
        }),
      );
    case "get_metadata":
      return client.rpc("/2/files/get_metadata", {
        path: normalizeDropboxPath(args.path),
        include_deleted: false,
      });
    case "download_file":
      return client.download(
        "/2/files/download",
        compactObject({
          path: normalizeDropboxPath(args.path),
          rev: readString(args.revision),
        }),
      );
    case "list_revisions":
      return client.rpc(
        "/2/files/list_revisions",
        compactObject({
          path: normalizeDropboxPath(args.path),
          limit: clampInteger(args.limit, 1, 100) || 10,
          before_rev: readString(args.beforeRevision),
        }),
      );
    case "upload_file": {
      const content = readUploadContent(args);
      return client.upload(
        "/2/files/upload",
        compactObject({
          path: normalizeDropboxPath(args.path),
          mode: normalizeWriteMode(args.mode, args.revision),
          autorename: args.autorename === undefined ? false : Boolean(args.autorename),
          mute: args.mute === undefined ? false : Boolean(args.mute),
        }),
        content,
      );
    }
    case "create_folder":
      return client.rpc("/2/files/create_folder_v2", {
        path: normalizeDropboxPath(args.path),
        autorename: args.autorename === undefined ? false : Boolean(args.autorename),
      });
    case "move_item":
      return client.rpc("/2/files/move_v2", {
        from_path: normalizeDropboxPath(args.fromPath),
        to_path: normalizeDropboxPath(args.toPath),
        autorename: args.autorename === undefined ? false : Boolean(args.autorename),
        allow_ownership_transfer: false,
      });
    case "delete_item":
      return client.rpc(
        "/2/files/delete_v2",
        compactObject({
          path: normalizeDropboxPath(args.path),
          parent_rev: readString(args.parentRevision),
        }),
      );
    case "create_shared_link":
      return createSharedLink(client, args);
    default:
      throw new DropboxConnectorError("Unknown Dropbox action.", {
        code: "connector_action_unknown",
        statusCode: 404,
      });
  }
}

async function createSharedLink(client, args) {
  const path = normalizeDropboxPath(args.path);
  const settings = compactObject({
    audience: normalizeOptionalEnum(
      args.audience,
      ["public", "team", "no_one"],
      "Dropbox shared-link audience",
    ),
    access: normalizeOptionalEnum(
      args.access,
      ["viewer", "editor", "max"],
      "Dropbox shared-link access",
    ),
    allow_download: args.allowDownload === undefined ? undefined : Boolean(args.allowDownload),
  });
  try {
    return await client.rpc("/2/sharing/create_shared_link_with_settings", {
      path,
      ...(Object.keys(settings).length ? { settings } : {}),
    });
  } catch (error) {
    if (!isSharedLinkAlreadyExists(error)) throw error;
    const existing = readExistingSharedLinkMetadata(error);
    if (existing) return existing;
    const result = await client.rpc("/2/sharing/list_shared_links", {
      path,
      direct_only: true,
    });
    if (Array.isArray(result?.links) && result.links.length) {
      return result.links[0];
    }
    throw error;
  }
}

function createDropboxClient({ accessToken, fetchImpl, maxDownloadBytes }) {
  async function rpc(pathname, body) {
    const response = await fetchImpl(new URL(pathname, DROPBOX_API_ORIGIN), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) throw providerRequestError(response, payload);
    return payload;
  }

  async function download(pathname, argument) {
    const response = await fetchImpl(new URL(pathname, DROPBOX_CONTENT_ORIGIN), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": encodeDropboxApiArgument(argument),
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw providerRequestError(response, await readJsonResponse(response));
    }
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > maxDownloadBytes) {
      throw downloadTooLarge(maxDownloadBytes, declaredSize);
    }
    const content = Buffer.from(await response.arrayBuffer());
    if (content.byteLength > maxDownloadBytes) {
      throw downloadTooLarge(maxDownloadBytes, content.byteLength);
    }
    const contentType = String(response.headers.get("content-type") || "application/octet-stream")
      .split(";")[0]
      .trim();
    const metadata = parseJson(response.headers.get("dropbox-api-result") || "");
    return {
      metadata,
      contentType,
      size: content.byteLength,
      contentBase64: content.toString("base64"),
      ...(isTextContentType(contentType) ? { text: content.toString("utf8") } : {}),
    };
  }

  async function upload(pathname, argument, content) {
    const response = await fetchImpl(new URL(pathname, DROPBOX_CONTENT_ORIGIN), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": encodeDropboxApiArgument(argument),
      },
      body: content,
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) throw providerRequestError(response, payload);
    return payload;
  }

  return Object.freeze({ download, rpc, upload });
}

function tool(name, description, inputSchema = input()) {
  return Object.freeze({
    name,
    access: INTERACTIVE_ACTION_IDS.has(name) ? "interactive" : "read-only",
    description: `${description} Uses the Dropbox credential already selected for this thread; do not ask the user for credentials.`,
    inputSchema,
  });
}

function providerRequestError(response, payload) {
  const statusCode = Number(response?.status) || 502;
  return new DropboxConnectorError(
    readDropboxError(payload, response?.statusText || "Dropbox request failed."),
    {
      code:
        statusCode === 401 || statusCode === 403
          ? "connector_provider_access_denied"
          : statusCode === 429
            ? "connector_provider_rate_limited"
            : "connector_provider_request_failed",
      statusCode,
      details: compactObject({
        provider: payload,
        retryAfter: response?.headers?.get?.("retry-after") || undefined,
      }),
    },
  );
}

function unavailableCredentials() {
  return new DropboxConnectorError(
    "The selected Dropbox credentials are unavailable or incomplete.",
    {
      code: "connector_credentials_unavailable",
      statusCode: 401,
    },
  );
}

function invalidInput(message) {
  return new DropboxConnectorError(message, {
    code: "connector_input_invalid",
    statusCode: 400,
  });
}

function downloadTooLarge(maximum, actual) {
  return new DropboxConnectorError(
    `The Dropbox file is too large for an inline connector response (${actual} bytes).`,
    {
      code: "connector_file_too_large",
      statusCode: 413,
      details: { actualBytes: actual, maximumBytes: maximum },
    },
  );
}

function normalizeDropboxPath(value, { allowRoot = false } = {}) {
  const normalized = readString(value);
  if (!normalized) {
    if (allowRoot) return "";
    throw invalidInput("A Dropbox path is required.");
  }
  if (
    normalized.startsWith("id:") ||
    normalized.startsWith("rev:") ||
    normalized.startsWith("ns:")
  ) {
    return normalized;
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeWriteMode(mode, revision) {
  const normalizedMode = readString(mode) || "add";
  if (normalizedMode === "add" || normalizedMode === "overwrite") {
    return normalizedMode;
  }
  if (normalizedMode === "update") {
    const normalizedRevision = readString(revision);
    if (!normalizedRevision) {
      throw invalidInput("Dropbox update uploads require the existing file revision.");
    }
    return { ".tag": "update", update: normalizedRevision };
  }
  throw invalidInput("Dropbox upload mode must be add, overwrite, or update.");
}

function readUploadContent(args) {
  if (typeof args.contentBase64 === "string" && args.contentBase64.trim()) {
    const normalized = args.contentBase64.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
      throw invalidInput("Dropbox upload contentBase64 is not valid base64.");
    }
    return Buffer.from(normalized, "base64");
  }
  if (typeof args.content === "string") {
    return Buffer.from(args.content, "utf8");
  }
  if (readString(args.contentPath)) {
    throw new DropboxConnectorError(
      "This remote connector cannot read a runner workspace path directly. Supply content or contentBase64.",
      {
        code: "connector_file_transfer_unavailable",
        statusCode: 422,
      },
    );
  }
  throw invalidInput("Dropbox upload_file requires content or contentBase64.");
}

function normalizeOptionalEnum(value, allowed, label) {
  const normalized = readString(value);
  if (!normalized) return undefined;
  if (allowed.includes(normalized)) return normalized;
  throw invalidInput(`${label} must be one of: ${allowed.join(", ")}.`);
}

function isSharedLinkAlreadyExists(error) {
  if (!(error instanceof DropboxConnectorError) || error.statusCode !== 409) {
    return false;
  }
  const provider = error.details?.provider;
  return (
    provider?.error?.[".tag"] === "shared_link_already_exists" ||
    String(provider?.error_summary || "").startsWith("shared_link_already_exists/")
  );
}

function readExistingSharedLinkMetadata(error) {
  const value =
    error?.details?.provider?.error?.shared_link_already_exists?.metadata ||
    error?.details?.provider?.error?.metadata;
  return isRecord(value) ? value : null;
}

function readDropboxError(payload, fallback) {
  if (typeof payload?.error_description === "string") {
    return payload.error_description.trim();
  }
  if (typeof payload?.error_summary === "string") {
    return payload.error_summary.replace(/\/+$/, "").trim();
  }
  if (typeof payload?.error === "string") {
    return payload.error.trim();
  }
  return String(fallback || "Dropbox request failed.");
}

async function readJsonResponse(response) {
  const text = await response.text().catch(() => "");
  return parseJson(text);
}

function parseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

function encodeDropboxApiArgument(value) {
  return JSON.stringify(value).replace(
    /[\u007f-\uffff]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

function isTextContentType(value) {
  const type = String(value || "").toLowerCase();
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    type.endsWith("+json") ||
    type === "application/xml" ||
    type.endsWith("+xml") ||
    type === "application/javascript"
  );
}

function readAccessToken(value) {
  return String(value?.accessToken || value?.access_token || "").trim();
}

function readRefreshToken(value) {
  return String(value?.refreshToken || value?.refresh_token || "").trim();
}

function readString(value) {
  return String(value ?? "").trim();
}

function compactObject(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== null && entry !== "",
    ),
  );
}

function clampInteger(value, minimum, maximum) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized)) return undefined;
  return Math.min(maximum, Math.max(minimum, normalized));
}

function normalizePositiveInteger(value, fallback) {
  const normalized = Math.floor(Number(value));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
