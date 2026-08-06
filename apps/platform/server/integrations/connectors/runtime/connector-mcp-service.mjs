const MCP_PATH = "/api/aios/connectors/mcp";
// A 20 MiB binary payload expands to roughly 26.7 MiB when transported as
// base64 JSON. Keep the connector cap below Cloud Run's 32 MiB HTTP/1 request
// limit while allowing the runtime's documented inline upload maximum.
const MAX_REQUEST_BYTES = 28 * 1024 * 1024;
const SUPPORTED_PROTOCOL_VERSIONS = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";

export function createConnectorMcpService({
  grantService,
  adapterRegistry,
  logger = console,
} = {}) {
  if (typeof grantService?.verify !== "function") {
    throw new TypeError("Connector MCP service requires a grant service.");
  }
  if (typeof adapterRegistry?.get !== "function") {
    throw new TypeError("Connector MCP service requires an adapter registry.");
  }

  function handleRequest(req, res, url) {
    if (url.pathname !== MCP_PATH) return false;
    void handleConnectorMcpRequest({
      req,
      res,
      grantService,
      adapterRegistry,
      logger,
    });
    return true;
  }

  return Object.freeze({
    handleRequest,
    path: MCP_PATH,
  });
}

async function handleConnectorMcpRequest({ req, res, grantService, adapterRegistry, logger }) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(
      res,
      405,
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32600,
          message: "Connector MCP uses stateless HTTP POST requests.",
        },
      },
      { Allow: "POST, OPTIONS" },
    );
    return;
  }

  let grant;
  try {
    grant = await grantService.verify(readBearerToken(req));
  } catch (error) {
    sendJson(res, Number(error?.statusCode) || 401, {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32001,
        message: "The connector runtime grant is invalid or expired.",
        data: { code: String(error?.code || "connector_grant_invalid") },
      },
    });
    return;
  }

  const adapter = adapterRegistry.get(grant.provider) || adapterRegistry.get(grant.connectorId);
  if (!adapter) {
    sendJson(res, 501, {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32002,
        message: `No runtime adapter is available for ${grant.connectorId}.`,
      },
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, Number(error?.statusCode) || 400, {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: error instanceof Error ? error.message : "Invalid JSON.",
      },
    });
    return;
  }

  const requests = Array.isArray(body) ? body : [body];
  const responses = [];
  for (const request of requests) {
    const response = await handleJsonRpcRequest({
      request,
      grant,
      adapter,
      logger,
    });
    if (response) responses.push(response);
  }
  if (!responses.length) {
    res.writeHead(202, {
      "Cache-Control": "no-store",
      "Content-Length": "0",
    });
    res.end();
    return;
  }
  sendJson(res, 200, Array.isArray(body) ? responses : responses[0]);
}

async function handleJsonRpcRequest({ request, grant, adapter, logger }) {
  if (!isRecord(request) || request.jsonrpc !== "2.0") {
    return rpcError(request?.id ?? null, -32600, "Invalid JSON-RPC request.");
  }
  const id = request.id;
  const method = String(request.method || "");
  if (!method) return rpcError(id ?? null, -32600, "Method is required.");

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return id === undefined ? null : rpcResult(id, {});
  }
  if (id === undefined) return null;

  if (method === "initialize") {
    const requestedVersion = String(request.params?.protocolVersion || "");
    return rpcResult(id, {
      protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion)
        ? requestedVersion
        : DEFAULT_PROTOCOL_VERSION,
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: {
        name: `computer-agents-${grant.connectorId}`,
        version: "1.0.0",
      },
      instructions:
        `Use these ${grant.connectorId} tools directly with the credentials already selected for this thread. ` +
        "Never ask the user for API tokens or claim that the connector is not configured.",
    });
  }
  if (method === "ping") return rpcResult(id, {});
  if (method === "tools/list") {
    const actionIds = [...grant.allowedActions, ...grant.approvalRequiredActions];
    const approvalRequired = new Set(grant.approvalRequiredActions);
    try {
      const definitions = await adapter.listTools(actionIds, { grant });
      return rpcResult(id, {
        tools: definitions.map((definition) => ({
          ...definition,
          ...(approvalRequired.has(definition.name)
            ? {
                description: `${definition.description} This action requires explicit approval before execution.`,
              }
            : {}),
        })),
      });
    } catch (error) {
      logger?.warn?.("[connector-mcp] Connector tool discovery failed", {
        threadId: grant.threadId,
        organizationId: grant.organizationId,
        connectorId: grant.connectorId,
        credentialId: grant.credentialId,
        code: String(error?.code || "connector_tool_discovery_failed"),
        statusCode: Number(error?.statusCode) || 500,
        message: error instanceof Error ? error.message : String(error),
      });
      return rpcError(
        id,
        -32003,
        error instanceof Error
          ? error.message
          : "Connector tool discovery failed.",
        { code: String(error?.code || "connector_tool_discovery_failed") },
      );
    }
  }
  if (method !== "tools/call") {
    return rpcError(id, -32601, `Unsupported MCP method: ${method}`);
  }

  const requestedToolName = String(request.params?.name || "").trim();
  const toolName = resolveSignedConnectorAction(grant, requestedToolName);
  const allowed = new Set(grant.allowedActions);
  const approvalRequired = new Set(grant.approvalRequiredActions);
  if (!toolName) {
    return rpcResult(
      id,
      toolError(
        "This connector action is not permitted for the current user, agent, project, and credential.",
        "connector_action_denied",
      ),
    );
  }
  if (approvalRequired.has(toolName)) {
    return rpcResult(
      id,
      toolError(
        "This action requires explicit approval. No approval was supplied, so it was not executed.",
        "connector_approval_required",
      ),
    );
  }
  if (!allowed.has(toolName)) {
    return rpcResult(
      id,
      toolError(
        "This connector action is not permitted for the current user, agent, project, and credential.",
        "connector_action_denied",
      ),
    );
  }

  try {
    const toolDefinition = (await adapter.listTools([toolName], { grant }))
      .find((definition) => definition?.name === toolName);
    const toolArguments = normalizeConnectorToolArguments(
      request.params?.arguments,
      toolDefinition?.inputSchema,
    );
    const result = await adapter.invoke({
      grant,
      name: toolName,
      arguments: toolArguments,
    });
    logger?.info?.("[connector-mcp] Connector action completed", {
      threadId: grant.threadId,
      organizationId: grant.organizationId,
      connectorId: grant.connectorId,
      credentialId: grant.credentialId,
      credentialSource: grant.credentialSource,
      action: toolName,
    });
    return rpcResult(id, toolSuccess(result));
  } catch (error) {
    logger?.warn?.("[connector-mcp] Connector action failed", {
      threadId: grant.threadId,
      organizationId: grant.organizationId,
      connectorId: grant.connectorId,
      credentialId: grant.credentialId,
      action: toolName,
      code: String(error?.code || "connector_action_failed"),
      statusCode: Number(error?.statusCode) || 500,
      message: error instanceof Error ? error.message : String(error),
    });
    return rpcResult(
      id,
      toolError(
        error instanceof Error ? error.message : "Connector action failed.",
        String(error?.code || "connector_action_failed"),
        error?.details,
      ),
    );
  }
}

function semanticActionName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function resolveSignedConnectorAction(grant, requestedAction) {
  const signedActions = [...new Set([
    ...(Array.isArray(grant?.allowedActions) ? grant.allowedActions : []),
    ...(Array.isArray(grant?.approvalRequiredActions) ? grant.approvalRequiredActions : []),
  ])];
  if (signedActions.includes(requestedAction)) return requestedAction;
  const semanticName = semanticActionName(requestedAction);
  const matches = signedActions.filter(
    (actionName) => semanticActionName(actionName) === semanticName,
  );
  return matches.length === 1 ? matches[0] : "";
}

function normalizeConnectorToolArguments(value, inputSchema) {
  if (!isRecord(value)) return value;
  const keys = Object.keys(value);
  const schemaDeclaresRaw = isRecord(inputSchema?.properties)
    && Object.hasOwn(inputSchema.properties, "raw");
  if (
    schemaDeclaresRaw
    || keys.length !== 1
    || keys[0] !== "raw"
    || typeof value.raw !== "string"
  ) {
    return value;
  }

  const raw = value.raw.trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const repaired = repairOmittedObjectValues(raw);
    try {
      parsed = repaired ? JSON.parse(repaired) : null;
    } catch {
      parsed = null;
    }
  }
  if (isRecord(parsed)) return parsed;

  const error = new Error("Connector tool arguments must be a valid JSON object.");
  error.code = "connector_arguments_invalid";
  error.statusCode = 400;
  throw error;
}

function repairOmittedObjectValues(raw) {
  let inString = false;
  let escaped = false;
  let changed = false;
  let segmentStart = 0;
  let repaired = "";

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character !== ":") continue;

    let nextIndex = index + 1;
    while (nextIndex < raw.length && /\s/.test(raw[nextIndex])) nextIndex += 1;
    if (raw[nextIndex] !== "," && raw[nextIndex] !== "}") continue;
    repaired += `${raw.slice(segmentStart, nextIndex)}null`;
    segmentStart = nextIndex;
    changed = true;
  }

  return changed ? `${repaired}${raw.slice(segmentStart)}` : "";
}

function toolSuccess(value) {
  const structuredContent = normalizeStructuredContent(value);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent, null, 2),
      },
    ],
    structuredContent,
    isError: false,
  };
}

function toolError(message, code, details) {
  const structuredContent = {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
  return {
    content: [
      {
        type: "text",
        text: `${message} (${code})`,
      },
    ],
    structuredContent,
    isError: true,
  };
}

function normalizeStructuredContent(value) {
  if (isRecord(value)) return value;
  if (Array.isArray(value)) return { items: value };
  return { value: value ?? null };
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

function readBearerToken(req) {
  const header =
    typeof req?.headers?.get === "function"
      ? req.headers.get("authorization")
      : req?.headers?.authorization;
  const match = String(header || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function readJsonBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) {
      const error = new Error("Connector MCP request is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) throw new Error("Connector MCP request body is required.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Connector MCP request body must be valid JSON.");
  }
}

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
