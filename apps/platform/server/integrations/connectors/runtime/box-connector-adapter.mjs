import {
  booleanSchema,
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
  readBinaryResponse,
  readBoolean,
  readInlineContent,
  readJsonResponse,
  readString,
  requireString,
  stringArraySchema,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const BOX_API_ORIGIN = "https://api.box.com";
const BOX_UPLOAD_ORIGIN = "https://upload.box.com";
const BOX_TOKEN_URL = "https://api.box.com/oauth2/token";

const pagination = {
  cursor: stringSchema("Opaque Box pagination marker."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const uploadContent = {
  content: stringSchema("UTF-8 text content to upload."),
  contentBase64: stringSchema("Base64-encoded binary content to upload."),
  contentPath: stringSchema("Workspace path for clients with a file-transfer bridge."),
};

const TOOLS = defineRuntimeTools("Box", [
  {
    name: "get_current_user",
    description: "Get the authenticated Box user and enterprise.",
  },
  {
    name: "list_folder_items",
    description: "List files and folders inside a Box folder.",
    inputSchema: objectSchema(
      {
        folderId: stringSchema("Box folder ID. Use 0 for the root folder."),
        ...pagination,
      },
      ["folderId"],
    ),
  },
  {
    name: "search_items",
    description: "Search authorized Box files and folders.",
    inputSchema: objectSchema(
      {
        query: stringSchema("Box search query."),
        ancestorFolderIds: stringArraySchema("Optional ancestor Box folder IDs."),
        ...pagination,
      },
      ["query"],
    ),
  },
  {
    name: "get_file",
    description: "Get metadata for a Box file.",
    inputSchema: objectSchema({ fileId: stringSchema("Box file ID.") }, ["fileId"]),
  },
  {
    name: "download_file",
    description: "Download the content of an authorized Box file.",
    inputSchema: objectSchema(
      {
        fileId: stringSchema("Box file ID."),
        versionId: stringSchema("Optional Box file version ID."),
      },
      ["fileId"],
    ),
  },
  {
    name: "list_file_versions",
    description: "List available versions of a Box file.",
    inputSchema: objectSchema(
      {
        fileId: stringSchema("Box file ID."),
        ...pagination,
      },
      ["fileId"],
    ),
  },
  {
    name: "upload_file",
    access: "interactive",
    description: "Upload a new file into an authorized Box folder.",
    inputSchema: objectSchema(
      {
        folderId: stringSchema("Destination Box folder ID."),
        name: stringSchema("Destination file name."),
        ...uploadContent,
      },
      ["folderId", "name"],
      {
        oneOf: [{ required: ["content"] }, { required: ["contentBase64"] }],
      },
    ),
  },
  {
    name: "upload_file_version",
    access: "interactive",
    description: "Upload a new version of an existing Box file.",
    inputSchema: objectSchema(
      {
        fileId: stringSchema("Box file ID."),
        name: stringSchema("Optional replacement file name."),
        ...uploadContent,
      },
      ["fileId"],
      {
        oneOf: [{ required: ["content"] }, { required: ["contentBase64"] }],
      },
    ),
  },
  {
    name: "create_folder",
    access: "interactive",
    description: "Create a folder in Box.",
    inputSchema: objectSchema(
      {
        parentFolderId: stringSchema("Parent Box folder ID."),
        name: stringSchema("New folder name."),
      },
      ["parentFolderId", "name"],
    ),
  },
  {
    name: "move_item",
    access: "interactive",
    description: "Move or rename a Box file or folder.",
    inputSchema: objectSchema(
      {
        itemType: stringSchema("Box item type.", {
          enum: ["file", "folder"],
        }),
        itemId: stringSchema("Box item ID."),
        parentFolderId: stringSchema("Destination parent folder ID."),
        name: stringSchema("Optional new item name."),
      },
      ["itemType", "itemId", "parentFolderId"],
    ),
  },
  {
    name: "delete_item",
    access: "interactive",
    description: "Delete a Box file or folder.",
    inputSchema: objectSchema(
      {
        itemType: stringSchema("Box item type.", {
          enum: ["file", "folder"],
        }),
        itemId: stringSchema("Box item ID."),
        recursive: booleanSchema("Recursively delete a Box folder."),
      },
      ["itemType", "itemId"],
    ),
  },
  {
    name: "create_shared_link",
    access: "interactive",
    description: "Create or update a shared link for a Box item.",
    inputSchema: objectSchema(
      {
        itemType: stringSchema("Box item type.", {
          enum: ["file", "folder"],
        }),
        itemId: stringSchema("Box item ID."),
        access: stringSchema("Box shared-link access.", {
          enum: ["open", "company", "collaborators"],
        }),
      },
      ["itemType", "itemId", "access"],
    ),
  },
]);

export function createBoxConnectorAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const credentials = createOAuthCredentialRuntime({
    provider: "box",
    clientIdEnv: "BOX_OAUTH_CLIENT_ID",
    clientSecretEnv: "BOX_OAUTH_CLIENT_SECRET",
    tokenUrl: BOX_TOKEN_URL,
    ...options,
    fetchImpl,
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    return credentials.invoke(grant, ({ accessToken }) =>
      invokeBoxAction(
        createBoxClient({
          accessToken,
          fetchImpl,
          maxDownloadBytes: options.maxDownloadBytes,
        }),
        definition.name,
        args,
      ),
    );
  }

  return Object.freeze({
    id: "box",
    aliases: Object.freeze(["box"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeBoxAction(client, name, args) {
  switch (name) {
    case "get_current_user":
      return client.json("/2.0/users/me", {
        query: {
          fields:
            "id,type,name,login,created_at,modified_at,language,timezone,space_amount,space_used,max_upload_size,status,job_title,phone,address,avatar_url,enterprise",
        },
      });
    case "list_folder_items":
      return normalizeCollection(
        await client.json(
          `/2.0/folders/${encodePath(requireString(args.folderId, "Box folderId"))}/items`,
          {
            query: {
              usemarker: true,
              marker: readString(args.cursor),
              limit: clampInteger(args.limit, 1, 100, 100),
              fields:
                "id,type,name,size,description,created_at,modified_at,etag,sha1,parent,path_collection,owned_by,shared_link",
            },
          },
        ),
      );
    case "search_items":
      return normalizeCollection(
        await client.json("/2.0/search", {
          query: compactObject({
            query: requireString(args.query, "Box search query"),
            ancestor_folder_ids: normalizeStringArray(
              args.ancestorFolderIds,
              "Box ancestorFolderIds",
            )?.join(","),
            usemarker: true,
            marker: readString(args.cursor),
            limit: clampInteger(args.limit, 1, 100, 100),
            fields:
              "id,type,name,size,description,created_at,modified_at,etag,parent,path_collection,owned_by,shared_link",
          }),
        }),
      );
    case "get_file":
      return client.json(`/2.0/files/${encodePath(requireString(args.fileId, "Box fileId"))}`, {
        query: {
          fields:
            "id,type,name,size,description,created_at,modified_at,content_created_at,content_modified_at,etag,sha1,parent,path_collection,owned_by,shared_link,file_version,representations",
        },
      });
    case "download_file": {
      const fileId = requireString(args.fileId, "Box fileId");
      const metadata = await client.json(`/2.0/files/${encodePath(fileId)}`, {
        query: {
          fields: "id,type,name,size,description,modified_at,etag,sha1,file_version",
        },
      });
      return client.download(
        `/2.0/files/${encodePath(fileId)}/content`,
        {
          version: readString(args.versionId),
        },
        metadata,
      );
    }
    case "list_file_versions":
      return normalizeCollection(
        await client.json(
          `/2.0/files/${encodePath(requireString(args.fileId, "Box fileId"))}/versions`,
          {
            query: {
              usemarker: true,
              marker: readString(args.cursor),
              limit: clampInteger(args.limit, 1, 100, 100),
              fields:
                "id,name,size,sha1,created_at,modified_at,modified_by,trashed_at,restored_at,purged_at,uploader",
            },
          },
        ),
      );
    case "upload_file": {
      const content = readInlineContent(args, { provider: "box" });
      return client.upload("/api/2.0/files/content", {
        attributes: {
          name: requireString(args.name, "Box file name"),
          parent: {
            id: requireString(args.folderId, "Box folderId"),
          },
        },
        content,
        name: requireString(args.name, "Box file name"),
      });
    }
    case "upload_file_version": {
      const fileId = requireString(args.fileId, "Box fileId");
      const current = readString(args.name)
        ? null
        : await client.json(`/2.0/files/${encodePath(fileId)}`, {
            query: { fields: "id,name" },
          });
      const fileName = readString(args.name) || readString(current?.name) || `box-file-${fileId}`;
      return client.upload(`/api/2.0/files/${encodePath(fileId)}/content`, {
        attributes: { name: fileName },
        content: readInlineContent(args, { provider: "box" }),
        name: fileName,
      });
    }
    case "create_folder":
      return client.json("/2.0/folders", {
        method: "POST",
        body: {
          name: requireString(args.name, "Box folder name"),
          parent: {
            id: requireString(args.parentFolderId, "Box parentFolderId"),
          },
        },
      });
    case "move_item": {
      const itemType = normalizeItemType(args.itemType);
      return client.json(
        `/2.0/${itemType}s/${encodePath(requireString(args.itemId, "Box itemId"))}`,
        {
          method: "PUT",
          body: compactObject({
            parent: {
              id: requireString(args.parentFolderId, "Box parentFolderId"),
            },
            name: args.name === undefined ? undefined : readString(args.name),
          }),
        },
      );
    }
    case "delete_item": {
      const itemType = normalizeItemType(args.itemType);
      const recursive = args.recursive === undefined ? undefined : readBoolean(args.recursive);
      if (args.recursive !== undefined && recursive === undefined) {
        throw invalidInput("Box recursive must be true or false.");
      }
      if (itemType === "file" && recursive === true) {
        throw invalidInput("Box recursive deletion only applies to folders.");
      }
      return client.json(
        `/2.0/${itemType}s/${encodePath(requireString(args.itemId, "Box itemId"))}`,
        {
          method: "DELETE",
          query: itemType === "folder" && recursive !== undefined ? { recursive } : undefined,
        },
      );
    }
    case "create_shared_link": {
      const itemType = normalizeItemType(args.itemType);
      return client.json(
        `/2.0/${itemType}s/${encodePath(requireString(args.itemId, "Box itemId"))}`,
        {
          method: "PUT",
          query: { fields: "id,type,name,shared_link" },
          body: {
            shared_link: {
              access: normalizeOptionalEnum(
                requireString(args.access, "Box shared-link access"),
                ["open", "company", "collaborators"],
                "Box shared-link access",
              ),
            },
          },
        },
      );
    }
    default:
      throw unknownAction();
  }
}

function createBoxClient({ accessToken, fetchImpl, maxDownloadBytes }) {
  async function json(pathname, { method = "GET", query, body } = {}) {
    const url = new URL(pathname, BOX_API_ORIGIN);
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
    if (!response.ok) {
      throw createProviderRequestError("box", response, payload);
    }
    return payload;
  }

  async function download(pathname, query, metadata) {
    const url = new URL(pathname, BOX_API_ORIGIN);
    Object.entries(compactObject(query || {})).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      redirect: "follow",
    });
    return readBinaryResponse(response, {
      provider: "box",
      maxBytes: maxDownloadBytes,
      metadata,
    });
  }

  async function upload(pathname, { attributes, content, name }) {
    const form = new FormData();
    form.set("attributes", JSON.stringify(attributes));
    form.set("file", new Blob([content], { type: "application/octet-stream" }), name);
    const response = await fetchImpl(new URL(pathname, BOX_UPLOAD_ORIGIN), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw createProviderRequestError("box", response, payload);
    }
    return payload;
  }

  return Object.freeze({ download, json, upload });
}

function normalizeCollection(payload) {
  return {
    items: Array.isArray(payload?.entries) ? payload.entries : [],
    cursor: readString(payload?.next_marker),
    hasMore: Boolean(payload?.next_marker),
    totalCount: Number(payload?.total_count || 0),
  };
}

function normalizeItemType(value) {
  return normalizeOptionalEnum(
    requireString(value, "Box itemType"),
    ["file", "folder"],
    "Box itemType",
  );
}

function normalizeStringArray(value, label) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw invalidInput(`${label} must be an array.`);
  return value.map(readString).filter(Boolean);
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown Box action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
