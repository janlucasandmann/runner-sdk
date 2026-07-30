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
    description: "Get the authenticated Figma user.",
    access: "read-only",
  },
  {
    id: "get_file",
    description: "Get a Figma file document and metadata.",
    access: "read-only",
    properties: {
      fileKey: stringField("Figma file key."),
      version: stringField("Optional Figma version ID."),
      depth: stringField("Optional document traversal depth."),
    },
    required: ["fileKey"],
  },
  {
    id: "get_file_nodes",
    description: "Get selected nodes from a Figma file.",
    access: "read-only",
    properties: {
      fileKey: stringField("Figma file key."),
      nodeIds: stringArrayField("Figma node IDs."),
      version: stringField("Optional Figma version ID."),
    },
    required: ["fileKey", "nodeIds"],
  },
  {
    id: "render_images",
    description: "Render selected Figma nodes as images.",
    access: "read-only",
    properties: {
      fileKey: stringField("Figma file key."),
      nodeIds: stringArrayField("Figma node IDs."),
      format: stringField("Image format.", {
        enum: ["jpg", "png", "svg", "pdf"],
      }),
      scale: stringField("Image scale from 0.01 to 4."),
    },
    required: ["fileKey", "nodeIds"],
  },
  {
    id: "list_comments",
    description: "List comments on a Figma file.",
    access: "read-only",
    properties: {
      fileKey: stringField("Figma file key."),
      ...paginationFields,
    },
    required: ["fileKey"],
  },
  {
    id: "list_versions",
    description: "List versions of a Figma file.",
    access: "read-only",
    properties: {
      fileKey: stringField("Figma file key."),
      ...paginationFields,
    },
    required: ["fileKey"],
  },
  {
    id: "list_team_projects",
    description: "List projects in a Figma team.",
    access: "read-only",
    properties: { teamId: stringField("Figma team ID.") },
    required: ["teamId"],
  },
  {
    id: "list_project_files",
    description: "List files in a Figma project.",
    access: "read-only",
    properties: { projectId: stringField("Figma project ID.") },
    required: ["projectId"],
  },
  {
    id: "create_comment",
    description: "Create a comment on a Figma file.",
    access: "interactive",
    properties: {
      fileKey: stringField("Figma file key."),
      message: stringField("Comment message."),
      nodeId: stringField("Optional node ID for the comment."),
      x: stringField("Optional canvas X coordinate."),
      y: stringField("Optional canvas Y coordinate."),
    },
    required: ["fileKey", "message"],
  },
  {
    id: "delete_comment",
    description: "Delete a comment created by the authenticated Figma user.",
    access: "interactive",
    properties: {
      fileKey: stringField("Figma file key."),
      commentId: stringField("Figma comment ID."),
    },
    required: ["fileKey", "commentId"],
  },
  {
    id: "create_webhook",
    description: "Create a Figma webhook for a team, project, or file.",
    access: "interactive",
    properties: {
      eventType: stringField("Figma webhook event type."),
      contextType: stringField("Webhook context type.", {
        enum: ["team", "project", "file"],
      }),
      contextId: stringField("Context ID."),
      endpoint: stringField("HTTPS webhook endpoint."),
      passcode: stringField("Webhook passcode."),
    },
    required: ["eventType", "contextType", "contextId", "endpoint", "passcode"],
  },
]);

export const FIGMA_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "figma",
  label: "Figma",
  shortLabel: "FG",
  description: "Inspect Figma files, render nodes, and manage approved comments and webhooks.",
  category: "Design",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
  functionsLabel: "Inspect, Render, Review",
  samplePrompt: "Inspect this design, render the target frames, and summarize inconsistencies.",
  whenToUse: "Use Figma for design context and review workflows.",
  websiteUrl: "https://www.figma.com/",
  termsUrl: "https://www.figma.com/legal/tos/",
  privacyUrl: "https://www.figma.com/legal/privacy/",
}, capabilities);
