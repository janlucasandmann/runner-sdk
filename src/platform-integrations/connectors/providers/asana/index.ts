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
    description: "Get the authenticated Asana user and workspaces.",
    access: "read-only",
  },
  {
    id: "list_workspaces",
    description: "List Asana workspaces visible to the connected user.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "list_projects",
    description: "List projects in an Asana workspace or team.",
    access: "read-only",
    properties: {
      workspaceId: stringField("Asana workspace GID."),
      teamId: stringField("Optional team GID."),
      ...paginationFields,
    },
    required: ["workspaceId"],
  },
  {
    id: "get_project",
    description: "Get an Asana project with members and status.",
    access: "read-only",
    properties: { projectId: stringField("Asana project GID.") },
    required: ["projectId"],
  },
  {
    id: "search_tasks",
    description: "Search tasks in an Asana workspace.",
    access: "read-only",
    properties: {
      workspaceId: stringField("Asana workspace GID."),
      query: stringField("Task text query."),
      projectId: stringField("Optional project GID."),
      assigneeId: stringField("Optional assignee GID."),
      completed: stringField("Completion filter.", {
        enum: ["true", "false"],
      }),
      ...paginationFields,
    },
    required: ["workspaceId"],
  },
  {
    id: "get_task",
    description: "Get an Asana task with subtasks, dependencies, and attachments.",
    access: "read-only",
    properties: { taskId: stringField("Asana task GID.") },
    required: ["taskId"],
  },
  {
    id: "list_task_stories",
    description: "List comments and activity for an Asana task.",
    access: "read-only",
    properties: {
      taskId: stringField("Asana task GID."),
      ...paginationFields,
    },
    required: ["taskId"],
  },
  {
    id: "create_task",
    description: "Create a task in an Asana workspace.",
    access: "interactive",
    properties: {
      workspaceId: stringField("Asana workspace GID."),
      name: stringField("Task name."),
      notes: stringField("Task notes."),
      projectIds: stringArrayField("Projects to add the task to."),
      assigneeId: stringField("Optional assignee GID."),
      dueOn: stringField("Optional due date in YYYY-MM-DD format."),
    },
    required: ["workspaceId", "name"],
  },
  {
    id: "update_task",
    description: "Update an Asana task.",
    access: "interactive",
    properties: {
      taskId: stringField("Asana task GID."),
      name: stringField("Updated task name."),
      notes: stringField("Updated task notes."),
      assigneeId: stringField("Updated assignee GID."),
      completed: stringField("Updated completion state.", {
        enum: ["true", "false"],
      }),
      dueOn: stringField("Updated due date."),
    },
    required: ["taskId"],
  },
  {
    id: "add_task_comment",
    description: "Add a comment to an Asana task.",
    access: "interactive",
    properties: {
      taskId: stringField("Asana task GID."),
      text: stringField("Comment text."),
    },
    required: ["taskId", "text"],
  },
  {
    id: "add_task_to_project",
    description: "Add an Asana task to a project and optional section.",
    access: "interactive",
    properties: {
      taskId: stringField("Asana task GID."),
      projectId: stringField("Asana project GID."),
      sectionId: stringField("Optional section GID."),
    },
    required: ["taskId", "projectId"],
  },
  {
    id: "create_project",
    description: "Create a project in an Asana workspace.",
    access: "interactive",
    properties: {
      workspaceId: stringField("Asana workspace GID."),
      name: stringField("Project name."),
      notes: stringField("Project notes."),
      teamId: stringField("Optional team GID."),
    },
    required: ["workspaceId", "name"],
  },
]);

export const ASANA_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "asana",
  label: "Asana",
  shortLabel: "AS",
  description: "Search and manage authorized Asana projects, tasks, and comments.",
  category: "Project management",
  logoUrl: "https://cdn.simpleicons.org/asana/F06A6A",
  functionsLabel: "Search, Triage, Update",
  samplePrompt: "Find overdue work, summarize blockers, and update the assigned tasks.",
  whenToUse: "Use Asana for authoritative project and task operations.",
  websiteUrl: "https://asana.com/",
  termsUrl: "https://asana.com/terms",
  privacyUrl: "https://asana.com/terms#privacy-policy",
}, capabilities);

