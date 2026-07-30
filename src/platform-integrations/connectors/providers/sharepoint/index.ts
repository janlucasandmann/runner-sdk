import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "search_sites",
    description: "Search SharePoint sites available to the connected user.",
    access: "read-only",
    properties: {
      query: stringField("Site search query."),
      ...paginationFields,
    },
    required: ["query"],
  },
  {
    id: "get_site",
    description: "Get a SharePoint site by ID or path.",
    access: "read-only",
    properties: { siteId: stringField("Microsoft Graph SharePoint site ID.") },
    required: ["siteId"],
  },
  {
    id: "list_drives",
    description: "List document libraries in a SharePoint site.",
    access: "read-only",
    properties: {
      siteId: stringField("SharePoint site ID."),
      ...paginationFields,
    },
    required: ["siteId"],
  },
  {
    id: "list_drive_items",
    description: "List files and folders in a SharePoint document library.",
    access: "read-only",
    properties: {
      driveId: stringField("Microsoft Graph drive ID."),
      itemId: stringField("Optional folder item ID. Omit for root."),
      ...paginationFields,
    },
    required: ["driveId"],
  },
  {
    id: "get_drive_item",
    description: "Get SharePoint file or folder metadata.",
    access: "read-only",
    properties: {
      driveId: stringField("Drive ID."),
      itemId: stringField("Item ID."),
    },
    required: ["driveId", "itemId"],
  },
  {
    id: "download_drive_item",
    description: "Download an authorized SharePoint file.",
    access: "read-only",
    properties: {
      driveId: stringField("Drive ID."),
      itemId: stringField("File item ID."),
    },
    required: ["driveId", "itemId"],
  },
  {
    id: "list_site_lists",
    description: "List lists in a SharePoint site.",
    access: "read-only",
    properties: {
      siteId: stringField("SharePoint site ID."),
      ...paginationFields,
    },
    required: ["siteId"],
  },
  {
    id: "list_list_items",
    description: "List records in a SharePoint list.",
    access: "read-only",
    properties: {
      siteId: stringField("SharePoint site ID."),
      listId: stringField("SharePoint list ID."),
      ...paginationFields,
    },
    required: ["siteId", "listId"],
  },
  {
    id: "upload_file",
    description: "Upload a file to a SharePoint document library.",
    access: "interactive",
    properties: {
      driveId: stringField("Drive ID."),
      parentItemId: stringField("Destination folder item ID."),
      name: stringField("Destination file name."),
      contentPath: stringField("Workspace path to upload."),
    },
    required: ["driveId", "parentItemId", "name", "contentPath"],
  },
  {
    id: "create_folder",
    description: "Create a folder in a SharePoint document library.",
    access: "interactive",
    properties: {
      driveId: stringField("Drive ID."),
      parentItemId: stringField("Parent folder item ID."),
      name: stringField("Folder name."),
    },
    required: ["driveId", "parentItemId", "name"],
  },
  {
    id: "update_list_item",
    description: "Update fields on a SharePoint list item.",
    access: "interactive",
    properties: {
      siteId: stringField("SharePoint site ID."),
      listId: stringField("List ID."),
      itemId: stringField("List item ID."),
      fieldsJson: stringField("JSON object of fields to update."),
    },
    required: ["siteId", "listId", "itemId", "fieldsJson"],
  },
  {
    id: "delete_drive_item",
    description: "Delete a SharePoint file or folder.",
    access: "interactive",
    properties: {
      driveId: stringField("Drive ID."),
      itemId: stringField("Item ID."),
    },
    required: ["driveId", "itemId"],
  },
]);

export const SHAREPOINT_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "sharepoint",
  label: "SharePoint",
  shortLabel: "SP",
  description: "Search and manage authorized SharePoint sites, files, and lists.",
  category: "Knowledge",
  logoUrl: "/img/plugins/sharepoint.svg",
  functionsLabel: "Search, Retrieve, Maintain",
  samplePrompt: "Find the current policy, summarize the changes, and update the tracking list.",
  whenToUse: "Use SharePoint for governed Microsoft 365 knowledge and document workflows.",
  websiteUrl: "https://www.microsoft.com/microsoft-365/sharepoint/collaboration",
  termsUrl: "https://www.microsoft.com/servicesagreement",
  privacyUrl: "https://privacy.microsoft.com/privacystatement",
}, capabilities);
