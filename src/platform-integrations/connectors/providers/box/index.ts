import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringArrayField,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "get_current_user",
    description: "Get the authenticated Box user and enterprise.",
    access: "read-only",
  },
  {
    id: "list_folder_items",
    description: "List files and folders inside a Box folder.",
    access: "read-only",
    properties: {
      folderId: stringField("Box folder ID. Use 0 for the root folder."),
      ...paginationFields,
    },
    required: ["folderId"],
  },
  {
    id: "search_items",
    description: "Search authorized Box files and folders.",
    access: "read-only",
    properties: {
      query: stringField("Box search query."),
      ancestorFolderIds: stringArrayField("Optional ancestor folder IDs."),
      ...paginationFields,
    },
    required: ["query"],
  },
  {
    id: "get_file",
    description: "Get metadata for a Box file.",
    access: "read-only",
    properties: { fileId: stringField("Box file ID.") },
    required: ["fileId"],
  },
  {
    id: "download_file",
    description: "Download the content of an authorized Box file.",
    access: "read-only",
    properties: {
      fileId: stringField("Box file ID."),
      versionId: stringField("Optional Box file version ID."),
    },
    required: ["fileId"],
  },
  {
    id: "list_file_versions",
    description: "List available versions of a Box file.",
    access: "read-only",
    properties: {
      fileId: stringField("Box file ID."),
      ...paginationFields,
    },
    required: ["fileId"],
  },
  {
    id: "upload_file",
    description: "Upload a new file into an authorized Box folder.",
    access: "interactive",
    properties: {
      folderId: stringField("Destination folder ID."),
      name: stringField("Destination file name."),
      contentPath: stringField("Workspace path of the file to upload."),
    },
    required: ["folderId", "name", "contentPath"],
  },
  {
    id: "upload_file_version",
    description: "Upload a new version of an existing Box file.",
    access: "interactive",
    properties: {
      fileId: stringField("Box file ID."),
      contentPath: stringField("Workspace path of the replacement content."),
    },
    required: ["fileId", "contentPath"],
  },
  {
    id: "create_folder",
    description: "Create a folder in Box.",
    access: "interactive",
    properties: {
      parentFolderId: stringField("Parent Box folder ID."),
      name: stringField("New folder name."),
    },
    required: ["parentFolderId", "name"],
  },
  {
    id: "move_item",
    description: "Move or rename a Box file or folder.",
    access: "interactive",
    properties: {
      itemType: stringField("Item type.", { enum: ["file", "folder"] }),
      itemId: stringField("Box item ID."),
      parentFolderId: stringField("Destination parent folder ID."),
      name: stringField("Optional new item name."),
    },
    required: ["itemType", "itemId", "parentFolderId"],
  },
  {
    id: "delete_item",
    description: "Delete a Box file or folder.",
    access: "interactive",
    properties: {
      itemType: stringField("Item type.", { enum: ["file", "folder"] }),
      itemId: stringField("Box item ID."),
      recursive: stringField("Set true to recursively delete a folder."),
    },
    required: ["itemType", "itemId"],
  },
  {
    id: "create_shared_link",
    description: "Create or update a shared link for a Box item.",
    access: "interactive",
    properties: {
      itemType: stringField("Item type.", { enum: ["file", "folder"] }),
      itemId: stringField("Box item ID."),
      access: stringField("Shared link access.", {
        enum: ["open", "company", "collaborators"],
      }),
    },
    required: ["itemType", "itemId", "access"],
  },
]);

export const BOX_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "box",
  label: "Box",
  shortLabel: "BX",
  description: "Search, retrieve, organize, and share authorized Box content.",
  category: "Storage",
  logoUrl: "/img/plugins/box.svg",
  functionsLabel: "Search, Retrieve, Organize",
  samplePrompt: "Find the current contract, summarize it, and upload the reviewed version.",
  whenToUse: "Use Box for enterprise content that must retain Box access controls.",
  websiteUrl: "https://www.box.com/",
  termsUrl: "https://www.box.com/legal/termsofservice",
  privacyUrl: "https://www.box.com/legal/privacypolicy",
}, capabilities);
