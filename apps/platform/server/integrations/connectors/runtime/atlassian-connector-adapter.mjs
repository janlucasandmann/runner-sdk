import {
  resolveJiraCredentialForOrganization,
} from "../../jira-oauth.mjs";

const ATLASSIAN_API_ORIGIN = "https://api.atlassian.com";
const COMPUTER_AGENTS_ISSUE_PROPERTY_KEY = "computer-agents.attribution";

const string = (description, options = {}) => ({
  type: "string",
  description,
  ...options,
});
const number = (description, options = {}) => ({
  type: "number",
  description,
  ...options,
});
const boolean = (description) => ({
  type: "boolean",
  description,
});
const strings = (description) => ({
  type: "array",
  description,
  items: { type: "string" },
});
const object = (description) => ({
  type: "object",
  description,
  additionalProperties: true,
});
const entityProperties = (description) => ({
  type: "array",
  description,
  items: {
    type: "object",
    properties: {
      key: string("Entity property key."),
      value: object("JSON object stored as the entity property value."),
    },
    required: ["key", "value"],
    additionalProperties: false,
  },
});
const input = (properties = {}, required = []) => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
});

const ISSUE_KEY = {
  issueIdOrKey: string("Jira issue ID or key."),
};
const START_PAGINATION = {
  startAt: number("Zero-based result offset.", { minimum: 0 }),
  maxResults: number("Maximum results.", { minimum: 1, maximum: 100 }),
};
const CURSOR_PAGINATION = {
  cursor: string("Pagination cursor returned by Atlassian."),
  limit: number("Maximum results.", { minimum: 1, maximum: 250 }),
};

const INTERACTIVE_ACTION_IDS = new Set([
  "create_issue",
  "update_issue",
  "delete_issue",
  "assign_issue",
  "transition_issue",
  "add_comment",
  "update_comment",
  "delete_comment",
  "add_worklog",
  "move_issues_to_sprint",
  "confluence_create_page",
  "confluence_update_page",
  "confluence_delete_page",
  "confluence_add_comment",
  "confluence_update_comment",
  "confluence_delete_comment",
  "confluence_add_attachment",
]);

const TOOL_DEFINITIONS = Object.freeze([
  tool("get_myself", "Get the authenticated Jira user's profile and account ID."),
  tool(
    "list_projects",
    "List Jira projects visible to the connected Atlassian account.",
    input({
      query: string("Project name or key query."),
      orderBy: string("Project sort field."),
      ...START_PAGINATION,
    }),
  ),
  tool(
    "get_project",
    "Get a Jira project and its metadata.",
    input({ projectIdOrKey: string("Jira project ID or key.") }, ["projectIdOrKey"]),
  ),
  tool(
    "search_issues",
    "Search Jira issues using JQL.",
    input({
      jql: string("Jira Query Language expression."),
      fields: strings("Issue fields to return."),
      expand: strings("Issue expansions to return."),
      nextPageToken: string("Pagination token."),
      maxResults: number("Maximum results.", { minimum: 1, maximum: 100 }),
    }, ["jql"]),
  ),
  tool(
    "get_issue",
    "Get a Jira issue including selected fields and rendered content.",
    input({
      ...ISSUE_KEY,
      fields: strings("Issue fields to return."),
      expand: strings("Issue expansions to return."),
    }, ["issueIdOrKey"]),
  ),
  tool(
    "get_issue_changelog",
    "Read the change history for a Jira issue.",
    input({ ...ISSUE_KEY, ...START_PAGINATION }, ["issueIdOrKey"]),
  ),
  tool(
    "list_comments",
    "List comments on a Jira issue.",
    input({
      ...ISSUE_KEY,
      orderBy: string("Comment sort order."),
      expand: string("Comma-separated comment expansions, such as properties."),
      ...START_PAGINATION,
    }, ["issueIdOrKey"]),
  ),
  tool(
    "get_transitions",
    "List transitions currently available for a Jira issue.",
    input(ISSUE_KEY, ["issueIdOrKey"]),
  ),
  tool(
    "search_users",
    "Search users visible to the connected Atlassian account.",
    input({
      query: string("Name or email query."),
      accountId: string("Exact Atlassian account ID."),
      ...START_PAGINATION,
    }),
  ),
  tool(
    "list_issue_types",
    "List issue types available in a Jira project.",
    input({ projectIdOrKey: string("Jira project ID or key.") }, ["projectIdOrKey"]),
  ),
  tool(
    "list_fields",
    "List Jira fields and custom fields.",
    input({
      query: string("Field name query."),
      type: strings("Field types to include."),
      ...START_PAGINATION,
    }),
  ),
  tool(
    "list_boards",
    "List Jira Software boards visible to the connected account.",
    input({
      projectKeyOrId: string("Restrict boards to a project."),
      name: string("Board name filter."),
      type: string("Board type.", { enum: ["scrum", "kanban", "simple"] }),
      ...START_PAGINATION,
    }),
  ),
  tool(
    "list_sprints",
    "List sprints for a Jira Software board.",
    input({
      boardId: number("Jira Software board ID.", { minimum: 1 }),
      state: string("Sprint state.", { enum: ["active", "future", "closed"] }),
      ...START_PAGINATION,
    }, ["boardId"]),
  ),
  tool(
    "create_issue",
    "Create an issue in Jira using the connected Atlassian account.",
    input({
      projectKey: string("Jira project key."),
      issueType: string("Issue type name or ID."),
      summary: string("Issue summary."),
      description: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format description.",
      },
      assigneeAccountId: string("Assignee Atlassian account ID."),
      parentKey: string("Parent issue key."),
      labels: strings("Issue labels."),
      fields: object("Additional Jira field values."),
    }, ["projectKey", "issueType", "summary"]),
  ),
  tool(
    "update_issue",
    "Update fields on a Jira issue.",
    input({
      ...ISSUE_KEY,
      fields: object("Jira field values to update."),
      notifyUsers: boolean("Notify users about the update."),
    }, ["issueIdOrKey", "fields"]),
  ),
  tool(
    "delete_issue",
    "Permanently delete a Jira issue.",
    input({
      ...ISSUE_KEY,
      deleteSubtasks: boolean("Also delete subtasks."),
    }, ["issueIdOrKey"]),
  ),
  tool(
    "assign_issue",
    "Assign or unassign a Jira issue.",
    input({
      ...ISSUE_KEY,
      accountId: string("Assignee Atlassian account ID. Use -1 for automatic assignment."),
    }, ["issueIdOrKey", "accountId"]),
  ),
  tool(
    "transition_issue",
    "Move a Jira issue through an available workflow transition.",
    input({
      ...ISSUE_KEY,
      transitionId: string("Transition ID."),
      fields: object("Fields required by the transition screen."),
      comment: string("Optional transition comment."),
    }, ["issueIdOrKey", "transitionId"]),
  ),
  tool(
    "add_comment",
    "Add a comment to a Jira issue.",
    input({
      ...ISSUE_KEY,
      body: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format comment body.",
      },
      visibilityType: string("Visibility restriction type.", {
        enum: ["group", "role"],
      }),
      visibilityValue: string("Visibility group or project role."),
      properties: entityProperties("Optional Jira entity properties stored with the comment."),
    }, ["issueIdOrKey", "body"]),
  ),
  tool(
    "update_comment",
    "Update an existing Jira issue comment.",
    input({
      ...ISSUE_KEY,
      commentId: string("Comment ID."),
      body: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format comment body.",
      },
    }, ["issueIdOrKey", "commentId", "body"]),
  ),
  tool(
    "delete_comment",
    "Delete a comment from a Jira issue.",
    input({
      ...ISSUE_KEY,
      commentId: string("Comment ID."),
    }, ["issueIdOrKey", "commentId"]),
  ),
  tool(
    "add_worklog",
    "Record work against a Jira issue.",
    input({
      ...ISSUE_KEY,
      timeSpentSeconds: number("Time spent in seconds.", { minimum: 1 }),
      started: string("ISO 8601 start timestamp."),
      comment: {
        type: ["string", "object"],
        description: "Plain text or Atlassian Document Format worklog comment.",
      },
      adjustEstimate: string("Estimate adjustment mode.", {
        enum: ["new", "leave", "manual", "auto"],
      }),
    }, ["issueIdOrKey", "timeSpentSeconds"]),
  ),
  tool(
    "move_issues_to_sprint",
    "Move Jira issues into a sprint or backlog.",
    input({
      sprintId: number("Target sprint ID. Use 0 for backlog.", { minimum: 0 }),
      issueKeys: strings("Issue keys to move."),
    }, ["sprintId", "issueKeys"]),
  ),
  tool(
    "confluence_get_current_user",
    "Get the authenticated Confluence user's profile.",
  ),
  tool(
    "confluence_list_spaces",
    "List Confluence spaces visible to the connected account.",
    input({
      keys: strings("Space keys to include."),
      type: string("Space type.", { enum: ["global", "personal"] }),
      status: string("Space status.", { enum: ["current", "archived"] }),
      ...CURSOR_PAGINATION,
    }),
  ),
  tool(
    "confluence_get_space",
    "Get a Confluence space and its metadata.",
    input({ spaceId: string("Confluence space ID.") }, ["spaceId"]),
  ),
  tool(
    "confluence_search_content",
    "Search Confluence content using a CQL expression.",
    input({
      cql: string("Confluence Query Language expression."),
      cqlContext: string("Optional serialized CQL context."),
      excerpt: string("Excerpt mode.", {
        enum: ["highlight", "indexed", "none"],
      }),
      ...CURSOR_PAGINATION,
    }, ["cql"]),
  ),
  tool(
    "confluence_get_page",
    "Get a Confluence page including its body and version.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      pageId: string("Confluence page ID."),
      bodyFormat: string("Requested body format.", {
        enum: ["storage", "atlas_doc_format", "view"],
      }),
      includeLabels: boolean("Include page labels."),
      includeProperties: boolean("Include content properties."),
    }, ["spaceId", "pageId"]),
  ),
  tool(
    "confluence_get_page_children",
    "List child pages beneath a Confluence page.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      pageId: string("Parent Confluence page ID."),
      ...CURSOR_PAGINATION,
    }, ["spaceId", "pageId"]),
  ),
  tool(
    "confluence_list_comments",
    "List footer or inline comments on Confluence content.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      contentId: string("Confluence content or page ID."),
      commentType: string("Comment type.", { enum: ["footer", "inline"] }),
      ...CURSOR_PAGINATION,
    }, ["spaceId", "contentId"]),
  ),
  tool(
    "confluence_list_attachments",
    "List files attached to Confluence content.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      contentId: string("Confluence content or page ID."),
      filename: string("Optional filename filter."),
      ...CURSOR_PAGINATION,
    }, ["spaceId", "contentId"]),
  ),
  tool(
    "confluence_create_page",
    "Create a page in a Confluence space.",
    input({
      spaceId: string("Confluence space ID."),
      title: string("Page title."),
      body: string("Page body."),
      bodyRepresentation: string("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      parentId: string("Optional parent page ID."),
      status: string("Page status.", { enum: ["current", "draft"] }),
    }, ["spaceId", "title", "body"]),
  ),
  tool(
    "confluence_update_page",
    "Update a Confluence page body, title, or status.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      pageId: string("Confluence page ID."),
      title: string("Updated page title."),
      body: string("Updated page body."),
      bodyRepresentation: string("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      versionNumber: number("Current version plus one.", { minimum: 2 }),
      versionMessage: string("Version message."),
      status: string("Page status.", { enum: ["current", "draft"] }),
    }, ["spaceId", "pageId", "title", "body", "versionNumber"]),
  ),
  tool(
    "confluence_delete_page",
    "Move a Confluence page to trash or permanently purge it.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      pageId: string("Confluence page ID."),
      purge: boolean("Permanently purge eligible content."),
    }, ["spaceId", "pageId"]),
  ),
  tool(
    "confluence_add_comment",
    "Add a footer or inline comment to Confluence content.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      contentId: string("Confluence content or page ID."),
      body: string("Comment body."),
      bodyRepresentation: string("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      commentType: string("Comment type.", { enum: ["footer", "inline"] }),
      inlineProperties: object("Inline comment selection metadata."),
    }, ["spaceId", "contentId", "body"]),
  ),
  tool(
    "confluence_update_comment",
    "Update an existing Confluence comment.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      commentId: string("Confluence comment ID."),
      body: string("Updated comment body."),
      bodyRepresentation: string("Body representation.", {
        enum: ["storage", "atlas_doc_format"],
      }),
      versionNumber: number("Current version plus one.", { minimum: 2 }),
    }, ["spaceId", "commentId", "body", "versionNumber"]),
  ),
  tool(
    "confluence_delete_comment",
    "Delete a Confluence footer or inline comment.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      commentId: string("Confluence comment ID."),
      commentType: string("Comment type.", { enum: ["footer", "inline"] }),
    }, ["spaceId", "commentId"]),
  ),
  tool(
    "confluence_add_attachment",
    "Upload a workspace file attachment to Confluence content. This requires a file-transfer capable runtime.",
    input({
      spaceId: string("Confluence space ID used to enforce project-scoped access."),
      contentId: string("Confluence content or page ID."),
      filePath: string("Workspace file path to upload."),
      filename: string("Optional destination filename."),
      comment: string("Optional attachment comment."),
    }, ["spaceId", "contentId", "filePath"]),
  ),
]);

const TOOL_BY_NAME = new Map(
  TOOL_DEFINITIONS.map((definition) => [definition.name, definition]),
);

export class AtlassianConnectorError extends Error {
  constructor(message, {
    code = "atlassian_request_failed",
    statusCode = 502,
    details,
  } = {}) {
    super(message);
    this.name = "AtlassianConnectorError";
    this.code = code;
    this.statusCode = statusCode;
    if (details !== undefined) this.details = details;
  }
}

export function createAtlassianConnectorAdapter({
  resolveCredential = resolveJiraCredentialForOrganization,
  fetchImpl = globalThis.fetch,
  envFileCandidates = [],
} = {}) {
  if (typeof resolveCredential !== "function") {
    throw new TypeError("Atlassian adapter requires a credential resolver.");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Atlassian adapter requires fetch.");
  }

  function listTools(actionIds) {
    if (!Array.isArray(actionIds)) return TOOL_DEFINITIONS;
    const allowed = new Set(actionIds.map(String));
    return TOOL_DEFINITIONS.filter((definition) => allowed.has(definition.name));
  }

  function listCapabilities() {
    return TOOL_DEFINITIONS.map((definition) => Object.freeze({
      id: definition.name,
      access: definition.access,
    }));
  }

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOL_BY_NAME.get(String(name || ""));
    if (!definition) {
      throw new AtlassianConnectorError("Unknown Atlassian action.", {
        code: "connector_action_unknown",
        statusCode: 404,
      });
    }
    const args = isRecord(rawArguments) ? rawArguments : {};
    const credentialRequest = {
      organizationId: grant.organizationId,
      credentialId: grant.credentialId,
      envFileCandidates,
    };
    const credential = await resolveCredential(credentialRequest);
    const clientDetails = getAtlassianClientDetails(credential);
    if (!clientDetails) {
      throw new AtlassianConnectorError(
        "The selected Atlassian credentials are unavailable or incomplete.",
        {
          code: "connector_credentials_unavailable",
          statusCode: 401,
        },
      );
    }
    const client = createAtlassianClient({
      ...clientDetails,
      fetchImpl,
    });
    try {
      return await invokeAtlassianAction(client, definition.name, args, grant);
    } catch (error) {
      if (error?.statusCode !== 401) throw error;

      // Access tokens can expire before their stored expiry. Refresh exactly
      // once and retry the original action; permission failures (403) still
      // surface directly to the caller.
      const refreshedCredential = await resolveCredential({
        ...credentialRequest,
        forceRefresh: true,
      });
      const refreshedDetails = getAtlassianClientDetails(refreshedCredential);
      if (
        !refreshedDetails
        || refreshedDetails.accessToken === clientDetails.accessToken
      ) {
        throw error;
      }
      return invokeAtlassianAction(
        createAtlassianClient({ ...refreshedDetails, fetchImpl }),
        definition.name,
        args,
        grant,
      );
    }
  }

  return Object.freeze({
    id: "jira",
    aliases: Object.freeze(["jira", "atlassian"]),
    invoke,
    listCapabilities,
    listTools,
  });
}

function getAtlassianClientDetails(credential) {
  const accessToken = String(credential?.token?.accessToken || "").trim();
  const cloudId = String(
    credential?.token?.cloudId
      || credential?.profile?.cloudId
      || credential?.identity?.cloudId
      || "",
  ).trim();
  return accessToken && cloudId ? { accessToken, cloudId } : null;
}

async function invokeAtlassianAction(client, name, args, grant = {}) {
  switch (name) {
    case "get_myself":
      return client.jira("GET", "/rest/api/3/myself");
    case "list_projects":
      return client.jira("GET", "/rest/api/3/project/search", {
        query: compactQuery(args, ["query", "orderBy", "startAt", "maxResults"]),
      });
    case "get_project":
      return client.jira(
        "GET",
        `/rest/api/3/project/${path(args.projectIdOrKey)}`,
      );
    case "search_issues":
      return client.jira("POST", "/rest/api/3/search/jql", {
        body: compactObject(args, [
          "jql",
          "fields",
          "expand",
          "nextPageToken",
          "maxResults",
        ]),
      });
    case "get_issue":
      return client.jira(
        "GET",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}`,
        { query: compactQuery(args, ["fields", "expand"]) },
      );
    case "get_issue_changelog":
      return client.jira(
        "GET",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/changelog`,
        { query: compactQuery(args, ["startAt", "maxResults"]) },
      );
    case "list_comments":
      return client.jira(
        "GET",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/comment`,
        { query: compactQuery(args, ["orderBy", "startAt", "maxResults", "expand"]) },
      );
    case "get_transitions":
      return client.jira(
        "GET",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/transitions`,
      );
    case "search_users":
      return client.jira("GET", "/rest/api/3/user/search", {
        query: compactQuery(args, [
          "query",
          "accountId",
          "startAt",
          "maxResults",
        ]),
      });
    case "list_issue_types": {
      const project = await client.jira(
        "GET",
        `/rest/api/3/project/${path(args.projectIdOrKey)}`,
      );
      return client.jira("GET", "/rest/api/3/issuetype/project", {
        query: { projectId: project.id },
      });
    }
    case "list_fields":
      return client.jira("GET", "/rest/api/3/field/search", {
        query: compactQuery(args, ["query", "type", "startAt", "maxResults"]),
      });
    case "list_boards":
      return client.agile("GET", "/rest/agile/1.0/board", {
        query: compactQuery(args, [
          "projectKeyOrId",
          "name",
          "type",
          "startAt",
          "maxResults",
        ]),
      });
    case "list_sprints":
      return client.agile(
        "GET",
        `/rest/agile/1.0/board/${path(args.boardId)}/sprint`,
        { query: compactQuery(args, ["state", "startAt", "maxResults"]) },
      );
    case "create_issue":
      return client.jira("POST", "/rest/api/3/issue", {
        body: compactObject({
          fields: compactObject({
            ...(isRecord(args.fields) ? args.fields : {}),
            project: { key: args.projectKey },
            issuetype: /^\d+$/.test(String(args.issueType || ""))
              ? { id: String(args.issueType) }
              : { name: args.issueType },
            summary: args.summary,
            description: toAtlassianDocument(args.description),
            assignee: args.assigneeAccountId
              ? { accountId: args.assigneeAccountId }
              : undefined,
            parent: args.parentKey ? { key: args.parentKey } : undefined,
            labels: args.labels,
          }),
          ...buildAgentAttribution(grant),
        }),
      });
    case "update_issue":
      return client.jira(
        "PUT",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}`,
        {
          query: args.notifyUsers === undefined
            ? undefined
            : { notifyUsers: args.notifyUsers },
          body: { fields: args.fields },
        },
      );
    case "delete_issue":
      return client.jira(
        "DELETE",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}`,
        {
          query: args.deleteSubtasks === undefined
            ? undefined
            : { deleteSubtasks: args.deleteSubtasks },
        },
      );
    case "assign_issue":
      return client.jira(
        "PUT",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/assignee`,
        { body: { accountId: args.accountId } },
      );
    case "transition_issue":
      return client.jira(
        "POST",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/transitions`,
        {
          body: compactObject({
            transition: { id: args.transitionId },
            fields: args.fields,
            update: args.comment
              ? {
                  comment: [{
                    add: { body: toAtlassianDocument(args.comment) },
                  }],
                }
              : undefined,
          }),
        },
      );
    case "add_comment":
      return client.jira(
        "POST",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/comment`,
        {
          body: compactObject({
            body: toAtlassianDocument(args.body),
            visibility: args.visibilityType && args.visibilityValue
              ? {
                  type: args.visibilityType,
                  value: args.visibilityValue,
                }
              : undefined,
            properties: Array.isArray(args.properties) && args.properties.length
              ? args.properties
              : undefined,
          }),
        },
      );
    case "update_comment":
      return client.jira(
        "PUT",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/comment/${path(args.commentId)}`,
        { body: { body: toAtlassianDocument(args.body) } },
      );
    case "delete_comment":
      return client.jira(
        "DELETE",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/comment/${path(args.commentId)}`,
      );
    case "add_worklog":
      return client.jira(
        "POST",
        `/rest/api/3/issue/${path(args.issueIdOrKey)}/worklog`,
        {
          query: args.adjustEstimate
            ? { adjustEstimate: args.adjustEstimate }
            : undefined,
          body: compactObject({
            timeSpentSeconds: args.timeSpentSeconds,
            started: args.started,
            comment: args.comment
              ? toAtlassianDocument(args.comment)
              : undefined,
          }),
        },
      );
    case "move_issues_to_sprint":
      return client.agile(
        "PUT",
        `/rest/agile/1.0/sprint/${path(args.sprintId)}/issue`,
        { body: { issues: args.issueKeys } },
      );
    case "confluence_get_current_user":
      return client.confluence("GET", "/wiki/rest/api/user/current");
    case "confluence_list_spaces":
      return client.confluence("GET", "/wiki/api/v2/spaces", {
        query: compactQuery(args, ["keys", "type", "status", "cursor", "limit"]),
      });
    case "confluence_get_space":
      return client.confluence(
        "GET",
        `/wiki/api/v2/spaces/${path(args.spaceId)}`,
      );
    case "confluence_search_content":
      return client.confluence("GET", "/wiki/rest/api/search", {
        query: compactQuery(args, [
          "cql",
          "cqlContext",
          "excerpt",
          "cursor",
          "limit",
        ]),
      });
    case "confluence_get_page":
      return client.confluence(
        "GET",
        `/wiki/api/v2/pages/${path(args.pageId)}`,
        {
          query: compactQuery(args, [
            "bodyFormat",
            "includeLabels",
            "includeProperties",
          ]),
        },
      );
    case "confluence_get_page_children":
      return client.confluence(
        "GET",
        `/wiki/api/v2/pages/${path(args.pageId)}/children`,
        { query: compactQuery(args, ["cursor", "limit"]) },
      );
    case "confluence_list_comments": {
      const type = args.commentType === "inline"
        ? "inline-comments"
        : "footer-comments";
      return client.confluence(
        "GET",
        `/wiki/api/v2/pages/${path(args.contentId)}/${type}`,
        { query: compactQuery(args, ["cursor", "limit"]) },
      );
    }
    case "confluence_list_attachments":
      return client.confluence(
        "GET",
        `/wiki/api/v2/pages/${path(args.contentId)}/attachments`,
        { query: compactQuery(args, ["filename", "cursor", "limit"]) },
      );
    case "confluence_create_page":
      return client.confluence("POST", "/wiki/api/v2/pages", {
        body: compactObject({
          spaceId: args.spaceId,
          status: args.status || "current",
          title: args.title,
          parentId: args.parentId,
          body: {
            representation: args.bodyRepresentation || "storage",
            value: args.body,
          },
        }),
      });
    case "confluence_update_page":
      return client.confluence(
        "PUT",
        `/wiki/api/v2/pages/${path(args.pageId)}`,
        {
          body: compactObject({
            id: args.pageId,
            status: args.status || "current",
            title: args.title,
            body: {
              representation: args.bodyRepresentation || "storage",
              value: args.body,
            },
            version: {
              number: args.versionNumber,
              message: args.versionMessage || "",
            },
          }),
        },
      );
    case "confluence_delete_page":
      return client.confluence(
        "DELETE",
        `/wiki/api/v2/pages/${path(args.pageId)}`,
        { query: args.purge ? { purge: true } : undefined },
      );
    case "confluence_add_comment": {
      const type = args.commentType === "inline"
        ? "inline-comments"
        : "footer-comments";
      return client.confluence("POST", `/wiki/api/v2/${type}`, {
        body: compactObject({
          pageId: args.contentId,
          body: {
            representation: args.bodyRepresentation || "storage",
            value: args.body,
          },
          properties: args.inlineProperties,
        }),
      });
    }
    case "confluence_update_comment": {
      const type = args.commentType === "inline"
        ? "inline-comments"
        : "footer-comments";
      return client.confluence(
        "PUT",
        `/wiki/api/v2/${type}/${path(args.commentId)}`,
        {
          body: {
            id: args.commentId,
            body: {
              representation: args.bodyRepresentation || "storage",
              value: args.body,
            },
            version: { number: args.versionNumber },
          },
        },
      );
    }
    case "confluence_delete_comment": {
      const type = args.commentType === "inline"
        ? "inline-comments"
        : "footer-comments";
      return client.confluence(
        "DELETE",
        `/wiki/api/v2/${type}/${path(args.commentId)}`,
      );
    }
    case "confluence_add_attachment":
      throw new AtlassianConnectorError(
        "Workspace file transfer is not available through this connector runtime yet.",
        {
          code: "connector_file_transfer_unavailable",
          statusCode: 501,
        },
      );
    default:
      throw new AtlassianConnectorError("Unknown Atlassian action.", {
        code: "connector_action_unknown",
        statusCode: 404,
      });
  }
}

function createAtlassianClient({ accessToken, cloudId, fetchImpl }) {
  const cloudPath = encodeURIComponent(cloudId);
  const request = async (method, pathname, options = {}) => {
    const url = new URL(pathname, ATLASSIAN_API_ORIGIN);
    appendQuery(url, options.query);
    const response = await fetchImpl(url, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
      cache: "no-store",
    });
    const text = await response.text().catch(() => "");
    const payload = parseJson(text);
    if (!response.ok) {
      throw new AtlassianConnectorError(
        readAtlassianError(payload, response.statusText),
        {
          code: response.status === 401 || response.status === 403
            ? "connector_provider_access_denied"
            : "connector_provider_request_failed",
          statusCode: response.status,
          details: payload,
        },
      );
    }
    return response.status === 204
      ? { ok: true, status: 204 }
      : payload;
  };
  return Object.freeze({
    jira: (method, suffix, options) =>
      request(method, `/ex/jira/${cloudPath}${suffix}`, options),
    agile: (method, suffix, options) =>
      request(method, `/ex/jira/${cloudPath}${suffix}`, options),
    confluence: (method, suffix, options) =>
      request(method, `/ex/confluence/${cloudPath}${suffix}`, options),
  });
}

function tool(name, description, inputSchema = input()) {
  return Object.freeze({
    name,
    access: INTERACTIVE_ACTION_IDS.has(name) ? "interactive" : "read-only",
    description: `${description} Uses the credential already selected for this thread; do not ask the user for credentials.`,
    inputSchema,
  });
}

function compactObject(value, keys) {
  const source = isRecord(value) ? value : {};
  const selectedKeys = Array.isArray(keys) ? keys : Object.keys(source);
  return Object.fromEntries(
    selectedKeys.flatMap((key) =>
      source[key] === undefined || source[key] === null || source[key] === ""
        ? []
        : [[key, source[key]]],
    ),
  );
}

function compactQuery(value, keys) {
  const result = compactObject(value, keys);
  for (const [key, entry] of Object.entries(result)) {
    if (Array.isArray(entry)) result[key] = entry.join(",");
  }
  return result;
}

function appendQuery(url, query) {
  if (!isRecord(query)) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

function path(value) {
  return encodeURIComponent(String(value ?? ""));
}

function toAtlassianDocument(value) {
  if (isRecord(value)) return value;
  const text = String(value ?? "");
  const content = text
    .split(/\n{2,}/)
    .map((paragraph) => ({
      type: "paragraph",
      content: paragraph
        ? [{ type: "text", text: paragraph.replace(/\n/g, "\n") }]
        : [],
    }));
  return {
    type: "doc",
    version: 1,
    content: content.length ? content : [{ type: "paragraph", content: [] }],
  };
}

function buildAgentAttribution(grant) {
  const agentId = normalizeAttributionValue(grant?.agentId, 200);
  const agentName = normalizeAttributionValue(grant?.agentName, 200);
  if (!agentId && !agentName) return {};

  const displayName = agentName || agentId;
  return {
    historyMetadata: {
      activityDescription: `Created by ${displayName} through Computer Agents`,
      actor: {
        id: agentId || displayName,
        displayName,
        type: "computer-agents-agent",
      },
      generator: {
        id: "computer-agents",
        displayName: "Computer Agents",
        type: "computer-agents-application",
      },
      type: "computer-agents:agent-action",
    },
    properties: [{
      key: COMPUTER_AGENTS_ISSUE_PROPERTY_KEY,
      value: {
        agentId: agentId || undefined,
        agentName: displayName,
        source: "computer-agents",
      },
    }],
  };
}

function normalizeAttributionValue(value, maximumLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);
}

function parseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

function readAtlassianError(payload, fallback) {
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  if (Array.isArray(payload?.errorMessages) && payload.errorMessages.length) {
    return payload.errorMessages.map(String).join("; ");
  }
  if (isRecord(payload?.errors) && Object.keys(payload.errors).length) {
    return Object.entries(payload.errors)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("; ");
  }
  return String(fallback || "Atlassian request failed.");
}

function isRecord(value) {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value);
}
