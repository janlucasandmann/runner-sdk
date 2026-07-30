import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "list_joined_teams",
    description: "List Microsoft Teams joined by the connected user.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "get_team",
    description: "Get a Microsoft Team and its settings.",
    access: "read-only",
    properties: { teamId: stringField("Microsoft Team ID.") },
    required: ["teamId"],
  },
  {
    id: "list_channels",
    description: "List channels in a Microsoft Team.",
    access: "read-only",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      ...paginationFields,
    },
    required: ["teamId"],
  },
  {
    id: "list_channel_messages",
    description: "List messages in a Microsoft Teams channel.",
    access: "read-only",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
      ...paginationFields,
    },
    required: ["teamId", "channelId"],
  },
  {
    id: "get_channel_message",
    description: "Get a Microsoft Teams channel message and replies.",
    access: "read-only",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
      messageId: stringField("Message ID."),
    },
    required: ["teamId", "channelId", "messageId"],
  },
  {
    id: "list_team_members",
    description: "List members of a Microsoft Team.",
    access: "read-only",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      ...paginationFields,
    },
    required: ["teamId"],
  },
  {
    id: "post_channel_message",
    description: "Post a message to a Microsoft Teams channel.",
    access: "interactive",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
      body: stringField("Message body in HTML."),
    },
    required: ["teamId", "channelId", "body"],
  },
  {
    id: "reply_to_channel_message",
    description: "Reply to a Microsoft Teams channel message.",
    access: "interactive",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
      messageId: stringField("Parent message ID."),
      body: stringField("Reply body in HTML."),
    },
    required: ["teamId", "channelId", "messageId", "body"],
  },
  {
    id: "create_channel",
    description: "Create a channel in a Microsoft Team.",
    access: "interactive",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      displayName: stringField("Channel display name."),
      description: stringField("Channel description."),
      membershipType: stringField("Channel membership type.", {
        enum: ["standard", "private", "shared"],
      }),
    },
    required: ["teamId", "displayName"],
  },
  {
    id: "update_channel",
    description: "Update a Microsoft Teams channel.",
    access: "interactive",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
      displayName: stringField("Updated display name."),
      description: stringField("Updated description."),
    },
    required: ["teamId", "channelId"],
  },
  {
    id: "delete_channel",
    description: "Delete a Microsoft Teams channel.",
    access: "interactive",
    properties: {
      teamId: stringField("Microsoft Team ID."),
      channelId: stringField("Channel ID."),
    },
    required: ["teamId", "channelId"],
  },
]);

export const MICROSOFT_TEAMS_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "microsoft-teams",
  label: "Microsoft Teams",
  shortLabel: "MT",
  description: "Read and manage authorized Microsoft Teams, channels, and messages.",
  category: "Communication",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Microsoft_Office_Teams_%282025%E2%80%93present%29.svg",
  functionsLabel: "Read, Coordinate, Notify",
  samplePrompt: "Summarize the project channel and post the approved status update.",
  whenToUse: "Use Microsoft Teams for delegated collaboration in connected teams and channels.",
  websiteUrl: "https://www.microsoft.com/microsoft-teams/",
  termsUrl: "https://www.microsoft.com/servicesagreement",
  privacyUrl: "https://privacy.microsoft.com/privacystatement",
}, capabilities);
