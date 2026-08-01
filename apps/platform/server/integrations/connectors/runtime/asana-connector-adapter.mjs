import {
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createOAuthCredentialRuntime,
  createProviderRequestError,
  defineRuntimeTools,
  encodePath,
  invalidInput,
  isRecord,
  normalizeOptionalEnum,
  numberSchema,
  objectSchema,
  readBoolean,
  readJsonResponse,
  readString,
  requireString,
  stringArraySchema,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const ASANA_API_ORIGIN = "https://app.asana.com";
const ASANA_TOKEN_URL = "https://app.asana.com/-/oauth_token";

const pagination = {
  cursor: stringSchema("Opaque Asana pagination offset."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const TOOLS = defineRuntimeTools("Asana", [
  {
    name: "get_current_user",
    description: "Get the authenticated Asana user and workspaces.",
  },
  {
    name: "list_workspaces",
    description: "List Asana workspaces visible to the connected user.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "list_projects",
    description: "List projects in an Asana workspace or team.",
    inputSchema: objectSchema(
      {
        workspaceId: stringSchema("Asana workspace GID."),
        teamId: stringSchema("Optional Asana team GID."),
        ...pagination,
      },
      ["workspaceId"],
    ),
  },
  {
    name: "get_project",
    description: "Get an Asana project with members and status.",
    inputSchema: objectSchema({ projectId: stringSchema("Asana project GID.") }, ["projectId"]),
  },
  {
    name: "search_tasks",
    description: "Search tasks in an Asana workspace.",
    inputSchema: objectSchema(
      {
        workspaceId: stringSchema("Asana workspace GID."),
        query: stringSchema("Task text query."),
        projectId: stringSchema("Optional project GID."),
        assigneeId: stringSchema("Optional assignee GID."),
        completed: stringSchema("Completion filter.", {
          enum: ["true", "false"],
        }),
        ...pagination,
      },
      ["workspaceId"],
    ),
  },
  {
    name: "get_task",
    description: "Get an Asana task with subtasks, dependencies, and attachments.",
    inputSchema: objectSchema({ taskId: stringSchema("Asana task GID.") }, ["taskId"]),
  },
  {
    name: "list_task_stories",
    description: "List comments and activity for an Asana task.",
    inputSchema: objectSchema(
      {
        taskId: stringSchema("Asana task GID."),
        ...pagination,
      },
      ["taskId"],
    ),
  },
  {
    name: "create_task",
    access: "interactive",
    description: "Create a task in an Asana workspace.",
    inputSchema: objectSchema(
      {
        workspaceId: stringSchema("Asana workspace GID."),
        name: stringSchema("Task name."),
        notes: stringSchema("Task notes."),
        projectIds: stringArraySchema("Projects to add the task to."),
        assigneeId: stringSchema("Optional assignee GID."),
        dueOn: stringSchema("Optional due date in YYYY-MM-DD format."),
      },
      ["workspaceId", "name"],
    ),
  },
  {
    name: "update_task",
    access: "interactive",
    description: "Update an Asana task.",
    inputSchema: objectSchema(
      {
        taskId: stringSchema("Asana task GID."),
        name: stringSchema("Updated task name."),
        notes: stringSchema("Updated task notes."),
        assigneeId: stringSchema("Updated assignee GID."),
        completed: stringSchema("Updated completion state.", {
          enum: ["true", "false"],
        }),
        dueOn: stringSchema("Updated due date."),
      },
      ["taskId"],
    ),
  },
  {
    name: "add_task_comment",
    access: "interactive",
    description: "Add a comment to an Asana task.",
    inputSchema: objectSchema(
      {
        taskId: stringSchema("Asana task GID."),
        text: stringSchema("Comment text."),
      },
      ["taskId", "text"],
    ),
  },
  {
    name: "add_task_to_project",
    access: "interactive",
    description: "Add an Asana task to a project and optional section.",
    inputSchema: objectSchema(
      {
        taskId: stringSchema("Asana task GID."),
        projectId: stringSchema("Asana project GID."),
        sectionId: stringSchema("Optional section GID."),
      },
      ["taskId", "projectId"],
    ),
  },
  {
    name: "create_project",
    access: "interactive",
    description: "Create a project in an Asana workspace.",
    inputSchema: objectSchema(
      {
        workspaceId: stringSchema("Asana workspace GID."),
        name: stringSchema("Project name."),
        notes: stringSchema("Project notes."),
        teamId: stringSchema("Optional team GID."),
      },
      ["workspaceId", "name"],
    ),
  },
]);

export function createAsanaConnectorAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const credentials = createOAuthCredentialRuntime({
    provider: "asana",
    clientIdEnv: "ASANA_OAUTH_CLIENT_ID",
    clientSecretEnv: "ASANA_OAUTH_CLIENT_SECRET",
    tokenUrl: ASANA_TOKEN_URL,
    ...options,
    fetchImpl,
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    return credentials.invoke(grant, ({ accessToken }) =>
      invokeAsanaAction(createAsanaClient({ accessToken, fetchImpl }), definition.name, args),
    );
  }

  return Object.freeze({
    id: "asana",
    aliases: Object.freeze(["asana"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeAsanaAction(client, name, args) {
  switch (name) {
    case "get_current_user":
      return unwrapItem(
        await client.request("/api/1.0/users/me", {
          query: { opt_fields: "gid,name,email,photo,workspaces.gid,workspaces.name" },
        }),
      );
    case "list_workspaces":
      return unwrapCollection(
        await client.request("/api/1.0/workspaces", {
          query: paginationQuery(args),
        }),
      );
    case "list_projects": {
      const workspaceId = requireString(args.workspaceId, "Asana workspaceId");
      const teamId = readString(args.teamId);
      return unwrapCollection(
        await client.request(
          teamId
            ? `/api/1.0/teams/${encodePath(teamId)}/projects`
            : `/api/1.0/workspaces/${encodePath(workspaceId)}/projects`,
          {
            query: {
              ...paginationQuery(args),
              archived: false,
              opt_fields:
                "gid,name,archived,color,created_at,modified_at,owner.gid,owner.name,team.gid,team.name,current_status.text,current_status.color",
            },
          },
        ),
      );
    }
    case "get_project":
      return unwrapItem(
        await client.request(
          `/api/1.0/projects/${encodePath(requireString(args.projectId, "Asana projectId"))}`,
          {
            query: {
              opt_fields:
                "gid,name,notes,html_notes,archived,color,created_at,modified_at,owner.gid,owner.name,team.gid,team.name,members.gid,members.name,current_status.text,current_status.color",
            },
          },
        ),
      );
    case "search_tasks": {
      const workspaceId = requireString(args.workspaceId, "Asana workspaceId");
      const completed = normalizeOptionalEnum(
        args.completed,
        ["true", "false"],
        "Asana completed filter",
      );
      return unwrapCollection(
        await client.request(`/api/1.0/workspaces/${encodePath(workspaceId)}/tasks/search`, {
          query: compactObject({
            ...paginationQuery(args),
            text: readString(args.query),
            "projects.any": readString(args.projectId),
            "assignee.any": readString(args.assigneeId),
            completed,
            sort_by: "modified_at",
            sort_ascending: false,
            opt_fields:
              "gid,name,completed,due_on,due_at,modified_at,assignee.gid,assignee.name,projects.gid,projects.name,memberships.section.gid,memberships.section.name",
          }),
        }),
      );
    }
    case "get_task": {
      const taskId = requireString(args.taskId, "Asana taskId");
      const [task, subtasks, dependencies, attachments] = await Promise.all([
        client.request(`/api/1.0/tasks/${encodePath(taskId)}`, {
          query: {
            opt_fields:
              "gid,name,notes,html_notes,completed,completed_at,created_at,modified_at,due_on,due_at,assignee.gid,assignee.name,projects.gid,projects.name,memberships.project.gid,memberships.section.gid,memberships.section.name,tags.gid,tags.name,permalink_url",
          },
        }),
        client.request(`/api/1.0/tasks/${encodePath(taskId)}/subtasks`, {
          query: { limit: 100 },
        }),
        client.request(`/api/1.0/tasks/${encodePath(taskId)}/dependencies`, {
          query: { limit: 100 },
        }),
        client.request("/api/1.0/attachments", {
          query: { parent: taskId, limit: 100 },
        }),
      ]);
      return {
        ...unwrapItem(task),
        subtasks: unwrapCollection(subtasks).items,
        dependencies: unwrapCollection(dependencies).items,
        attachments: unwrapCollection(attachments).items,
      };
    }
    case "list_task_stories":
      return unwrapCollection(
        await client.request(
          `/api/1.0/tasks/${encodePath(requireString(args.taskId, "Asana taskId"))}/stories`,
          {
            query: {
              ...paginationQuery(args),
              opt_fields:
                "gid,created_at,created_by.gid,created_by.name,resource_subtype,text,html_text,is_pinned",
            },
          },
        ),
      );
    case "create_task":
      return unwrapItem(
        await client.request("/api/1.0/tasks", {
          method: "POST",
          body: {
            data: compactObject({
              workspace: requireString(args.workspaceId, "Asana workspaceId"),
              name: requireString(args.name, "Asana task name"),
              notes: readString(args.notes),
              projects: normalizeStringArray(args.projectIds),
              assignee: readString(args.assigneeId),
              due_on: normalizeDate(args.dueOn),
            }),
          },
        }),
      );
    case "update_task": {
      const completed = args.completed === undefined ? undefined : readBoolean(args.completed);
      if (args.completed !== undefined && completed === undefined) {
        throw invalidInput("Asana completed must be true or false.");
      }
      const data = compactObject({
        name: args.name === undefined ? undefined : readString(args.name),
        notes: args.notes === undefined ? undefined : readString(args.notes),
        assignee: args.assigneeId === undefined ? undefined : readString(args.assigneeId),
        completed,
        due_on: args.dueOn === undefined ? undefined : normalizeDate(args.dueOn),
      });
      if (!Object.keys(data).length) {
        throw invalidInput("At least one Asana task field must be supplied.");
      }
      return unwrapItem(
        await client.request(
          `/api/1.0/tasks/${encodePath(requireString(args.taskId, "Asana taskId"))}`,
          {
            method: "PUT",
            body: { data },
          },
        ),
      );
    }
    case "add_task_comment":
      return unwrapItem(
        await client.request(
          `/api/1.0/tasks/${encodePath(requireString(args.taskId, "Asana taskId"))}/stories`,
          {
            method: "POST",
            body: {
              data: {
                text: requireString(args.text, "Asana comment text"),
              },
            },
          },
        ),
      );
    case "add_task_to_project":
      return unwrapItem(
        await client.request(
          `/api/1.0/tasks/${encodePath(requireString(args.taskId, "Asana taskId"))}/addProject`,
          {
            method: "POST",
            body: {
              data: compactObject({
                project: requireString(args.projectId, "Asana projectId"),
                section: readString(args.sectionId),
              }),
            },
          },
        ),
      );
    case "create_project":
      return unwrapItem(
        await client.request("/api/1.0/projects", {
          method: "POST",
          body: {
            data: compactObject({
              workspace: requireString(args.workspaceId, "Asana workspaceId"),
              name: requireString(args.name, "Asana project name"),
              notes: readString(args.notes),
              team: readString(args.teamId),
            }),
          },
        }),
      );
    default:
      throw unknownAction();
  }
}

function createAsanaClient({ accessToken, fetchImpl }) {
  async function request(pathname, { method = "GET", query, body } = {}) {
    const url = new URL(pathname, ASANA_API_ORIGIN);
    Object.entries(compactObject(query || {})).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    const response = await fetchImpl(url, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw createProviderRequestError("asana", response, payload);
    }
    return payload;
  }
  return Object.freeze({ request });
}

function paginationQuery(args) {
  return compactObject({
    limit: clampInteger(args.limit, 1, 100, 50),
    offset: readString(args.cursor),
  });
}

function unwrapItem(payload) {
  return isRecord(payload?.data) ? payload.data : payload;
}

function unwrapCollection(payload) {
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return {
    items,
    cursor: readString(payload?.next_page?.offset),
    hasMore: Boolean(payload?.next_page?.offset),
  };
}

function normalizeStringArray(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw invalidInput("Asana projectIds must be an array.");
  }
  return value.map(readString).filter(Boolean);
}

function normalizeDate(value) {
  const normalized = readString(value);
  if (!normalized) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw invalidInput("Asana dueOn must use YYYY-MM-DD.");
  }
  return normalized;
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown Asana action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
