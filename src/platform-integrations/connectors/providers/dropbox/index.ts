import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "get_current_account",
    description: "Get the connected Dropbox account.",
    access: "read-only",
  },
  {
    id: "list_folder",
    description: "List files and folders at a Dropbox path.",
    access: "read-only",
    properties: {
      path: stringField("Dropbox folder path. Use an empty string for root."),
      cursor: paginationFields.cursor,
      limit: paginationFields.limit,
    },
  },
  {
    id: "search_files",
    description: "Search files and folders in Dropbox.",
    access: "read-only",
    properties: {
      query: stringField("Dropbox search query."),
      path: stringField("Optional path scope."),
      ...paginationFields,
    },
    required: ["query"],
  },
  {
    id: "get_metadata",
    description: "Get metadata for a Dropbox file or folder.",
    access: "read-only",
    properties: { path: stringField("Dropbox file or folder path.") },
    required: ["path"],
  },
  {
    id: "download_file",
    description: "Download a file from Dropbox.",
    access: "read-only",
    properties: {
      path: stringField("Dropbox file path or ID."),
      revision: stringField("Optional file revision."),
    },
    required: ["path"],
  },
  {
    id: "list_revisions",
    description: "List revisions of a Dropbox file.",
    access: "read-only",
    properties: {
      path: stringField("Dropbox file path."),
      limit: paginationFields.limit,
    },
    required: ["path"],
  },
  {
    id: "upload_file",
    description: "Upload text or base64 file content to Dropbox.",
    access: "interactive",
    properties: {
      path: stringField("Destination Dropbox path."),
      content: stringField("UTF-8 text content to upload."),
      contentBase64: stringField("Base64-encoded binary content to upload."),
      contentPath: stringField("Workspace path for clients with a file-transfer bridge."),
      mode: stringField("Write mode.", { enum: ["add", "overwrite", "update"] }),
      revision: stringField("Required existing revision when mode is update."),
    },
    required: ["path"],
  },
  {
    id: "create_folder",
    description: "Create a folder in Dropbox.",
    access: "interactive",
    properties: { path: stringField("New Dropbox folder path.") },
    required: ["path"],
  },
  {
    id: "move_item",
    description: "Move or rename a Dropbox file or folder.",
    access: "interactive",
    properties: {
      fromPath: stringField("Current Dropbox path."),
      toPath: stringField("Destination Dropbox path."),
    },
    required: ["fromPath", "toPath"],
  },
  {
    id: "delete_item",
    description: "Delete a Dropbox file or folder.",
    access: "interactive",
    properties: { path: stringField("Dropbox path.") },
    required: ["path"],
  },
  {
    id: "create_shared_link",
    description: "Create a shared link for a Dropbox file or folder.",
    access: "interactive",
    properties: {
      path: stringField("Dropbox path."),
      audience: stringField("Link audience.", {
        enum: ["public", "team", "no_one"],
      }),
      access: stringField("Link access level.", {
        enum: ["viewer", "editor", "max"],
      }),
    },
    required: ["path"],
  },
]);

export const DROPBOX_CONNECTOR_PROVIDER = defineConnectorProvider(
  {
    id: "dropbox",
    label: "Dropbox",
    shortLabel: "DB",
    description: "Search, retrieve, organize, and share authorized Dropbox content.",
    category: "Storage",
    logoUrl: "https://cdn.simpleicons.org/dropbox/0061FF",
    functionsLabel: "Search, Retrieve, Organize",
    samplePrompt: "Find the latest research files and upload the reviewed report.",
    whenToUse: "Use Dropbox for files governed by a connected Dropbox account.",
    websiteUrl: "https://www.dropbox.com/",
    termsUrl: "https://www.dropbox.com/terms",
    privacyUrl: "https://www.dropbox.com/privacy",
  },
  capabilities,
);
