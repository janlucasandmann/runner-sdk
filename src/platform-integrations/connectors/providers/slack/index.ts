import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "get_authenticated_user",
    description: "Get the authenticated Slack user and workspace.",
    access: "read-only",
  },
  {
    id: "list_channels",
    description: "List Slack channels visible to the connected user.",
    access: "read-only",
    properties: {
      types: stringField("Comma-separated channel types."),
      ...paginationFields,
    },
  },
  {
    id: "get_channel_history",
    description: "Read recent messages from a Slack channel.",
    access: "read-only",
    properties: {
      channelId: stringField("Slack channel ID."),
      oldest: stringField("Optional oldest message timestamp."),
      latest: stringField("Optional latest message timestamp."),
      ...paginationFields,
    },
    required: ["channelId"],
  },
  {
    id: "get_thread_replies",
    description: "Read replies in a Slack message thread.",
    access: "read-only",
    properties: {
      channelId: stringField("Slack channel ID."),
      threadTs: stringField("Parent message timestamp."),
      ...paginationFields,
    },
    required: ["channelId", "threadTs"],
  },
  {
    id: "search_messages",
    description: "Search Slack messages visible to the connected user.",
    access: "read-only",
    properties: {
      query: stringField("Slack search query."),
      ...paginationFields,
    },
    required: ["query"],
  },
  {
    id: "list_users",
    description: "List users in the connected Slack workspace.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "post_message",
    description: "Post a message to a Slack channel or direct message.",
    access: "interactive",
    properties: {
      channelId: stringField("Slack channel or conversation ID."),
      text: stringField("Message text."),
      threadTs: stringField("Optional parent timestamp for a thread reply."),
    },
    required: ["channelId", "text"],
  },
  {
    id: "update_message",
    description: "Update a message posted by the connected Slack app.",
    access: "interactive",
    properties: {
      channelId: stringField("Slack channel ID."),
      messageTs: stringField("Message timestamp."),
      text: stringField("Updated message text."),
    },
    required: ["channelId", "messageTs", "text"],
  },
  {
    id: "delete_message",
    description: "Delete a message posted by the connected Slack app.",
    access: "interactive",
    properties: {
      channelId: stringField("Slack channel ID."),
      messageTs: stringField("Message timestamp."),
    },
    required: ["channelId", "messageTs"],
  },
  {
    id: "upload_file",
    description: "Upload a workspace file to Slack.",
    access: "interactive",
    properties: {
      channelId: stringField("Destination Slack channel ID."),
      filename: stringField("Destination file name."),
      content: stringField("UTF-8 text content to upload."),
      contentBase64: stringField("Base64-encoded binary content to upload."),
      filePath: stringField("Workspace path when a file-transfer bridge is available."),
      title: stringField("Optional file title."),
      initialComment: stringField("Optional message accompanying the file."),
      threadTs: stringField("Optional parent message timestamp."),
    },
    required: ["channelId", "filename"],
  },
  {
    id: "add_reaction",
    description: "Add an emoji reaction to a Slack message.",
    access: "interactive",
    properties: {
      channelId: stringField("Slack channel ID."),
      messageTs: stringField("Message timestamp."),
      name: stringField("Emoji name without colons."),
    },
    required: ["channelId", "messageTs", "name"],
  },
]);

export const SLACK_CONNECTOR_PROVIDER = defineConnectorProvider(
  {
    id: "slack",
    label: "Slack",
    shortLabel: "SL",
    description: "Search Slack context and perform approved collaboration actions.",
    category: "Communication",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    functionsLabel: "Search, Coordinate, Notify",
    samplePrompt: "Summarize the incident thread and post the approved handoff.",
    whenToUse: "Use Slack when agents need team conversation context or approved channel actions.",
    websiteUrl: "https://slack.com/",
    termsUrl: "https://slack.com/terms-of-service",
    privacyUrl: "https://slack.com/trust/privacy/privacy-policy",
  },
  capabilities,
);
