import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringArrayField,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "get_profile",
    description: "Get the connected Microsoft account profile.",
    access: "read-only",
  },
  {
    id: "list_mail_folders",
    description: "List Outlook mail folders.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "list_messages",
    description: "List messages in an Outlook mail folder.",
    access: "read-only",
    properties: {
      folderId: stringField("Mail folder ID. Omit for the inbox."),
      query: stringField("Optional Microsoft Graph search expression."),
      ...paginationFields,
    },
  },
  {
    id: "get_message",
    description: "Get an Outlook message and its metadata.",
    access: "read-only",
    properties: { messageId: stringField("Microsoft Graph message ID.") },
    required: ["messageId"],
  },
  {
    id: "list_message_attachments",
    description: "List attachments for an Outlook message.",
    access: "read-only",
    properties: { messageId: stringField("Microsoft Graph message ID.") },
    required: ["messageId"],
  },
  {
    id: "create_draft",
    description: "Create a draft Outlook message.",
    access: "interactive",
    properties: {
      subject: stringField("Message subject."),
      body: stringField("Message body."),
      bodyType: stringField("Body format.", { enum: ["text", "html"] }),
      to: stringArrayField("To recipient email addresses."),
      cc: stringArrayField("CC recipient email addresses."),
    },
    required: ["subject", "body", "to"],
  },
  {
    id: "update_draft",
    description: "Update an existing Outlook draft.",
    access: "interactive",
    properties: {
      messageId: stringField("Draft message ID."),
      subject: stringField("Updated subject."),
      body: stringField("Updated body."),
      to: stringArrayField("Updated To recipients."),
      cc: stringArrayField("Updated CC recipients."),
    },
    required: ["messageId"],
  },
  {
    id: "send_draft",
    description: "Send an existing Outlook draft.",
    access: "interactive",
    properties: { messageId: stringField("Draft message ID.") },
    required: ["messageId"],
  },
  {
    id: "reply_to_message",
    description: "Reply to an Outlook message.",
    access: "interactive",
    properties: {
      messageId: stringField("Message ID."),
      body: stringField("Reply body."),
    },
    required: ["messageId", "body"],
  },
  {
    id: "forward_message",
    description: "Forward an Outlook message.",
    access: "interactive",
    properties: {
      messageId: stringField("Message ID."),
      to: stringArrayField("Forward recipient email addresses."),
      comment: stringField("Optional forwarding comment."),
    },
    required: ["messageId", "to"],
  },
  {
    id: "move_message",
    description: "Move an Outlook message to another folder.",
    access: "interactive",
    properties: {
      messageId: stringField("Message ID."),
      destinationFolderId: stringField("Destination mail folder ID."),
    },
    required: ["messageId", "destinationFolderId"],
  },
  {
    id: "delete_message",
    description: "Delete an Outlook message.",
    access: "interactive",
    properties: { messageId: stringField("Message ID.") },
    required: ["messageId"],
  },
]);

export const OUTLOOK_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "outlook",
  label: "Outlook",
  shortLabel: "OL",
  description: "Search Outlook mail and manage approved drafts, replies, and messages.",
  category: "Communication",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Microsoft_Outlook_Icon_%282025%E2%80%93present%29.svg",
  functionsLabel: "Read, Draft, Send",
  samplePrompt: "Summarize the latest customer thread and draft a response for approval.",
  whenToUse: "Use Outlook for delegated mailbox work on behalf of a connected user.",
  websiteUrl: "https://www.microsoft.com/microsoft-365/outlook/outlook-for-business",
  termsUrl: "https://www.microsoft.com/servicesagreement",
  privacyUrl: "https://privacy.microsoft.com/privacystatement",
}, capabilities);
