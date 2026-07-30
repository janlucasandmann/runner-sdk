import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringArrayField,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "list_organizations",
    description: "List Supabase organizations visible to the connected user.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "list_projects",
    description: "List Supabase projects visible to the connected user.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "get_project",
    description: "Get Supabase project metadata and health.",
    access: "read-only",
    properties: { projectRef: stringField("Supabase project reference.") },
    required: ["projectRef"],
  },
  {
    id: "list_tables",
    description: "List schemas and tables in a Supabase project.",
    access: "read-only",
    properties: {
      projectRef: stringField("Supabase project reference."),
      schemas: stringArrayField("Optional schema names."),
    },
    required: ["projectRef"],
  },
  {
    id: "get_advisors",
    description: "Get Supabase security and performance advisor findings.",
    access: "read-only",
    properties: {
      projectRef: stringField("Supabase project reference."),
      type: stringField("Advisor type.", {
        enum: ["security", "performance"],
      }),
    },
    required: ["projectRef", "type"],
  },
  {
    id: "get_logs",
    description: "Query bounded logs for a Supabase project.",
    access: "read-only",
    properties: {
      projectRef: stringField("Supabase project reference."),
      service: stringField("Log service."),
      query: stringField("Log query."),
      start: stringField("ISO 8601 range start."),
      end: stringField("ISO 8601 range end."),
      limit: paginationFields.limit,
    },
    required: ["projectRef", "service", "start", "end"],
  },
  {
    id: "list_edge_functions",
    description: "List Edge Functions in a Supabase project.",
    access: "read-only",
    properties: {
      projectRef: stringField("Supabase project reference."),
      ...paginationFields,
    },
    required: ["projectRef"],
  },
  {
    id: "execute_read_query",
    description: "Run a read-only SQL query against a Supabase project.",
    access: "read-only",
    properties: {
      projectRef: stringField("Supabase project reference."),
      query: stringField("Read-only SQL query."),
    },
    required: ["projectRef", "query"],
  },
  {
    id: "execute_sql",
    description: "Run a SQL statement that may modify a Supabase project.",
    access: "interactive",
    properties: {
      projectRef: stringField("Supabase project reference."),
      query: stringField("SQL statement."),
    },
    required: ["projectRef", "query"],
  },
  {
    id: "apply_migration",
    description: "Apply a named SQL migration to a Supabase project.",
    access: "interactive",
    properties: {
      projectRef: stringField("Supabase project reference."),
      name: stringField("Migration name."),
      query: stringField("Migration SQL."),
    },
    required: ["projectRef", "name", "query"],
  },
  {
    id: "deploy_edge_function",
    description: "Deploy an Edge Function to a Supabase project.",
    access: "interactive",
    properties: {
      projectRef: stringField("Supabase project reference."),
      functionSlug: stringField("Edge Function slug."),
      entrypointPath: stringField("Workspace entrypoint path."),
      verifyJwt: stringField("Whether JWT verification is required.", {
        enum: ["true", "false"],
      }),
    },
    required: ["projectRef", "functionSlug", "entrypointPath"],
  },
  {
    id: "update_project_secrets",
    description: "Create or update Supabase project secrets.",
    access: "interactive",
    properties: {
      projectRef: stringField("Supabase project reference."),
      secretsJson: stringField("JSON object containing secret names and values."),
    },
    required: ["projectRef", "secretsJson"],
  },
]);

export const SUPABASE_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "supabase",
  label: "Supabase",
  shortLabel: "SB",
  description: "Inspect and operate authorized Supabase projects, data, and Edge Functions.",
  category: "Developer tools",
  logoUrl: "/img/plugins/supabase.svg",
  authentication: "api-key",
  authenticationLabel: "Personal access token",
  functionsLabel: "Inspect, Query, Deploy",
  samplePrompt: "Review advisor findings, prepare a migration, and deploy the approved function.",
  whenToUse: "Use Supabase for governed database and Edge Function operations.",
  websiteUrl: "https://supabase.com/",
  termsUrl: "https://supabase.com/terms",
  privacyUrl: "https://supabase.com/privacy",
}, capabilities);
