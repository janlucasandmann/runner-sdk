import type {
  PlatformConnectorCapability,
  PlatformConnectorCapabilityAccess,
  PlatformConnectorJsonSchema,
} from "./connector-types.js";
import { GITHUB_CONNECTOR_CAPABILITIES } from "./github-capability-catalog.js";
import { ADDITIONAL_CONNECTOR_CAPABILITIES } from "./providers/index.js";

type CapabilityInput = {
  id: string;
  description: string;
  access: PlatformConnectorCapabilityAccess;
  properties?: Readonly<Record<string, PlatformConnectorJsonSchema>>;
  required?: readonly string[];
};

const stringField = (
  description: string,
  extra: Partial<PlatformConnectorJsonSchema> = {},
): PlatformConnectorJsonSchema => ({
  type: "string",
  description,
  ...extra,
});

const numberField = (
  description: string,
  extra: Partial<PlatformConnectorJsonSchema> = {},
): PlatformConnectorJsonSchema => ({
  type: "number",
  description,
  ...extra,
});

const booleanField = (description: string): PlatformConnectorJsonSchema => ({
  type: "boolean",
  description,
});

const stringArrayField = (description: string): PlatformConnectorJsonSchema => ({
  type: "array",
  description,
  items: { type: "string" },
});

const entityPropertyArrayField = (description: string): PlatformConnectorJsonSchema => ({
  type: "array",
  description,
  items: {
    type: "object",
    properties: {
      key: stringField("Entity property key."),
      value: {
        type: "object",
        description: "JSON object stored as the entity property value.",
        additionalProperties: true,
      },
    },
    required: ["key", "value"],
    additionalProperties: false,
  },
});

function defineCapabilities(
  definitions: readonly CapabilityInput[],
): readonly PlatformConnectorCapability[] {
  return Object.freeze(
    definitions.map((definition) =>
      Object.freeze({
        id: definition.id,
        title: definition.id,
        description: definition.description,
        access: definition.access,
        iconKey: definition.access === "read-only" ? "skill" : "workflow",
        inputSchema: Object.freeze({
          type: "object",
          properties: Object.freeze({ ...(definition.properties || {}) }),
          required: Object.freeze([...(definition.required || [])]),
        }),
      }),
    ),
  );
}

const gitlabProject = {
  projectId: stringField("GitLab project ID or URL-encoded project path."),
};
const gitlabPagination = {
  page: numberField("Page number.", { minimum: 1 }),
  perPage: numberField("Results per page.", { minimum: 1, maximum: 100 }),
};

export const GITLAB_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "get_current_user",
    description: "Get the profile of the authenticated GitLab user.",
    access: "read-only",
  },
  {
    id: "list_projects",
    description: "List projects visible to the authenticated GitLab user.",
    access: "read-only",
    properties: {
      search: stringField("Optional project search query."),
      membership: booleanField("Only return projects where the user is a member."),
      ...gitlabPagination,
    },
  },
  {
    id: "get_project",
    description: "Get metadata and permissions for a GitLab project.",
    access: "read-only",
    properties: gitlabProject,
    required: ["projectId"],
  },
  {
    id: "list_repository_tree",
    description: "List files and directories in a GitLab repository.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      path: stringField("Directory path. Omit for the repository root."),
      ref: stringField("Branch, tag, or commit SHA."),
      recursive: booleanField("Return the tree recursively."),
      ...gitlabPagination,
    },
    required: ["projectId"],
  },
  {
    id: "get_file",
    description: "Read a file from a GitLab repository at a branch, tag, or commit.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      filePath: stringField("Repository-relative file path."),
      ref: stringField("Branch, tag, or commit SHA."),
    },
    required: ["projectId", "filePath", "ref"],
  },
  {
    id: "list_commits",
    description: "List commits for a GitLab project and optional branch or path.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      refName: stringField("Branch or tag name."),
      path: stringField("Only return commits touching this path."),
      since: stringField("Only return commits after this ISO 8601 timestamp."),
      until: stringField("Only return commits before this ISO 8601 timestamp."),
      ...gitlabPagination,
    },
    required: ["projectId"],
  },
  {
    id: "list_issues",
    description: "List and filter issues in a GitLab project.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      state: stringField("Issue state.", { enum: ["opened", "closed", "all"] }),
      search: stringField("Issue search query."),
      labels: stringArrayField("Labels that must be present."),
      ...gitlabPagination,
    },
    required: ["projectId"],
  },
  {
    id: "get_issue",
    description: "Get a GitLab issue and its current metadata.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      issueIid: numberField("Project-scoped issue IID.", { minimum: 1 }),
    },
    required: ["projectId", "issueIid"],
  },
  {
    id: "list_merge_requests",
    description: "List and filter merge requests in a GitLab project.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      state: stringField("Merge request state.", {
        enum: ["opened", "closed", "locked", "merged", "all"],
      }),
      search: stringField("Merge request search query."),
      ...gitlabPagination,
    },
    required: ["projectId"],
  },
  {
    id: "get_merge_request",
    description: "Get merge request details, participants, changes, and pipeline state.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      mergeRequestIid: numberField("Project-scoped merge request IID.", {
        minimum: 1,
      }),
    },
    required: ["projectId", "mergeRequestIid"],
  },
  {
    id: "get_pipeline",
    description: "Get a pipeline and its current jobs and status.",
    access: "read-only",
    properties: {
      ...gitlabProject,
      pipelineId: numberField("Pipeline ID.", { minimum: 1 }),
    },
    required: ["projectId", "pipelineId"],
  },
  {
    id: "create_branch",
    description: "Create a new branch in a GitLab project.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      branch: stringField("New branch name."),
      ref: stringField("Source branch, tag, or commit SHA."),
    },
    required: ["projectId", "branch", "ref"],
  },
  {
    id: "create_or_update_file",
    description: "Create or update one repository file in a GitLab project.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      filePath: stringField("Repository-relative file path."),
      branch: stringField("Target branch."),
      content: stringField("Complete UTF-8 file content."),
      commitMessage: stringField("Commit message."),
      lastCommitId: stringField("Last known commit ID when updating an existing file."),
    },
    required: ["projectId", "filePath", "branch", "content", "commitMessage"],
  },
  {
    id: "delete_file",
    description: "Delete one file from a GitLab repository in a new commit.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      filePath: stringField("Repository-relative file path."),
      branch: stringField("Target branch."),
      commitMessage: stringField("Commit message."),
      lastCommitId: stringField("Last known commit ID."),
    },
    required: ["projectId", "filePath", "branch", "commitMessage"],
  },
  {
    id: "issue_write",
    description: "Create or update an issue in a GitLab project.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      issueIid: numberField("Issue IID when updating an existing issue.", {
        minimum: 1,
      }),
      title: stringField("Issue title."),
      description: stringField("Issue description."),
      labels: stringArrayField("Issue labels."),
      assigneeIds: {
        type: "array",
        description: "GitLab user IDs to assign.",
        items: { type: "number" },
      },
    },
    required: ["projectId", "title"],
  },
  {
    id: "add_issue_note",
    description: "Add a note to a GitLab issue.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      issueIid: numberField("Project-scoped issue IID.", { minimum: 1 }),
      body: stringField("Note body."),
    },
    required: ["projectId", "issueIid", "body"],
  },
  {
    id: "create_merge_request",
    description: "Create a merge request in a GitLab project.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      sourceBranch: stringField("Source branch."),
      targetBranch: stringField("Target branch."),
      title: stringField("Merge request title."),
      description: stringField("Merge request description."),
      removeSourceBranch: booleanField("Remove the source branch after merge."),
    },
    required: ["projectId", "sourceBranch", "targetBranch", "title"],
  },
  {
    id: "update_merge_request",
    description: "Update a GitLab merge request.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      mergeRequestIid: numberField("Project-scoped merge request IID.", {
        minimum: 1,
      }),
      title: stringField("Updated title."),
      description: stringField("Updated description."),
      stateEvent: stringField("State transition.", { enum: ["close", "reopen"] }),
    },
    required: ["projectId", "mergeRequestIid"],
  },
  {
    id: "merge_merge_request",
    description: "Merge an approved GitLab merge request.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      mergeRequestIid: numberField("Project-scoped merge request IID.", {
        minimum: 1,
      }),
      mergeCommitMessage: stringField("Optional merge commit message."),
      shouldRemoveSourceBranch: booleanField("Remove the source branch after merge."),
      sha: stringField("Expected source SHA used for optimistic concurrency."),
    },
    required: ["projectId", "mergeRequestIid"],
  },
  {
    id: "trigger_pipeline",
    description: "Start a pipeline for a branch or tag.",
    access: "interactive",
    properties: {
      ...gitlabProject,
      ref: stringField("Branch or tag to run."),
      variables: {
        type: "object",
        description: "Pipeline variable key-value pairs.",
        additionalProperties: { type: "string" },
      },
    },
    required: ["projectId", "ref"],
  },
]);

const notionPageId = {
  pageId: stringField("Notion page ID."),
};
const notionDatabaseId = {
  databaseId: stringField("Notion database ID."),
};

export const NOTION_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "search",
    description: "Search pages and data sources shared with the Notion integration.",
    access: "read-only",
    properties: {
      query: stringField("Search query."),
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 100 }),
      startCursor: stringField("Pagination cursor."),
    },
  },
  {
    id: "retrieve_page",
    description: "Retrieve a Notion page and its properties.",
    access: "read-only",
    properties: notionPageId,
    required: ["pageId"],
  },
  {
    id: "retrieve_page_property",
    description: "Retrieve a paginated property value from a Notion page.",
    access: "read-only",
    properties: {
      ...notionPageId,
      propertyId: stringField("Property ID."),
      startCursor: stringField("Pagination cursor."),
    },
    required: ["pageId", "propertyId"],
  },
  {
    id: "retrieve_database",
    description: "Retrieve a Notion database schema and metadata.",
    access: "read-only",
    properties: notionDatabaseId,
    required: ["databaseId"],
  },
  {
    id: "query_database",
    description: "Query records from a Notion database.",
    access: "read-only",
    properties: {
      ...notionDatabaseId,
      filter: {
        type: "object",
        description: "Notion database filter.",
        additionalProperties: true,
      },
      sorts: {
        type: "array",
        description: "Notion sort definitions.",
        items: { type: "object", additionalProperties: true },
      },
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 100 }),
      startCursor: stringField("Pagination cursor."),
    },
    required: ["databaseId"],
  },
  {
    id: "retrieve_block_children",
    description: "Read child blocks below a Notion page or block.",
    access: "read-only",
    properties: {
      blockId: stringField("Page or block ID."),
      pageSize: numberField("Maximum child blocks.", { minimum: 1, maximum: 100 }),
      startCursor: stringField("Pagination cursor."),
    },
    required: ["blockId"],
  },
  {
    id: "list_comments",
    description: "List comments on a Notion page or block.",
    access: "read-only",
    properties: {
      blockId: stringField("Page or block ID."),
      pageSize: numberField("Maximum comments.", { minimum: 1, maximum: 100 }),
      startCursor: stringField("Pagination cursor."),
    },
    required: ["blockId"],
  },
  {
    id: "create_page",
    description: "Create a page beneath a Notion page or in a database.",
    access: "interactive",
    properties: {
      parentId: stringField("Parent page or database ID."),
      parentType: stringField("Parent type.", {
        enum: ["page_id", "database_id"],
      }),
      properties: {
        type: "object",
        description: "Page properties.",
        additionalProperties: true,
      },
      children: {
        type: "array",
        description: "Initial child blocks.",
        items: { type: "object", additionalProperties: true },
      },
    },
    required: ["parentId", "parentType", "properties"],
  },
  {
    id: "update_page",
    description: "Update properties, icon, cover, or archive state of a Notion page.",
    access: "interactive",
    properties: {
      ...notionPageId,
      properties: {
        type: "object",
        description: "Properties to update.",
        additionalProperties: true,
      },
      archived: booleanField("Archive or restore the page."),
    },
    required: ["pageId"],
  },
  {
    id: "append_block_children",
    description: "Append content blocks below a Notion page or block.",
    access: "interactive",
    properties: {
      blockId: stringField("Page or block ID."),
      children: {
        type: "array",
        description: "Blocks to append.",
        items: { type: "object", additionalProperties: true },
        minItems: 1,
      },
      after: stringField("Append after this child block ID."),
    },
    required: ["blockId", "children"],
  },
  {
    id: "update_block",
    description: "Update the content or archive state of a Notion block.",
    access: "interactive",
    properties: {
      blockId: stringField("Block ID."),
      content: {
        type: "object",
        description: "Type-specific block content.",
        additionalProperties: true,
      },
      archived: booleanField("Archive or restore the block."),
    },
    required: ["blockId"],
  },
  {
    id: "create_comment",
    description: "Create a comment on a Notion page or discussion.",
    access: "interactive",
    properties: {
      pageId: stringField("Page ID."),
      discussionId: stringField("Existing discussion ID."),
      richText: {
        type: "array",
        description: "Notion rich text objects.",
        items: { type: "object", additionalProperties: true },
        minItems: 1,
      },
    },
    required: ["richText"],
  },
  {
    id: "create_database",
    description: "Create a Notion database under a parent page.",
    access: "interactive",
    properties: {
      parentPageId: stringField("Parent page ID."),
      title: stringField("Database title."),
      properties: {
        type: "object",
        description: "Database property schema.",
        additionalProperties: true,
      },
    },
    required: ["parentPageId", "title", "properties"],
  },
]);

const driveItemId = {
  fileId: stringField("Google Drive file or folder ID."),
};

export const GOOGLE_DRIVE_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "search_files",
    description: "Search files and folders visible to the connected Google account.",
    access: "read-only",
    properties: {
      query: stringField("Drive search query."),
      parentId: stringField("Restrict results to a folder."),
      mimeType: stringField("Restrict results to a MIME type."),
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 1000 }),
      pageToken: stringField("Pagination token."),
    },
  },
  {
    id: "list_folder",
    description: "List files and folders inside a Google Drive folder.",
    access: "read-only",
    properties: {
      folderId: stringField("Folder ID. Use root for My Drive."),
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 1000 }),
      pageToken: stringField("Pagination token."),
    },
    required: ["folderId"],
  },
  {
    id: "get_file_metadata",
    description: "Retrieve metadata and permissions for a Google Drive item.",
    access: "read-only",
    properties: driveItemId,
    required: ["fileId"],
  },
  {
    id: "download_file",
    description: "Download the binary content of a Google Drive file.",
    access: "read-only",
    properties: driveItemId,
    required: ["fileId"],
  },
  {
    id: "export_google_document",
    description: "Export a Google Workspace document to a supported MIME type.",
    access: "read-only",
    properties: {
      ...driveItemId,
      mimeType: stringField("Export MIME type."),
    },
    required: ["fileId", "mimeType"],
  },
  {
    id: "list_permissions",
    description: "List principals with access to a Google Drive item.",
    access: "read-only",
    properties: driveItemId,
    required: ["fileId"],
  },
  {
    id: "upload_file",
    description: "Upload a new file to Google Drive.",
    access: "interactive",
    properties: {
      name: stringField("File name."),
      mimeType: stringField("File MIME type."),
      contentBase64: stringField("Base64-encoded file content."),
      parentId: stringField("Destination folder ID."),
    },
    required: ["name", "contentBase64"],
  },
  {
    id: "create_folder",
    description: "Create a folder in Google Drive.",
    access: "interactive",
    properties: {
      name: stringField("Folder name."),
      parentId: stringField("Parent folder ID."),
    },
    required: ["name"],
  },
  {
    id: "update_file",
    description: "Update file metadata or replace file content in Google Drive.",
    access: "interactive",
    properties: {
      ...driveItemId,
      name: stringField("Updated file name."),
      description: stringField("Updated file description."),
      contentBase64: stringField("Replacement base64-encoded content."),
      mimeType: stringField("Replacement content MIME type."),
    },
    required: ["fileId"],
  },
  {
    id: "move_file",
    description: "Move a Google Drive item between folders.",
    access: "interactive",
    properties: {
      ...driveItemId,
      addParentId: stringField("Destination folder ID."),
      removeParentId: stringField("Current folder ID to remove."),
    },
    required: ["fileId", "addParentId"],
  },
  {
    id: "copy_file",
    description: "Copy a Google Drive file.",
    access: "interactive",
    properties: {
      ...driveItemId,
      name: stringField("Name for the copied file."),
      parentId: stringField("Destination folder ID."),
    },
    required: ["fileId"],
  },
  {
    id: "share_file",
    description: "Grant a user, group, domain, or anyone access to a Drive item.",
    access: "interactive",
    properties: {
      ...driveItemId,
      type: stringField("Permission principal type.", {
        enum: ["user", "group", "domain", "anyone"],
      }),
      role: stringField("Permission role.", {
        enum: ["reader", "commenter", "writer"],
      }),
      emailAddress: stringField("User or group email address."),
      domain: stringField("Domain for domain-wide access."),
      sendNotificationEmail: booleanField("Notify the recipient."),
    },
    required: ["fileId", "type", "role"],
  },
  {
    id: "delete_file",
    description: "Move a Google Drive item to trash.",
    access: "interactive",
    properties: driveItemId,
    required: ["fileId"],
  },
]);

const gmailMessageId = {
  messageId: stringField("Gmail message ID."),
};
const gmailThreadId = {
  threadId: stringField("Gmail thread ID."),
};

export const GMAIL_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "search_messages",
    description: "Search messages using Gmail search syntax.",
    access: "read-only",
    properties: {
      query: stringField("Gmail search query."),
      maxResults: numberField("Maximum messages.", { minimum: 1, maximum: 500 }),
      pageToken: stringField("Pagination token."),
      includeSpamTrash: booleanField("Include spam and trash."),
    },
  },
  {
    id: "get_message",
    description: "Retrieve a Gmail message including headers and body parts.",
    access: "read-only",
    properties: {
      ...gmailMessageId,
      format: stringField("Message format.", {
        enum: ["minimal", "full", "raw", "metadata"],
      }),
    },
    required: ["messageId"],
  },
  {
    id: "get_thread",
    description: "Retrieve every message in a Gmail thread.",
    access: "read-only",
    properties: {
      ...gmailThreadId,
      format: stringField("Message format.", {
        enum: ["minimal", "full", "metadata"],
      }),
    },
    required: ["threadId"],
  },
  {
    id: "list_labels",
    description: "List labels in the connected Gmail mailbox.",
    access: "read-only",
  },
  {
    id: "list_drafts",
    description: "List drafts in the connected Gmail mailbox.",
    access: "read-only",
    properties: {
      maxResults: numberField("Maximum drafts.", { minimum: 1, maximum: 500 }),
      pageToken: stringField("Pagination token."),
    },
  },
  {
    id: "get_attachment",
    description: "Download an attachment from a Gmail message.",
    access: "read-only",
    properties: {
      ...gmailMessageId,
      attachmentId: stringField("Attachment ID."),
    },
    required: ["messageId", "attachmentId"],
  },
  {
    id: "create_draft",
    description: "Create a Gmail draft.",
    access: "interactive",
    properties: {
      to: stringArrayField("Recipient email addresses."),
      cc: stringArrayField("CC recipient email addresses."),
      bcc: stringArrayField("BCC recipient email addresses."),
      subject: stringField("Email subject."),
      body: stringField("Plain text or HTML body."),
      bodyType: stringField("Body format.", { enum: ["text", "html"] }),
      threadId: stringField("Thread ID when drafting a reply."),
    },
    required: ["to", "subject", "body"],
  },
  {
    id: "send_message",
    description: "Send a new Gmail message.",
    access: "interactive",
    properties: {
      to: stringArrayField("Recipient email addresses."),
      cc: stringArrayField("CC recipient email addresses."),
      bcc: stringArrayField("BCC recipient email addresses."),
      subject: stringField("Email subject."),
      body: stringField("Plain text or HTML body."),
      bodyType: stringField("Body format.", { enum: ["text", "html"] }),
      attachmentPaths: stringArrayField("Workspace files to attach."),
    },
    required: ["to", "subject", "body"],
  },
  {
    id: "send_draft",
    description: "Send an existing Gmail draft.",
    access: "interactive",
    properties: {
      draftId: stringField("Draft ID."),
    },
    required: ["draftId"],
  },
  {
    id: "reply_to_thread",
    description: "Reply to an existing Gmail conversation.",
    access: "interactive",
    properties: {
      ...gmailThreadId,
      body: stringField("Reply body."),
      bodyType: stringField("Body format.", { enum: ["text", "html"] }),
      replyAll: booleanField("Reply to all recipients."),
      attachmentPaths: stringArrayField("Workspace files to attach."),
    },
    required: ["threadId", "body"],
  },
  {
    id: "modify_message_labels",
    description: "Add or remove labels from a Gmail message.",
    access: "interactive",
    properties: {
      ...gmailMessageId,
      addLabelIds: stringArrayField("Label IDs to add."),
      removeLabelIds: stringArrayField("Label IDs to remove."),
    },
    required: ["messageId"],
  },
  {
    id: "archive_thread",
    description: "Archive every message in a Gmail thread.",
    access: "interactive",
    properties: gmailThreadId,
    required: ["threadId"],
  },
  {
    id: "trash_message",
    description: "Move a Gmail message to trash.",
    access: "interactive",
    properties: gmailMessageId,
    required: ["messageId"],
  },
]);

const oneDriveItemId = {
  itemId: stringField("OneDrive item ID."),
  driveId: stringField("Drive ID. Omit to use the authenticated user's default drive."),
};

export const ONE_DRIVE_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "search_drive_items",
    description: "Search files and folders in OneDrive.",
    access: "read-only",
    properties: {
      query: stringField("Search query."),
      driveId: stringField("Drive ID."),
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 999 }),
      nextLink: stringField("Microsoft Graph pagination URL from the prior response."),
    },
    required: ["query"],
  },
  {
    id: "list_drive_items",
    description: "List files and folders beneath a OneDrive folder.",
    access: "read-only",
    properties: {
      folderId: stringField("Folder ID. Omit for the drive root."),
      driveId: stringField("Drive ID."),
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 999 }),
      nextLink: stringField("Microsoft Graph pagination URL from the prior response."),
    },
  },
  {
    id: "get_drive_item",
    description: "Retrieve metadata for a OneDrive item.",
    access: "read-only",
    properties: oneDriveItemId,
    required: ["itemId"],
  },
  {
    id: "download_drive_item",
    description: "Download the contents of a OneDrive file.",
    access: "read-only",
    properties: oneDriveItemId,
    required: ["itemId"],
  },
  {
    id: "list_item_permissions",
    description: "List principals with access to a OneDrive item.",
    access: "read-only",
    properties: oneDriveItemId,
    required: ["itemId"],
  },
  {
    id: "list_shared_with_me",
    description: "List OneDrive items shared with the authenticated user.",
    access: "read-only",
    properties: {
      pageSize: numberField("Maximum results.", { minimum: 1, maximum: 999 }),
    },
  },
  {
    id: "upload_drive_item",
    description: "Upload a new file to OneDrive.",
    access: "interactive",
    properties: {
      name: stringField("File name."),
      parentId: stringField("Destination folder ID."),
      driveId: stringField("Drive ID."),
      contentBase64: stringField("Base64-encoded file content."),
      conflictBehavior: stringField("Name conflict behavior.", {
        enum: ["fail", "replace", "rename"],
      }),
    },
    required: ["name", "contentBase64"],
  },
  {
    id: "create_drive_folder",
    description: "Create a folder in OneDrive.",
    access: "interactive",
    properties: {
      name: stringField("Folder name."),
      parentId: stringField("Parent folder ID."),
      driveId: stringField("Drive ID."),
      conflictBehavior: stringField("Name conflict behavior.", {
        enum: ["fail", "replace", "rename"],
      }),
    },
    required: ["name"],
  },
  {
    id: "update_drive_item",
    description: "Rename a OneDrive item or update its metadata.",
    access: "interactive",
    properties: {
      ...oneDriveItemId,
      name: stringField("Updated item name."),
      description: stringField("Updated description."),
    },
    required: ["itemId"],
  },
  {
    id: "move_drive_item",
    description: "Move a OneDrive item to another folder.",
    access: "interactive",
    properties: {
      ...oneDriveItemId,
      parentId: stringField("Destination folder ID."),
      name: stringField("Optional new name."),
    },
    required: ["itemId", "parentId"],
  },
  {
    id: "copy_drive_item",
    description: "Copy a OneDrive item to another folder.",
    access: "interactive",
    properties: {
      ...oneDriveItemId,
      parentId: stringField("Destination folder ID."),
      name: stringField("Optional copied item name."),
    },
    required: ["itemId", "parentId"],
  },
  {
    id: "create_sharing_link",
    description: "Create a view or edit sharing link for a OneDrive item.",
    access: "interactive",
    properties: {
      ...oneDriveItemId,
      type: stringField("Sharing link type.", { enum: ["view", "edit", "embed"] }),
      scope: stringField("Sharing scope.", {
        enum: ["anonymous", "organization", "users"],
      }),
    },
    required: ["itemId", "type"],
  },
  {
    id: "delete_drive_item",
    description: "Delete a OneDrive item.",
    access: "interactive",
    properties: oneDriveItemId,
    required: ["itemId"],
  },
]);

const jiraIssueKey = {
  issueIdOrKey: stringField("Jira issue ID or key."),
};
const jiraPagination = {
  startAt: numberField("Zero-based result offset.", { minimum: 0 }),
  maxResults: numberField("Maximum results.", { minimum: 1, maximum: 100 }),
};

export const JIRA_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "get_myself",
    description: "Get the authenticated Jira user's profile and account ID.",
    access: "read-only",
  },
  {
    id: "list_projects",
    description: "List Jira projects visible to the authenticated user.",
    access: "read-only",
    properties: {
      query: stringField("Project name or key query."),
      orderBy: stringField("Project sort field."),
      ...jiraPagination,
    },
  },
  {
    id: "get_project",
    description: "Get a Jira project and its metadata.",
    access: "read-only",
    properties: {
      projectIdOrKey: stringField("Jira project ID or key."),
    },
    required: ["projectIdOrKey"],
  },
  {
    id: "search_issues",
    description: "Search Jira issues using JQL.",
    access: "read-only",
    properties: {
      jql: stringField("Jira Query Language expression."),
      fields: stringArrayField("Issue fields to return."),
      expand: stringArrayField("Issue expansions to return."),
      nextPageToken: stringField("Pagination token."),
      maxResults: numberField("Maximum results.", { minimum: 1, maximum: 100 }),
    },
    required: ["jql"],
  },
  {
    id: "get_issue",
    description: "Get a Jira issue including selected fields and rendered content.",
    access: "read-only",
    properties: {
      ...jiraIssueKey,
      fields: stringArrayField("Issue fields to return."),
      expand: stringArrayField("Issue expansions to return."),
    },
    required: ["issueIdOrKey"],
  },
  {
    id: "get_issue_changelog",
    description: "Read the change history for a Jira issue.",
    access: "read-only",
    properties: {
      ...jiraIssueKey,
      ...jiraPagination,
    },
    required: ["issueIdOrKey"],
  },
  {
    id: "list_comments",
    description: "List comments on a Jira issue.",
    access: "read-only",
    properties: {
      ...jiraIssueKey,
      orderBy: stringField("Comment sort order."),
      expand: stringField("Comma-separated comment expansions, such as properties."),
      ...jiraPagination,
    },
    required: ["issueIdOrKey"],
  },
  {
    id: "get_transitions",
    description: "List transitions currently available for a Jira issue.",
    access: "read-only",
    properties: jiraIssueKey,
    required: ["issueIdOrKey"],
  },
  {
    id: "search_users",
    description: "Search users visible to the authenticated Jira account.",
    access: "read-only",
    properties: {
      query: stringField("Name or email query."),
      accountId: stringField("Exact Atlassian account ID."),
      ...jiraPagination,
    },
  },
  {
    id: "list_issue_types",
    description: "List issue types available in a Jira project.",
    access: "read-only",
    properties: {
      projectIdOrKey: stringField("Jira project ID or key."),
    },
    required: ["projectIdOrKey"],
  },
  {
    id: "list_fields",
    description: "List Jira fields and custom fields.",
    access: "read-only",
    properties: {
      query: stringField("Field name query."),
      type: stringArrayField("Field types to include."),
      ...jiraPagination,
    },
  },
  {
    id: "list_boards",
    description: "List Jira Software boards visible to the authenticated user.",
    access: "read-only",
    properties: {
      projectKeyOrId: stringField("Restrict boards to a project."),
      name: stringField("Board name filter."),
      type: stringField("Board type.", { enum: ["scrum", "kanban", "simple"] }),
      ...jiraPagination,
    },
  },
  {
    id: "list_sprints",
    description: "List sprints for a Jira Software board.",
    access: "read-only",
    properties: {
      boardId: numberField("Jira Software board ID.", { minimum: 1 }),
      state: stringField("Sprint states.", {
        enum: ["active", "future", "closed"],
      }),
      ...jiraPagination,
    },
    required: ["boardId"],
  },
  {
    id: "create_issue",
    description: "Create an issue in a Jira project.",
    access: "interactive",
    properties: {
      projectKey: stringField("Jira project key."),
      issueType: stringField("Issue type name or ID."),
      summary: stringField("Issue summary."),
      description: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format description.",
      },
      assigneeAccountId: stringField("Assignee Atlassian account ID."),
      parentKey: stringField("Parent issue key for subtasks or hierarchy."),
      labels: stringArrayField("Issue labels."),
      fields: {
        type: "object",
        description: "Additional Jira field values.",
        additionalProperties: true,
      },
    },
    required: ["projectKey", "issueType", "summary"],
  },
  {
    id: "update_issue",
    description: "Update fields on a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      fields: {
        type: "object",
        description: "Jira field values to update.",
        additionalProperties: true,
      },
      notifyUsers: booleanField("Notify users about the update."),
    },
    required: ["issueIdOrKey", "fields"],
  },
  {
    id: "delete_issue",
    description: "Permanently delete a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      deleteSubtasks: booleanField("Also delete subtasks."),
    },
    required: ["issueIdOrKey"],
  },
  {
    id: "assign_issue",
    description: "Assign or unassign a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      accountId: stringField("Assignee Atlassian account ID. Use -1 for automatic assignment."),
    },
    required: ["issueIdOrKey", "accountId"],
  },
  {
    id: "transition_issue",
    description: "Move a Jira issue through an available workflow transition.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      transitionId: stringField("Transition ID."),
      fields: {
        type: "object",
        description: "Fields required by the transition screen.",
        additionalProperties: true,
      },
      comment: stringField("Optional transition comment."),
    },
    required: ["issueIdOrKey", "transitionId"],
  },
  {
    id: "add_comment",
    description: "Add a comment to a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      body: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format comment body.",
      },
      visibilityType: stringField("Visibility restriction type.", {
        enum: ["group", "role"],
      }),
      visibilityValue: stringField("Visibility group or project role."),
      properties: entityPropertyArrayField("Optional Jira entity properties stored with the comment."),
    },
    required: ["issueIdOrKey", "body"],
  },
  {
    id: "update_comment",
    description: "Update an existing Jira issue comment.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      commentId: stringField("Comment ID."),
      body: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format comment body.",
      },
    },
    required: ["issueIdOrKey", "commentId", "body"],
  },
  {
    id: "delete_comment",
    description: "Delete a comment from a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      commentId: stringField("Comment ID."),
    },
    required: ["issueIdOrKey", "commentId"],
  },
  {
    id: "add_worklog",
    description: "Record work against a Jira issue.",
    access: "interactive",
    properties: {
      ...jiraIssueKey,
      timeSpentSeconds: numberField("Time spent in seconds.", { minimum: 1 }),
      started: stringField("ISO 8601 start timestamp."),
      comment: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format worklog comment.",
      },
      adjustEstimate: stringField("Estimate adjustment mode.", {
        enum: ["new", "leave", "manual", "auto"],
      }),
    },
    required: ["issueIdOrKey", "timeSpentSeconds"],
  },
  {
    id: "move_issues_to_sprint",
    description: "Move Jira issues into a sprint or backlog.",
    access: "interactive",
    properties: {
      sprintId: numberField("Target sprint ID. Use 0 for backlog.", { minimum: 0 }),
      issueKeys: stringArrayField("Issue keys to move."),
    },
    required: ["sprintId", "issueKeys"],
  },
]);

const confluenceContentId = {
  contentId: stringField("Confluence content or page ID."),
};
const confluencePagination = {
  cursor: stringField("Pagination cursor returned by Atlassian."),
  limit: numberField("Maximum results.", { minimum: 1, maximum: 250 }),
};

export const CONFLUENCE_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "confluence_get_current_user",
    description: "Get the authenticated Confluence user's profile.",
    access: "read-only",
  },
  {
    id: "confluence_list_spaces",
    description: "List Confluence spaces visible to the authenticated user.",
    access: "read-only",
    properties: {
      keys: stringArrayField("Space keys to include."),
      type: stringField("Space type.", { enum: ["global", "personal"] }),
      status: stringField("Space status.", { enum: ["current", "archived"] }),
      ...confluencePagination,
    },
  },
  {
    id: "confluence_get_space",
    description: "Get a Confluence space and its metadata.",
    access: "read-only",
    properties: {
      spaceId: stringField("Confluence space ID."),
    },
    required: ["spaceId"],
  },
  {
    id: "confluence_search_content",
    description: "Search Confluence content using a CQL expression.",
    access: "read-only",
    properties: {
      cql: stringField("Confluence Query Language expression."),
      cqlContext: stringField("Optional serialized CQL context."),
      excerpt: stringField("Excerpt mode.", {
        enum: ["highlight", "indexed", "none"],
      }),
      ...confluencePagination,
    },
    required: ["cql"],
  },
  {
    id: "confluence_get_page",
    description: "Get a Confluence page including its body and version.",
    access: "read-only",
    properties: {
      pageId: stringField("Confluence page ID."),
      bodyFormat: stringField("Requested body format.", {
        enum: ["storage", "atlas_doc_format", "view"],
      }),
      includeLabels: booleanField("Include page labels."),
      includeProperties: booleanField("Include content properties."),
    },
    required: ["pageId"],
  },
  {
    id: "confluence_get_page_children",
    description: "List child pages beneath a Confluence page.",
    access: "read-only",
    properties: {
      pageId: stringField("Parent Confluence page ID."),
      ...confluencePagination,
    },
    required: ["pageId"],
  },
  {
    id: "confluence_list_comments",
    description: "List footer and inline comments on Confluence content.",
    access: "read-only",
    properties: {
      ...confluenceContentId,
      commentType: stringField("Comment type.", {
        enum: ["footer", "inline"],
      }),
      ...confluencePagination,
    },
    required: ["contentId"],
  },
  {
    id: "confluence_list_attachments",
    description: "List files attached to Confluence content.",
    access: "read-only",
    properties: {
      ...confluenceContentId,
      filename: stringField("Optional filename filter."),
      ...confluencePagination,
    },
    required: ["contentId"],
  },
  {
    id: "confluence_create_page",
    description: "Create a page in a Confluence space.",
    access: "interactive",
    properties: {
      spaceId: stringField("Confluence space ID."),
      title: stringField("Page title."),
      body: stringField("Page body."),
      bodyRepresentation: stringField("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      parentId: stringField("Optional parent page ID."),
      status: stringField("Page status.", { enum: ["current", "draft"] }),
    },
    required: ["spaceId", "title", "body"],
  },
  {
    id: "confluence_update_page",
    description: "Update a Confluence page body, title, or status.",
    access: "interactive",
    properties: {
      pageId: stringField("Confluence page ID."),
      title: stringField("Updated page title."),
      body: stringField("Updated page body."),
      bodyRepresentation: stringField("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      versionNumber: numberField("Current version plus one.", { minimum: 2 }),
      versionMessage: stringField("Version message."),
      status: stringField("Page status.", { enum: ["current", "draft"] }),
    },
    required: ["pageId", "title", "body", "versionNumber"],
  },
  {
    id: "confluence_delete_page",
    description: "Move a Confluence page to the trash.",
    access: "interactive",
    properties: {
      pageId: stringField("Confluence page ID."),
      purge: booleanField("Permanently purge eligible content."),
    },
    required: ["pageId"],
  },
  {
    id: "confluence_add_comment",
    description: "Add a footer or inline comment to Confluence content.",
    access: "interactive",
    properties: {
      ...confluenceContentId,
      body: stringField("Comment body in storage or Atlassian document format."),
      bodyRepresentation: stringField("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      commentType: stringField("Comment type.", {
        enum: ["footer", "inline"],
      }),
      inlineProperties: {
        type: "object",
        description: "Inline comment selection metadata.",
        additionalProperties: true,
      },
    },
    required: ["contentId", "body"],
  },
  {
    id: "confluence_update_comment",
    description: "Update an existing Confluence comment.",
    access: "interactive",
    properties: {
      commentId: stringField("Confluence comment ID."),
      body: stringField("Updated comment body."),
      bodyRepresentation: stringField("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      versionNumber: numberField("Current version plus one.", { minimum: 2 }),
    },
    required: ["commentId", "body", "versionNumber"],
  },
  {
    id: "confluence_delete_comment",
    description: "Delete a Confluence footer or inline comment.",
    access: "interactive",
    properties: {
      commentId: stringField("Confluence comment ID."),
      commentType: stringField("Comment type.", {
        enum: ["footer", "inline"],
      }),
    },
    required: ["commentId"],
  },
  {
    id: "confluence_add_attachment",
    description: "Upload a file attachment to Confluence content.",
    access: "interactive",
    properties: {
      ...confluenceContentId,
      filePath: stringField("Workspace file path to upload."),
      filename: stringField("Optional destination filename."),
      comment: stringField("Optional attachment comment."),
    },
    required: ["contentId", "filePath"],
  },
]);

export const ATLASSIAN_CONNECTOR_CAPABILITIES = Object.freeze([
  ...JIRA_CONNECTOR_CAPABILITIES,
  ...CONFLUENCE_CONNECTOR_CAPABILITIES,
]);

const externalThreadFields = {
  agentId: stringField("Agent ID to run."),
  environmentId: stringField("Computer or project environment ID."),
  message: stringField("User message."),
  attachments: stringArrayField("Attachment paths or provider attachment IDs."),
};

function createChannelCapabilities(
  channelLabel: string,
  sourceIdField: string,
): readonly PlatformConnectorCapability[] {
  const sourceId = {
    [sourceIdField]: stringField(`${channelLabel} conversation identifier.`),
  };
  return defineCapabilities([
    {
      id: "list_agents",
      description: `List agents available to the connected ${channelLabel} identity.`,
      access: "read-only",
    },
    {
      id: "list_environments",
      description: `List environments available for work triggered from ${channelLabel}.`,
      access: "read-only",
    },
    {
      id: "get_thread_status",
      description: "Get the current status and latest summary for a Computer Agents thread.",
      access: "read-only",
      properties: {
        threadId: stringField("Computer Agents thread ID."),
      },
      required: ["threadId"],
    },
    {
      id: "start_thread",
      description: `Start an agent thread from a ${channelLabel} message.`,
      access: "interactive",
      properties: {
        ...sourceId,
        ...externalThreadFields,
      },
      required: [sourceIdField, "agentId", "message"],
    },
    {
      id: "continue_thread",
      description: `Continue an existing agent thread from ${channelLabel}.`,
      access: "interactive",
      properties: {
        ...sourceId,
        threadId: stringField("Computer Agents thread ID."),
        message: stringField("Follow-up message."),
        attachments: stringArrayField("Attachment paths or provider attachment IDs."),
      },
      required: [sourceIdField, "threadId", "message"],
    },
    {
      id: "ingest_attachments",
      description: `Bring files from ${channelLabel} into the current thread turn.`,
      access: "interactive",
      properties: {
        ...sourceId,
        threadId: stringField("Computer Agents thread ID."),
        attachmentIds: stringArrayField(`${channelLabel} attachment IDs.`),
      },
      required: [sourceIdField, "threadId", "attachmentIds"],
    },
    {
      id: "send_run_update",
      description: `Send a progress or completion update through ${channelLabel}.`,
      access: "interactive",
      properties: {
        ...sourceId,
        threadId: stringField("Computer Agents thread ID."),
        message: stringField("Update text."),
      },
      required: [sourceIdField, "threadId", "message"],
    },
    {
      id: "send_files",
      description: `Send output files from the latest agent turn through ${channelLabel}.`,
      access: "interactive",
      properties: {
        ...sourceId,
        threadId: stringField("Computer Agents thread ID."),
        filePaths: stringArrayField("Workspace output file paths."),
      },
      required: [sourceIdField, "threadId", "filePaths"],
    },
  ]);
}

export const DISCORD_CONNECTOR_CAPABILITIES = createChannelCapabilities(
  "Discord",
  "channelId",
);

export const TELEGRAM_CONNECTOR_CAPABILITIES = createChannelCapabilities(
  "Telegram",
  "chatId",
);

export const EMAIL_CONNECTOR_CAPABILITIES = defineCapabilities([
  {
    id: "resolve_agent_recipient",
    description: "Resolve an agent inbox address to the current agent.",
    access: "read-only",
    properties: {
      recipient: stringField("Recipient email address."),
    },
    required: ["recipient"],
  },
  {
    id: "get_email_thread_status",
    description: "Get the Computer Agents thread associated with an email conversation.",
    access: "read-only",
    properties: {
      messageId: stringField("RFC 5322 message ID."),
      references: stringArrayField("Message IDs from the References header."),
    },
  },
  {
    id: "start_thread_from_email",
    description: "Start an agent thread from a new incoming email.",
    access: "interactive",
    properties: {
      recipient: stringField("Agent inbox address."),
      sender: stringField("Sender email address."),
      subject: stringField("Email subject."),
      body: stringField("Visible email body."),
      attachmentIds: stringArrayField("Inbound attachment IDs."),
      messageId: stringField("RFC 5322 message ID."),
    },
    required: ["recipient", "sender", "body", "messageId"],
  },
  {
    id: "continue_thread_by_reply",
    description: "Continue the existing thread when its sender replies by email.",
    access: "interactive",
    properties: {
      threadId: stringField("Computer Agents thread ID."),
      sender: stringField("Sender email address."),
      body: stringField("New reply body without quoted history."),
      attachmentIds: stringArrayField("Inbound attachment IDs."),
      messageId: stringField("RFC 5322 message ID."),
    },
    required: ["threadId", "sender", "body", "messageId"],
  },
  {
    id: "ingest_email_attachments",
    description: "Attach incoming email files to the current agent turn.",
    access: "interactive",
    properties: {
      threadId: stringField("Computer Agents thread ID."),
      attachmentIds: stringArrayField("Inbound attachment IDs."),
    },
    required: ["threadId", "attachmentIds"],
  },
  {
    id: "send_run_summary",
    description: "Send the latest run summary to the originating email conversation.",
    access: "interactive",
    properties: {
      threadId: stringField("Computer Agents thread ID."),
      recipient: stringField("Recipient email address."),
      subject: stringField("Reply subject."),
      summaryMarkdown: stringField("Run summary in Markdown."),
      inReplyTo: stringField("RFC 5322 message ID being replied to."),
    },
    required: ["threadId", "recipient", "summaryMarkdown"],
  },
  {
    id: "send_turn_files",
    description: "Attach only output files named in the latest run summary.",
    access: "interactive",
    properties: {
      threadId: stringField("Computer Agents thread ID."),
      recipient: stringField("Recipient email address."),
      filePaths: stringArrayField("Workspace output file paths from the latest turn."),
      inReplyTo: stringField("RFC 5322 message ID being replied to."),
    },
    required: ["threadId", "recipient", "filePaths"],
  },
]);

export const PLATFORM_CONNECTOR_CAPABILITIES = Object.freeze({
  github: GITHUB_CONNECTOR_CAPABILITIES,
  gitlab: GITLAB_CONNECTOR_CAPABILITIES,
  notion: NOTION_CONNECTOR_CAPABILITIES,
  "google-drive": GOOGLE_DRIVE_CONNECTOR_CAPABILITIES,
  gmail: GMAIL_CONNECTOR_CAPABILITIES,
  "one-drive": ONE_DRIVE_CONNECTOR_CAPABILITIES,
  jira: ATLASSIAN_CONNECTOR_CAPABILITIES,
  discord: DISCORD_CONNECTOR_CAPABILITIES,
  telegram: TELEGRAM_CONNECTOR_CAPABILITIES,
  email: EMAIL_CONNECTOR_CAPABILITIES,
  ...ADDITIONAL_CONNECTOR_CAPABILITIES,
} satisfies Readonly<Record<string, readonly PlatformConnectorCapability[]>>);
