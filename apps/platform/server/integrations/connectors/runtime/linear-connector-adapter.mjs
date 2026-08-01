import {
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createOAuthCredentialRuntime,
  createProviderRequestError,
  defineRuntimeTools,
  invalidInput,
  isRecord,
  numberSchema,
  objectSchema,
  readJsonResponse,
  readString,
  requireString,
  requireStringArray,
  stringArraySchema,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";
const LINEAR_TOKEN_URL = "https://api.linear.app/oauth/token";

const pagination = {
  cursor: stringSchema("Opaque Linear pagination cursor."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const TOOLS = defineRuntimeTools("Linear", [
  {
    name: "get_viewer",
    description: "Get the authenticated Linear user and organization.",
  },
  {
    name: "list_teams",
    description: "List Linear teams visible to the authenticated user.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "list_projects",
    description: "List or search projects in the connected Linear workspace.",
    inputSchema: objectSchema({
      query: stringSchema("Optional project search query."),
      teamId: stringSchema("Optional Linear team ID."),
      ...pagination,
    }),
  },
  {
    name: "get_project",
    description: "Get a Linear project with status, teams, and members.",
    inputSchema: objectSchema({ projectId: stringSchema("Linear project ID.") }, ["projectId"]),
  },
  {
    name: "search_issues",
    description: "Search issues visible in the connected Linear workspace.",
    inputSchema: objectSchema(
      {
        query: stringSchema("Issue search query."),
        teamId: stringSchema("Optional Linear team ID."),
        projectId: stringSchema("Optional Linear project ID."),
        states: stringArraySchema("Optional workflow state names."),
        ...pagination,
      },
      ["query"],
    ),
  },
  {
    name: "get_issue",
    description: "Get a Linear issue with comments, attachments, and relationships.",
    inputSchema: objectSchema({ issueId: stringSchema("Linear issue ID or identifier.") }, [
      "issueId",
    ]),
  },
  {
    name: "list_issue_comments",
    description: "List comments for a Linear issue.",
    inputSchema: objectSchema(
      {
        issueId: stringSchema("Linear issue ID or identifier."),
        ...pagination,
      },
      ["issueId"],
    ),
  },
  {
    name: "create_issue",
    access: "interactive",
    description: "Create an issue in a Linear team.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Linear team ID."),
        title: stringSchema("Issue title."),
        description: stringSchema("Issue description in Markdown."),
        projectId: stringSchema("Optional project ID."),
        assigneeId: stringSchema("Optional assignee user ID."),
        labelIds: stringArraySchema("Optional label IDs."),
      },
      ["teamId", "title"],
    ),
  },
  {
    name: "update_issue",
    access: "interactive",
    description: "Update fields on an existing Linear issue.",
    inputSchema: objectSchema(
      {
        issueId: stringSchema("Linear issue ID or identifier."),
        title: stringSchema("Updated title."),
        description: stringSchema("Updated Markdown description."),
        stateId: stringSchema("Updated workflow state ID."),
        assigneeId: stringSchema("Updated assignee user ID."),
        projectId: stringSchema("Updated project ID."),
      },
      ["issueId"],
    ),
  },
  {
    name: "add_issue_comment",
    access: "interactive",
    description: "Add a comment to a Linear issue.",
    inputSchema: objectSchema(
      {
        issueId: stringSchema("Linear issue ID or identifier."),
        body: stringSchema("Comment body in Markdown."),
      },
      ["issueId", "body"],
    ),
  },
  {
    name: "create_project",
    access: "interactive",
    description: "Create a project in a Linear workspace.",
    inputSchema: objectSchema(
      {
        teamIds: stringArraySchema("Linear team IDs."),
        name: stringSchema("Project name."),
        summary: stringSchema("Project summary."),
        description: stringSchema("Project description in Markdown."),
      },
      ["teamIds", "name"],
    ),
  },
  {
    name: "update_project",
    access: "interactive",
    description: "Update a Linear project's metadata or status.",
    inputSchema: objectSchema(
      {
        projectId: stringSchema("Linear project ID."),
        name: stringSchema("Updated project name."),
        summary: stringSchema("Updated summary."),
        description: stringSchema("Updated Markdown description."),
        statusId: stringSchema("Updated project status ID."),
      },
      ["projectId"],
    ),
  },
]);

const VIEWER_QUERY = `
  query ConnectorViewer {
    viewer {
      id
      name
      displayName
      email
      avatarUrl
      organization {
        id
        name
        urlKey
      }
    }
  }
`;

const TEAMS_QUERY = `
  query ConnectorTeams($first: Int!, $after: String) {
    teams(first: $first, after: $after) {
      nodes {
        id
        key
        name
        description
        icon
        color
        private
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PROJECTS_QUERY = `
  query ConnectorProjects(
    $first: Int!
    $after: String
    $filter: ProjectFilter
  ) {
    projects(first: $first, after: $after, filter: $filter) {
      nodes {
        id
        name
        summary
        description
        url
        createdAt
        updatedAt
        startDate
        targetDate
        status {
          id
          name
          type
          color
        }
        lead {
          id
          name
          displayName
          email
        }
        teams {
          nodes {
            id
            key
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PROJECT_QUERY = `
  query ConnectorProject($id: String!) {
    project(id: $id) {
      id
      name
      summary
      description
      url
      createdAt
      updatedAt
      startDate
      targetDate
      completedAt
      canceledAt
      archivedAt
      status {
        id
        name
        type
        color
      }
      lead {
        id
        name
        displayName
        email
      }
      teams {
        nodes {
          id
          key
          name
        }
      }
      members {
        nodes {
          id
          name
          displayName
          email
        }
      }
    }
  }
`;

const ISSUES_QUERY = `
  query ConnectorIssues(
    $first: Int!
    $after: String
    $filter: IssueFilter
  ) {
    issues(
      first: $first
      after: $after
      filter: $filter
      orderBy: updatedAt
    ) {
      nodes {
        id
        identifier
        title
        description
        priority
        priorityLabel
        estimate
        dueDate
        url
        createdAt
        updatedAt
        completedAt
        canceledAt
        archivedAt
        team {
          id
          key
          name
        }
        project {
          id
          name
        }
        state {
          id
          name
          type
          color
        }
        assignee {
          id
          name
          displayName
          email
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const ISSUE_QUERY = `
  query ConnectorIssue($id: String!) {
    issue(id: $id) {
      id
      identifier
      title
      description
      priority
      priorityLabel
      estimate
      dueDate
      url
      createdAt
      updatedAt
      completedAt
      canceledAt
      archivedAt
      team {
        id
        key
        name
      }
      project {
        id
        name
        summary
      }
      state {
        id
        name
        type
        color
      }
      assignee {
        id
        name
        displayName
        email
      }
      creator {
        id
        name
        displayName
        email
      }
      labels {
        nodes {
          id
          name
          color
        }
      }
      comments(first: 50) {
        nodes {
          id
          body
          createdAt
          updatedAt
          user {
            id
            name
            displayName
          }
        }
      }
      attachments(first: 50) {
        nodes {
          id
          title
          subtitle
          url
          sourceType
          createdAt
        }
      }
      relations(first: 50) {
        nodes {
          id
          type
          relatedIssue {
            id
            identifier
            title
          }
        }
      }
    }
  }
`;

const COMMENTS_QUERY = `
  query ConnectorIssueComments(
    $id: String!
    $first: Int!
    $after: String
  ) {
    issue(id: $id) {
      id
      identifier
      comments(first: $first, after: $after) {
        nodes {
          id
          body
          createdAt
          updatedAt
          user {
            id
            name
            displayName
            email
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const CREATE_ISSUE_MUTATION = `
  mutation ConnectorIssueCreate($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        description
        url
        createdAt
      }
    }
  }
`;

const UPDATE_ISSUE_MUTATION = `
  mutation ConnectorIssueUpdate($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue {
        id
        identifier
        title
        description
        url
        updatedAt
        state {
          id
          name
        }
        assignee {
          id
          name
        }
        project {
          id
          name
        }
      }
    }
  }
`;

const CREATE_COMMENT_MUTATION = `
  mutation ConnectorCommentCreate($input: CommentCreateInput!) {
    commentCreate(input: $input) {
      success
      comment {
        id
        body
        createdAt
        user {
          id
          name
          displayName
        }
      }
    }
  }
`;

const CREATE_PROJECT_MUTATION = `
  mutation ConnectorProjectCreate($input: ProjectCreateInput!) {
    projectCreate(input: $input) {
      success
      project {
        id
        name
        summary
        description
        url
        createdAt
      }
    }
  }
`;

const UPDATE_PROJECT_MUTATION = `
  mutation ConnectorProjectUpdate(
    $id: String!
    $input: ProjectUpdateInput!
  ) {
    projectUpdate(id: $id, input: $input) {
      success
      project {
        id
        name
        summary
        description
        url
        updatedAt
        status {
          id
          name
        }
      }
    }
  }
`;

export function createLinearConnectorAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const credentials = createOAuthCredentialRuntime({
    provider: "linear",
    clientIdEnv: "LINEAR_OAUTH_CLIENT_ID",
    clientSecretEnv: "LINEAR_OAUTH_CLIENT_SECRET",
    tokenUrl: LINEAR_TOKEN_URL,
    ...options,
    fetchImpl,
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    return credentials.invoke(grant, ({ accessToken }) =>
      invokeLinearAction(createLinearClient({ accessToken, fetchImpl }), definition.name, args),
    );
  }

  return Object.freeze({
    id: "linear",
    aliases: Object.freeze(["linear"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeLinearAction(client, name, args) {
  switch (name) {
    case "get_viewer":
      return (await client.graphql(VIEWER_QUERY)).viewer;
    case "list_teams":
      return normalizeConnection(
        (await client.graphql(TEAMS_QUERY, paginationVariables(args))).teams,
      );
    case "list_projects": {
      const result = await client.graphql(PROJECTS_QUERY, {
        ...paginationVariables(args),
        filter: readString(args.query)
          ? {
              name: {
                containsIgnoreCase: readString(args.query),
              },
            }
          : undefined,
      });
      const connection = normalizeConnection(result.projects);
      const teamId = readString(args.teamId);
      return teamId
        ? {
            ...connection,
            items: connection.items.filter((project) =>
              project?.teams?.nodes?.some((team) => team?.id === teamId),
            ),
          }
        : connection;
    }
    case "get_project":
      return (
        await client.graphql(PROJECT_QUERY, {
          id: requireString(args.projectId, "Linear projectId"),
        })
      ).project;
    case "search_issues": {
      const query = requireString(args.query, "Linear issue query");
      const states = normalizeOptionalStringArray(args.states, "Linear states");
      const filter = compactObject({
        or: [
          { title: { containsIgnoreCase: query } },
          { description: { containsIgnoreCase: query } },
        ],
        team: readString(args.teamId) ? { id: { eq: readString(args.teamId) } } : undefined,
        project: readString(args.projectId)
          ? { id: { eq: readString(args.projectId) } }
          : undefined,
        state: states?.length ? { name: { in: states } } : undefined,
      });
      return normalizeConnection(
        (
          await client.graphql(ISSUES_QUERY, {
            ...paginationVariables(args),
            filter,
          })
        ).issues,
      );
    }
    case "get_issue":
      return (
        await client.graphql(ISSUE_QUERY, {
          id: requireString(args.issueId, "Linear issueId"),
        })
      ).issue;
    case "list_issue_comments": {
      const issue = (
        await client.graphql(COMMENTS_QUERY, {
          id: requireString(args.issueId, "Linear issueId"),
          ...paginationVariables(args),
        })
      ).issue;
      return {
        issue: issue
          ? {
              id: issue.id,
              identifier: issue.identifier,
            }
          : null,
        ...normalizeConnection(issue?.comments),
      };
    }
    case "create_issue": {
      const input = compactObject({
        teamId: requireString(args.teamId, "Linear teamId"),
        title: requireString(args.title, "Linear issue title"),
        description: args.description === undefined ? undefined : readString(args.description),
        projectId: readString(args.projectId),
        assigneeId: readString(args.assigneeId),
        labelIds: normalizeOptionalStringArray(args.labelIds, "Linear labelIds"),
      });
      return ensureMutation(
        (await client.graphql(CREATE_ISSUE_MUTATION, { input })).issueCreate,
        "Linear issue creation",
      );
    }
    case "update_issue": {
      const input = compactObject({
        title: args.title === undefined ? undefined : readString(args.title),
        description: args.description === undefined ? undefined : readString(args.description),
        stateId: args.stateId === undefined ? undefined : readString(args.stateId),
        assigneeId: args.assigneeId === undefined ? undefined : readString(args.assigneeId),
        projectId: args.projectId === undefined ? undefined : readString(args.projectId),
      });
      if (!Object.keys(input).length) {
        throw invalidInput("At least one Linear issue field must be supplied.");
      }
      return ensureMutation(
        (
          await client.graphql(UPDATE_ISSUE_MUTATION, {
            id: requireString(args.issueId, "Linear issueId"),
            input,
          })
        ).issueUpdate,
        "Linear issue update",
      );
    }
    case "add_issue_comment":
      return ensureMutation(
        (
          await client.graphql(CREATE_COMMENT_MUTATION, {
            input: {
              issueId: requireString(args.issueId, "Linear issueId"),
              body: requireString(args.body, "Linear comment body"),
            },
          })
        ).commentCreate,
        "Linear comment creation",
      );
    case "create_project":
      return ensureMutation(
        (
          await client.graphql(CREATE_PROJECT_MUTATION, {
            input: compactObject({
              teamIds: requireStringArray(args.teamIds, "Linear teamIds"),
              name: requireString(args.name, "Linear project name"),
              summary: args.summary === undefined ? undefined : readString(args.summary),
              description:
                args.description === undefined ? undefined : readString(args.description),
            }),
          })
        ).projectCreate,
        "Linear project creation",
      );
    case "update_project": {
      const input = compactObject({
        name: args.name === undefined ? undefined : readString(args.name),
        summary: args.summary === undefined ? undefined : readString(args.summary),
        description: args.description === undefined ? undefined : readString(args.description),
        statusId: args.statusId === undefined ? undefined : readString(args.statusId),
      });
      if (!Object.keys(input).length) {
        throw invalidInput("At least one Linear project field must be supplied.");
      }
      return ensureMutation(
        (
          await client.graphql(UPDATE_PROJECT_MUTATION, {
            id: requireString(args.projectId, "Linear projectId"),
            input,
          })
        ).projectUpdate,
        "Linear project update",
      );
    }
    default:
      throw unknownAction();
  }
}

function createLinearClient({ accessToken, fetchImpl }) {
  async function graphql(query, variables = {}) {
    const response = await fetchImpl(LINEAR_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw createProviderRequestError("linear", response, payload);
    }
    if (Array.isArray(payload?.errors) && payload.errors.length) {
      const first = payload.errors[0];
      const extensionCode = readString(first?.extensions?.code).toUpperCase();
      throw new ConnectorRuntimeError(
        readString(first?.message) || "Linear GraphQL request failed.",
        {
          code:
            extensionCode === "RATELIMITED"
              ? "connector_provider_rate_limited"
              : extensionCode.includes("AUTH")
                ? "connector_provider_access_denied"
                : "connector_provider_request_failed",
          statusCode:
            extensionCode === "RATELIMITED" ? 429 : extensionCode.includes("AUTH") ? 401 : 502,
          details: {
            errors: payload.errors.map((error) => ({
              message: readString(error?.message),
              path: error?.path,
              code: readString(error?.extensions?.code),
            })),
          },
        },
      );
    }
    if (!isRecord(payload?.data)) {
      throw new ConnectorRuntimeError("Linear returned an empty GraphQL response.", {
        code: "connector_provider_request_failed",
        statusCode: 502,
      });
    }
    return payload.data;
  }
  return Object.freeze({ graphql });
}

function paginationVariables(args) {
  return {
    first: clampInteger(args.limit, 1, 100, 50),
    after: readString(args.cursor) || null,
  };
}

function normalizeConnection(connection) {
  const pageInfo = isRecord(connection?.pageInfo) ? connection.pageInfo : {};
  return {
    items: Array.isArray(connection?.nodes) ? connection.nodes : [],
    cursor: readString(pageInfo.endCursor),
    hasMore: Boolean(pageInfo.hasNextPage),
  };
}

function normalizeOptionalStringArray(value, label) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw invalidInput(`${label} must be an array.`);
  }
  return value.map(readString).filter(Boolean);
}

function ensureMutation(result, label) {
  if (!result?.success) {
    throw new ConnectorRuntimeError(`${label} was not accepted by Linear.`, {
      code: "connector_provider_request_failed",
      statusCode: 502,
    });
  }
  return result;
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown Linear action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
