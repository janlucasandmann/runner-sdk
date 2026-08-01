import {
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createOAuthCredentialRuntime,
  createProviderRequestError,
  defineRuntimeTools,
  invalidInput,
  isRecord,
  mergeDefaultRefreshPayload,
  numberSchema,
  objectSchema,
  readInlineContent,
  readJsonResponse,
  readString,
  requireString,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const SLACK_API_ORIGIN = "https://slack.com";
const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access";

const pagination = {
  cursor: stringSchema("Opaque Slack pagination cursor."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const TOOLS = defineRuntimeTools("Slack", [
  {
    name: "get_authenticated_user",
    description: "Get the authenticated Slack user and workspace.",
  },
  {
    name: "list_channels",
    description: "List Slack channels visible to the connected user.",
    inputSchema: objectSchema({
      types: stringSchema("Comma-separated Slack conversation types."),
      ...pagination,
    }),
  },
  {
    name: "get_channel_history",
    description: "Read recent messages from a Slack channel.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel ID."),
        oldest: stringSchema("Optional oldest message timestamp."),
        latest: stringSchema("Optional latest message timestamp."),
        ...pagination,
      },
      ["channelId"],
    ),
  },
  {
    name: "get_thread_replies",
    description: "Read replies in a Slack message thread.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel ID."),
        threadTs: stringSchema("Parent message timestamp."),
        ...pagination,
      },
      ["channelId", "threadTs"],
    ),
  },
  {
    name: "search_messages",
    description: "Search Slack messages visible to the connected user.",
    inputSchema: objectSchema(
      {
        query: stringSchema("Slack search query."),
        ...pagination,
      },
      ["query"],
    ),
  },
  {
    name: "list_users",
    description: "List users in the connected Slack workspace.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "post_message",
    access: "interactive",
    description: "Post a message to a Slack channel or direct message.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel or conversation ID."),
        text: stringSchema("Message text."),
        threadTs: stringSchema("Optional parent timestamp for a thread reply."),
      },
      ["channelId", "text"],
    ),
  },
  {
    name: "update_message",
    access: "interactive",
    description: "Update a message posted by the connected Slack app.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel ID."),
        messageTs: stringSchema("Message timestamp."),
        text: stringSchema("Updated message text."),
      },
      ["channelId", "messageTs", "text"],
    ),
  },
  {
    name: "delete_message",
    access: "interactive",
    description: "Delete a message posted by the connected Slack app.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel ID."),
        messageTs: stringSchema("Message timestamp."),
      },
      ["channelId", "messageTs"],
    ),
  },
  {
    name: "upload_file",
    access: "interactive",
    description: "Upload supplied file content using Slack's external upload flow.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Destination Slack channel ID."),
        filename: stringSchema("Destination file name."),
        content: stringSchema("UTF-8 text content to upload."),
        contentBase64: stringSchema("Base64-encoded binary content to upload."),
        filePath: stringSchema("Workspace path for clients with a file-transfer bridge."),
        title: stringSchema("Optional file title."),
        initialComment: stringSchema("Optional message accompanying the file."),
        threadTs: stringSchema("Optional parent timestamp for a thread upload."),
      },
      ["channelId", "filename"],
      {
        oneOf: [{ required: ["content"] }, { required: ["contentBase64"] }],
      },
    ),
  },
  {
    name: "add_reaction",
    access: "interactive",
    description: "Add an emoji reaction to a Slack message.",
    inputSchema: objectSchema(
      {
        channelId: stringSchema("Slack channel ID."),
        messageTs: stringSchema("Message timestamp."),
        name: stringSchema("Emoji name without colons."),
      },
      ["channelId", "messageTs", "name"],
    ),
  },
]);

export function createSlackConnectorAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const runtimeOptions = {
    provider: "slack",
    clientIdEnv: "SLACK_OAUTH_CLIENT_ID",
    clientSecretEnv: "SLACK_OAUTH_CLIENT_SECRET",
    tokenUrl: SLACK_TOKEN_URL,
    validateRefreshPayload: (payload) =>
      payload?.ok === true && Boolean(readString(payload?.access_token)),
    ...options,
    fetchImpl,
  };
  const botCredentials = createOAuthCredentialRuntime(runtimeOptions);
  const userCredentials = createOAuthCredentialRuntime({
    ...runtimeOptions,
    tokenSlot: {
      id: "user",
      readAccessToken: (token) => readString(token?.userAccessToken || token?.user_access_token),
      readRefreshToken: (token) => readString(token?.userRefreshToken || token?.user_refresh_token),
      readExpiresAt: (token) => Number(token?.userExpiresAt || token?.user_expires_at || 0),
      mergeRefreshPayload: mergeSlackUserRefreshPayload,
    },
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    const runtime = definition.name === "search_messages" ? userCredentials : botCredentials;
    return runtime.invoke(grant, ({ accessToken }) =>
      invokeSlackAction(createSlackClient({ accessToken, fetchImpl }), definition.name, args),
    );
  }

  return Object.freeze({
    id: "slack",
    aliases: Object.freeze(["slack"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeSlackAction(client, name, args) {
  switch (name) {
    case "get_authenticated_user":
      return client.api("auth.test");
    case "list_channels":
      return normalizeSlackCollection(
        await client.api("conversations.list", {
          query: compactObject({
            types: readString(args.types) || "public_channel,private_channel,mpim,im",
            cursor: readString(args.cursor),
            limit: clampInteger(args.limit, 1, 100, 100),
            exclude_archived: true,
          }),
        }),
        "channels",
      );
    case "get_channel_history":
      return normalizeSlackCollection(
        await client.api("conversations.history", {
          query: compactObject({
            channel: requireString(args.channelId, "Slack channelId"),
            oldest: readString(args.oldest),
            latest: readString(args.latest),
            cursor: readString(args.cursor),
            limit: clampInteger(args.limit, 1, 100, 100),
            inclusive: true,
          }),
        }),
        "messages",
      );
    case "get_thread_replies":
      return normalizeSlackCollection(
        await client.api("conversations.replies", {
          query: compactObject({
            channel: requireString(args.channelId, "Slack channelId"),
            ts: requireString(args.threadTs, "Slack threadTs"),
            cursor: readString(args.cursor),
            limit: clampInteger(args.limit, 1, 100, 100),
          }),
        }),
        "messages",
      );
    case "search_messages": {
      const payload = await client.api("search.messages", {
        query: compactObject({
          query: requireString(args.query, "Slack search query"),
          cursor: readString(args.cursor),
          count: clampInteger(args.limit, 1, 100, 100),
          sort: "timestamp",
          sort_dir: "desc",
        }),
      });
      const matches = Array.isArray(payload?.messages?.matches) ? payload.messages.matches : [];
      return {
        items: matches,
        cursor: readString(
          payload?.messages?.pagination?.next_cursor || payload?.response_metadata?.next_cursor,
        ),
        hasMore: Boolean(
          payload?.messages?.pagination?.next_cursor || payload?.response_metadata?.next_cursor,
        ),
        total: Number(payload?.messages?.total || matches.length),
      };
    }
    case "list_users":
      return normalizeSlackCollection(
        await client.api("users.list", {
          query: compactObject({
            cursor: readString(args.cursor),
            limit: clampInteger(args.limit, 1, 100, 100),
          }),
        }),
        "members",
      );
    case "post_message":
      return client.api("chat.postMessage", {
        method: "POST",
        body: compactObject({
          channel: requireString(args.channelId, "Slack channelId"),
          text: requireString(args.text, "Slack message text"),
          thread_ts: readString(args.threadTs),
        }),
      });
    case "update_message":
      return client.api("chat.update", {
        method: "POST",
        body: {
          channel: requireString(args.channelId, "Slack channelId"),
          ts: requireString(args.messageTs, "Slack messageTs"),
          text: requireString(args.text, "Slack message text"),
        },
      });
    case "delete_message":
      return client.api("chat.delete", {
        method: "POST",
        body: {
          channel: requireString(args.channelId, "Slack channelId"),
          ts: requireString(args.messageTs, "Slack messageTs"),
        },
      });
    case "upload_file":
      return client.upload({
        channelId: requireString(args.channelId, "Slack channelId"),
        filename: normalizeFilename(args.filename),
        content: readInlineContent(args, {
          textKey: "content",
          base64Key: "contentBase64",
          pathKey: "filePath",
          provider: "slack",
        }),
        title: readString(args.title),
        initialComment: readString(args.initialComment),
        threadTs: readString(args.threadTs),
      });
    case "add_reaction":
      return client.api("reactions.add", {
        method: "POST",
        body: {
          channel: requireString(args.channelId, "Slack channelId"),
          timestamp: requireString(args.messageTs, "Slack messageTs"),
          name: normalizeEmojiName(args.name),
        },
      });
    default:
      throw unknownAction();
  }
}

function createSlackClient({ accessToken, fetchImpl }) {
  async function api(methodName, { method = "GET", query, body } = {}) {
    const url = new URL(`/api/${methodName}`, SLACK_API_ORIGIN);
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
    if (!response.ok || payload?.ok !== true) {
      throw slackRequestError(response, payload);
    }
    return payload;
  }

  async function upload({ channelId, filename, content, title, initialComment, threadTs }) {
    const ticket = await api("files.getUploadURLExternal", {
      method: "POST",
      body: {
        filename,
        length: content.byteLength,
      },
    });
    const uploadUrl = normalizeSlackUploadUrl(ticket?.upload_url);
    const fileId = requireString(ticket?.file_id, "Slack upload file ID");
    const uploadResponse = await fetchImpl(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(content.byteLength),
      },
      body: content,
      cache: "no-store",
    });
    if (!uploadResponse.ok) {
      throw createProviderRequestError(
        "slack",
        uploadResponse,
        await readJsonResponse(uploadResponse),
        "Slack rejected the external file upload.",
      );
    }
    return api("files.completeUploadExternal", {
      method: "POST",
      body: compactObject({
        files: [
          compactObject({
            id: fileId,
            title,
          }),
        ],
        channel_id: channelId,
        initial_comment: initialComment,
        thread_ts: threadTs,
      }),
    });
  }

  return Object.freeze({ api, upload });
}

function slackRequestError(response, payload) {
  const errorCode = readString(payload?.error).toLowerCase();
  const statusCode =
    response?.status === 429 || errorCode === "ratelimited"
      ? 429
      : [
            "invalid_auth",
            "not_authed",
            "token_expired",
            "token_revoked",
            "account_inactive",
          ].includes(errorCode)
        ? 401
        : Number(response?.status) >= 400
          ? Number(response.status)
          : 502;
  return new ConnectorRuntimeError(
    errorCode ? `Slack request failed: ${errorCode}.` : "Slack request failed.",
    {
      code:
        statusCode === 401
          ? "connector_provider_access_denied"
          : statusCode === 429
            ? "connector_provider_rate_limited"
            : "connector_provider_request_failed",
      statusCode,
      details: {
        providerError: errorCode,
        needed: readString(payload?.needed),
        provided: readString(payload?.provided),
        retryAfter: response?.headers?.get?.("retry-after") || undefined,
      },
    },
  );
}

function mergeSlackUserRefreshPayload(previousToken, payload, now) {
  const refreshed = mergeDefaultRefreshPayload({}, payload, now);
  const accessToken = readString(refreshed.accessToken || refreshed.access_token);
  const refreshToken = readString(
    refreshed.refreshToken ||
      refreshed.refresh_token ||
      previousToken?.userRefreshToken ||
      previousToken?.user_refresh_token,
  );
  return {
    ...previousToken,
    userAccessToken: accessToken,
    user_access_token: accessToken,
    userRefreshToken: refreshToken,
    user_refresh_token: refreshToken,
    userTokenType: readString(refreshed.tokenType || "user"),
    user_token_type: readString(refreshed.token_type || "user"),
    userScope: readString(refreshed.scope || previousToken?.userScope),
    user_scope: readString(refreshed.scope || previousToken?.user_scope),
    userExpiresAt: Number(refreshed.expiresAt || 0) || null,
    user_expires_at: Number(refreshed.expiresAt || 0) || null,
  };
}

function normalizeSlackCollection(payload, field) {
  const items = Array.isArray(payload?.[field]) ? payload[field] : [];
  const cursor = readString(payload?.response_metadata?.next_cursor);
  return {
    items,
    cursor,
    hasMore: Boolean(cursor),
  };
}

function normalizeFilename(value) {
  const filename = requireString(value, "Slack filename");
  if (
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    throw invalidInput("Slack filename must be a plain file name.");
  }
  return filename.slice(0, 240);
}

function normalizeEmojiName(value) {
  const name = requireString(value, "Slack emoji name").replace(/^:+|:+$/g, "");
  if (!/^[a-z0-9_+-]{1,100}$/i.test(name)) {
    throw invalidInput("Slack emoji name is invalid.");
  }
  return name;
}

function normalizeSlackUploadUrl(value) {
  let url;
  try {
    url = new URL(requireString(value, "Slack upload URL"));
  } catch {
    throw new ConnectorRuntimeError("Slack returned an invalid external upload URL.", {
      code: "connector_provider_request_failed",
      statusCode: 502,
    });
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !(
      url.hostname === "files.slack.com" ||
      url.hostname.endsWith(".files.slack.com") ||
      url.hostname.endsWith(".slack.com")
    )
  ) {
    throw new ConnectorRuntimeError("Slack returned an untrusted external upload URL.", {
      code: "connector_provider_request_failed",
      statusCode: 502,
    });
  }
  return url.toString();
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown Slack action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
