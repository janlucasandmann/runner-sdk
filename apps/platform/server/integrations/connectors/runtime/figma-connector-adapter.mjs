import {
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createOAuthCredentialRuntime,
  createProviderRequestError,
  defineRuntimeTools,
  encodePath,
  invalidInput,
  isRecord,
  normalizeOptionalEnum,
  numberSchema,
  objectSchema,
  readJsonResponse,
  readString,
  requireString,
  requireStringArray,
  stringArraySchema,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const FIGMA_API_ORIGIN = "https://api.figma.com";
const FIGMA_REFRESH_URL = "https://api.figma.com/v1/oauth/refresh";

const pagination = {
  cursor: stringSchema("Opaque Figma pagination cursor."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const TOOLS = defineRuntimeTools("Figma", [
  {
    name: "get_current_user",
    description: "Get the authenticated Figma user.",
  },
  {
    name: "get_file",
    description: "Get a Figma file document and metadata.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        version: stringSchema("Optional Figma version ID."),
        depth: stringSchema("Optional document traversal depth."),
      },
      ["fileKey"],
    ),
  },
  {
    name: "get_file_nodes",
    description: "Get selected nodes from a Figma file.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        nodeIds: stringArraySchema("Figma node IDs."),
        version: stringSchema("Optional Figma version ID."),
      },
      ["fileKey", "nodeIds"],
    ),
  },
  {
    name: "render_images",
    description: "Render selected Figma nodes as images.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        nodeIds: stringArraySchema("Figma node IDs."),
        format: stringSchema("Image format.", {
          enum: ["jpg", "png", "svg", "pdf"],
        }),
        scale: stringSchema("Image scale from 0.01 to 4."),
      },
      ["fileKey", "nodeIds"],
    ),
  },
  {
    name: "list_comments",
    description: "List comments on a Figma file.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        ...pagination,
      },
      ["fileKey"],
    ),
  },
  {
    name: "list_versions",
    description: "List versions of a Figma file.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        ...pagination,
      },
      ["fileKey"],
    ),
  },
  {
    name: "list_team_projects",
    description: "List projects in a Figma team.",
    inputSchema: objectSchema({ teamId: stringSchema("Figma team ID.") }, ["teamId"]),
  },
  {
    name: "list_project_files",
    description: "List files in a Figma project.",
    inputSchema: objectSchema({ projectId: stringSchema("Figma project ID.") }, ["projectId"]),
  },
  {
    name: "create_comment",
    access: "interactive",
    description: "Create a comment on a Figma file.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        message: stringSchema("Comment message."),
        nodeId: stringSchema("Optional node ID for the comment."),
        x: stringSchema("Optional canvas X coordinate."),
        y: stringSchema("Optional canvas Y coordinate."),
      },
      ["fileKey", "message"],
    ),
  },
  {
    name: "delete_comment",
    access: "interactive",
    description: "Delete a comment created by the authenticated Figma user.",
    inputSchema: objectSchema(
      {
        fileKey: stringSchema("Figma file key."),
        commentId: stringSchema("Figma comment ID."),
      },
      ["fileKey", "commentId"],
    ),
  },
  {
    name: "create_webhook",
    access: "interactive",
    description: "Create a Figma webhook for a team, project, or file.",
    inputSchema: objectSchema(
      {
        eventType: stringSchema("Figma webhook event type."),
        contextType: stringSchema("Webhook context type.", {
          enum: ["team", "project", "file"],
        }),
        contextId: stringSchema("Figma context ID."),
        endpoint: stringSchema("HTTPS webhook endpoint."),
        passcode: stringSchema("Webhook passcode."),
      },
      ["eventType", "contextType", "contextId", "endpoint", "passcode"],
    ),
  },
]);

export function createFigmaConnectorAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const credentials = createOAuthCredentialRuntime({
    provider: "figma",
    clientIdEnv: "FIGMA_OAUTH_CLIENT_ID",
    clientSecretEnv: "FIGMA_OAUTH_CLIENT_SECRET",
    tokenUrl: FIGMA_REFRESH_URL,
    tokenAuth: "basic",
    includeRefreshGrantType: false,
    ...options,
    fetchImpl,
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    return credentials.invoke(grant, ({ accessToken }) =>
      invokeFigmaAction(createFigmaClient({ accessToken, fetchImpl }), definition.name, args),
    );
  }

  return Object.freeze({
    id: "figma",
    aliases: Object.freeze(["figma"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeFigmaAction(client, name, args) {
  switch (name) {
    case "get_current_user":
      return client.request("/v1/me");
    case "get_file":
      return client.request(
        `/v1/files/${encodePath(requireString(args.fileKey, "Figma fileKey"))}`,
        {
          query: compactObject({
            version: readString(args.version),
            depth: normalizeDepth(args.depth),
          }),
        },
      );
    case "get_file_nodes":
      return client.request(
        `/v1/files/${encodePath(requireString(args.fileKey, "Figma fileKey"))}/nodes`,
        {
          query: compactObject({
            ids: requireStringArray(args.nodeIds, "Figma nodeIds").join(","),
            version: readString(args.version),
          }),
        },
      );
    case "render_images":
      return client.request(
        `/v1/images/${encodePath(requireString(args.fileKey, "Figma fileKey"))}`,
        {
          query: compactObject({
            ids: requireStringArray(args.nodeIds, "Figma nodeIds").join(","),
            format:
              normalizeOptionalEnum(
                args.format,
                ["jpg", "png", "svg", "pdf"],
                "Figma image format",
              ) || "png",
            scale: normalizeScale(args.scale),
          }),
        },
      );
    case "list_comments": {
      const payload = await client.request(
        `/v1/files/${encodePath(requireString(args.fileKey, "Figma fileKey"))}/comments`,
      );
      return paginateStaticItems(Array.isArray(payload?.comments) ? payload.comments : [], args);
    }
    case "list_versions": {
      const payload = await client.request(
        `/v1/files/${encodePath(requireString(args.fileKey, "Figma fileKey"))}/versions`,
        {
          query: compactObject({
            page_size: clampInteger(args.limit, 1, 100, 50),
            before: normalizeVersionCursor(args.cursor),
          }),
        },
      );
      const cursor = readVersionCursor(payload?.pagination);
      return {
        items: Array.isArray(payload?.versions) ? payload.versions : [],
        cursor,
        hasMore: Boolean(cursor),
      };
    }
    case "list_team_projects":
      return client.request(
        `/v1/teams/${encodePath(requireString(args.teamId, "Figma teamId"))}/projects`,
      );
    case "list_project_files":
      return client.request(
        `/v1/projects/${encodePath(requireString(args.projectId, "Figma projectId"))}/files`,
      );
    case "create_comment":
      return client.request(
        `/v1/files/${encodePath(requireString(args.fileKey, "Figma fileKey"))}/comments`,
        {
          method: "POST",
          body: compactObject({
            message: requireString(args.message, "Figma comment message"),
            client_meta: createCommentClientMeta(args),
          }),
        },
      );
    case "delete_comment":
      return client.request(
        `/v1/files/${encodePath(
          requireString(args.fileKey, "Figma fileKey"),
        )}/comments/${encodePath(requireString(args.commentId, "Figma commentId"))}`,
        { method: "DELETE" },
      );
    case "create_webhook":
      return client.request("/v2/webhooks", {
        method: "POST",
        body: {
          event_type: requireString(args.eventType, "Figma webhook eventType").toUpperCase(),
          context: normalizeOptionalEnum(
            requireString(args.contextType, "Figma webhook contextType").toLowerCase(),
            ["team", "project", "file"],
            "Figma webhook contextType",
          ),
          context_id: requireString(args.contextId, "Figma webhook contextId"),
          endpoint: normalizeHttpsUrl(args.endpoint),
          passcode: requireString(args.passcode, "Figma webhook passcode"),
        },
      });
    default:
      throw unknownAction();
  }
}

function createFigmaClient({ accessToken, fetchImpl }) {
  async function request(pathname, { method = "GET", query, body } = {}) {
    const url = new URL(pathname, FIGMA_API_ORIGIN);
    Object.entries(compactObject(query || {})).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    const response = await fetchImpl(url, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok || payload?.err) {
      throw createProviderRequestError("figma", response, payload);
    }
    return payload;
  }
  return Object.freeze({ request });
}

function createCommentClientMeta(args) {
  const nodeId = readString(args.nodeId);
  const x = normalizeCoordinate(args.x, "x");
  const y = normalizeCoordinate(args.y, "y");
  if (nodeId) {
    return compactObject({
      node_id: nodeId,
      node_offset:
        x === undefined && y === undefined
          ? undefined
          : {
              x: x ?? 0,
              y: y ?? 0,
            },
    });
  }
  if (x !== undefined || y !== undefined) {
    return {
      x: x ?? 0,
      y: y ?? 0,
    };
  }
  return undefined;
}

function normalizeCoordinate(value, axis) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw invalidInput(`Figma comment ${axis} must be a number.`);
  }
  return normalized;
}

function normalizeDepth(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized) || normalized < 1 || normalized > 99) {
    throw invalidInput("Figma depth must be an integer from 1 to 99.");
  }
  return normalized;
}

function normalizeScale(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0.01 || normalized > 4) {
    throw invalidInput("Figma image scale must be between 0.01 and 4.");
  }
  return normalized;
}

function normalizeVersionCursor(value) {
  const cursor = readString(value);
  if (!cursor) return undefined;
  if (!cursor.includes("://")) return cursor;
  let url;
  try {
    url = new URL(cursor);
  } catch {
    throw invalidInput("Figma version cursor is invalid.");
  }
  if (url.origin !== FIGMA_API_ORIGIN || url.username || url.password) {
    throw invalidInput("Figma version cursor does not belong to Figma.");
  }
  return requireString(url.searchParams.get("before"), "Figma version cursor");
}

function readVersionCursor(pagination) {
  const direct = readString(pagination?.before);
  if (direct) return direct;
  const nextPage = readString(pagination?.next_page);
  if (!nextPage) return "";
  return normalizeVersionCursor(nextPage);
}

function normalizeHttpsUrl(value) {
  let url;
  try {
    url = new URL(requireString(value, "Figma webhook endpoint"));
  } catch {
    throw invalidInput("Figma webhook endpoint must be a valid HTTPS URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw invalidInput("Figma webhook endpoint must be a valid HTTPS URL.");
  }
  return url.toString();
}

function paginateStaticItems(items, args) {
  const start = clampInteger(args.cursor, 0, Number.MAX_SAFE_INTEGER, 0);
  const limit = clampInteger(args.limit, 1, 100, 50);
  const selected = items.slice(start, start + limit);
  const next = start + selected.length;
  return {
    items: selected,
    cursor: next < items.length ? String(next) : "",
    hasMore: next < items.length,
  };
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown Figma action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
