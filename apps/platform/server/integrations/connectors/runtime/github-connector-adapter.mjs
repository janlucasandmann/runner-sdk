import {
  resolveConnectorCredentialForOrganization,
} from "../../connector-oauth-core.mjs";
import {
  ConnectorRuntimeError,
  isRecord,
  readString,
} from "./connector-runtime-utils.mjs";
import {
  GITHUB_RUNTIME_CAPABILITIES,
  GITHUB_RUNTIME_CAPABILITY_BY_ID,
} from "./github-connector-capabilities.mjs";

const DEFAULT_GITHUB_MCP_ENDPOINT = "https://api.githubcopilot.com/mcp/";
const MCP_PROTOCOL_VERSION = "2025-06-18";
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const TOOL_CACHE_TTL_MS = 5 * 60_000;

export function createGithubConnectorAdapter({
  fetchImpl = globalThis.fetch,
  envFileCandidates = [],
  resolveCredential = resolveConnectorCredentialForOrganization,
  endpoint = DEFAULT_GITHUB_MCP_ENDPOINT,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  now = () => Date.now(),
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("GitHub connector adapter requires fetch.");
  }
  if (typeof resolveCredential !== "function") {
    throw new TypeError(
      "GitHub connector adapter requires a credential resolver.",
    );
  }
  const remoteEndpoint = normalizeRemoteEndpoint(endpoint);
  const toolCache = new Map();

  function listCapabilities() {
    return GITHUB_RUNTIME_CAPABILITIES;
  }

  async function listTools(actionIds, context = {}) {
    const requestedActions = normalizeActionIds(actionIds);
    if (!requestedActions.length) return [];
    const grant = context.grant;
    if (!isRecord(grant)) {
      return requestedActions.map(createFallbackToolDefinition);
    }

    const credential = await resolveGithubCredential(
      grant,
      resolveCredential,
      envFileCandidates,
    );
    const cachePrefix = createToolCachePrefix(grant, credential);
    const cached = [];
    const missing = [];
    for (const actionId of requestedActions) {
      const entry = toolCache.get(`${cachePrefix}:${actionId}`);
      if (entry && entry.expiresAt > now()) {
        cached.push(entry.definition);
      } else {
        missing.push(actionId);
      }
    }

    if (missing.length) {
      const result = await requestGithubMcp({
        fetchImpl,
        endpoint: remoteEndpoint,
        accessToken: credential.token.accessToken,
        actionIds: requestedActions,
        method: "tools/list",
        params: {},
        requestTimeoutMs,
      });
      const returnedTools = Array.isArray(result?.tools) ? result.tools : [];
      for (const rawTool of returnedTools) {
        const definition = normalizeRemoteToolDefinition(rawTool);
        if (!definition || !requestedActions.includes(definition.name)) {
          continue;
        }
        toolCache.set(`${cachePrefix}:${definition.name}`, {
          definition,
          expiresAt: now() + TOOL_CACHE_TTL_MS,
        });
      }
    }

    return requestedActions.flatMap((actionId) => {
      const entry = toolCache.get(`${cachePrefix}:${actionId}`);
      return entry && entry.expiresAt > now() ? [entry.definition] : [];
    });
  }

  async function invoke({ grant, name, arguments: toolArguments }) {
    const actionId = normalizeActionId(name);
    if (!actionId) {
      throw new ConnectorRuntimeError("Unsupported GitHub connector action.", {
        code: "connector_action_unknown",
        statusCode: 400,
      });
    }
    const credential = await resolveGithubCredential(
      grant,
      resolveCredential,
      envFileCandidates,
    );
    const result = await requestGithubMcp({
      fetchImpl,
      endpoint: remoteEndpoint,
      accessToken: credential.token.accessToken,
      actionIds: [actionId],
      method: "tools/call",
      params: {
        name: actionId,
        arguments: isRecord(toolArguments) ? toolArguments : {},
      },
      requestTimeoutMs,
    });
    if (result?.isError === true) {
      throw new ConnectorRuntimeError(readRemoteToolError(result), {
        code: readString(result?.structuredContent?.error?.code)
          || "github_tool_failed",
        statusCode: 422,
      });
    }
    return normalizeRemoteToolResult(result);
  }

  return Object.freeze({
    id: "github",
    aliases: Object.freeze(["github"]),
    invoke,
    listCapabilities,
    listTools,
  });
}

async function resolveGithubCredential(
  grant,
  resolveCredential,
  envFileCandidates,
) {
  const credential = await resolveCredential({
    provider: "github",
    organizationId: grant?.organizationId,
    credentialId: grant?.credentialId,
    requestingUserId: grant?.actorUserId,
    envFileCandidates,
    encryptionKeyNames: [
      "GITHUB_TOKEN_ENCRYPTION_KEY",
      "CONNECTOR_TOKEN_ENCRYPTION_KEY",
    ],
  });
  if (!credential || !readString(credential.token?.accessToken)) {
    throw new ConnectorRuntimeError(
      "The selected GitHub credential is unavailable.",
      {
        code: "connector_credentials_required",
        statusCode: 401,
      },
    );
  }
  return credential;
}

async function requestGithubMcp({
  fetchImpl,
  endpoint,
  accessToken,
  actionIds,
  method,
  params,
  requestTimeoutMs,
}) {
  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
        "X-MCP-Tools": actionIds.join(","),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `github-${method.replaceAll("/", "-")}`,
        method,
        params,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    throw new ConnectorRuntimeError(
      error?.name === "TimeoutError"
        ? "The GitHub connector request timed out."
        : "The GitHub connector service is unavailable.",
      {
        code: error?.name === "TimeoutError"
          ? "connector_provider_timeout"
          : "connector_provider_unavailable",
        statusCode: 502,
      },
    );
  }

  const text = await response.text().catch(() => "");
  const payload = parseMcpResponse(text);
  if (!response.ok) {
    throw new ConnectorRuntimeError(
      response.status === 401 || response.status === 403
        ? "GitHub rejected the connected account. Reconnect GitHub to continue."
        : "GitHub could not complete the connector request.",
      {
        code: response.status === 401 || response.status === 403
          ? "connector_provider_access_denied"
          : "connector_provider_request_failed",
        statusCode: response.status,
      },
    );
  }
  if (isRecord(payload?.error)) {
    throw new ConnectorRuntimeError(
      readString(payload.error.message)
        || "GitHub could not complete the connector request.",
      {
        code: "connector_provider_request_failed",
        statusCode: 502,
      },
    );
  }
  if (!isRecord(payload) || !Object.hasOwn(payload, "result")) {
    throw new ConnectorRuntimeError(
      "GitHub returned an invalid connector response.",
      {
        code: "connector_provider_response_invalid",
        statusCode: 502,
      },
    );
  }
  return payload.result;
}

function parseMcpResponse(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return {};
  try {
    return JSON.parse(normalized);
  } catch {}

  const events = normalized.split(/\r?\n\r?\n/);
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const data = events[index]
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trim())
      .join("\n");
    if (!data || data === "[DONE]") continue;
    try {
      return JSON.parse(data);
    } catch {}
  }
  return {};
}

function normalizeRemoteToolDefinition(value) {
  if (!isRecord(value)) return null;
  const name = normalizeActionId(value.name);
  if (!name) return null;
  const capability = GITHUB_RUNTIME_CAPABILITY_BY_ID.get(name);
  return Object.freeze({
    name,
    access: capability.access,
    description: `${readString(value.description) || `Use GitHub ${name}.`} Uses the GitHub credential already selected for this thread; do not ask the user for credentials.`,
    inputSchema: isRecord(value.inputSchema)
      ? value.inputSchema
      : { type: "object", additionalProperties: true },
  });
}

function createFallbackToolDefinition(actionId) {
  const capability = GITHUB_RUNTIME_CAPABILITY_BY_ID.get(actionId);
  return Object.freeze({
    name: actionId,
    access: capability.access,
    description: `Use the GitHub ${actionId} capability with the credential already selected for this thread.`,
    inputSchema: { type: "object", additionalProperties: true },
  });
}

function normalizeActionIds(value) {
  const candidates = Array.isArray(value)
    ? value
    : GITHUB_RUNTIME_CAPABILITIES.map((capability) => capability.id);
  return [...new Set(candidates.map(normalizeActionId).filter(Boolean))];
}

function normalizeActionId(value) {
  const actionId = readString(value);
  return GITHUB_RUNTIME_CAPABILITY_BY_ID.has(actionId) ? actionId : "";
}

function normalizeRemoteToolResult(result) {
  if (isRecord(result?.structuredContent)) return result.structuredContent;
  const content = Array.isArray(result?.content) ? result.content : [];
  if (content.length === 1 && content[0]?.type === "text") {
    const text = readString(content[0].text);
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }
  return isRecord(result) ? result : { result };
}

function readRemoteToolError(result) {
  const structuredMessage = readString(
    result?.structuredContent?.error?.message,
  );
  if (structuredMessage) return structuredMessage;
  const textBlock = Array.isArray(result?.content)
    ? result.content.find((item) => item?.type === "text")
    : null;
  return readString(textBlock?.text) || "GitHub could not complete the action.";
}

function createToolCachePrefix(grant, credential) {
  return [
    readString(grant?.organizationId),
    readString(credential?.credentialId || grant?.credentialId),
  ].join(":");
}

function normalizeRemoteEndpoint(value) {
  let url;
  try {
    url = new URL(readString(value));
  } catch {
    throw new TypeError("GitHub MCP endpoint is invalid.");
  }
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new TypeError("GitHub MCP endpoint must use HTTP or HTTPS.");
  }
  return url.toString();
}
