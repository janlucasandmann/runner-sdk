import {
  booleanField,
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringArrayField,
  stringField,
} from "../shared.js";

const resource = {
  projectId: stringField("Google Cloud project ID."),
  datasetId: stringField("BigQuery dataset ID."),
};

const capabilities = defineCapabilities([
  {
    id: "list_projects",
    description: "List Google Cloud projects available to BigQuery.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "list_datasets",
    description: "List datasets in a Google Cloud project.",
    access: "read-only",
    properties: {
      projectId: resource.projectId,
      ...paginationFields,
    },
    required: ["projectId"],
  },
  {
    id: "get_dataset",
    description: "Get BigQuery dataset metadata and location.",
    access: "read-only",
    properties: resource,
    required: ["projectId", "datasetId"],
  },
  {
    id: "list_tables",
    description: "List tables and views in a BigQuery dataset.",
    access: "read-only",
    properties: {
      ...resource,
      ...paginationFields,
    },
    required: ["projectId", "datasetId"],
  },
  {
    id: "get_table",
    description: "Get schema and metadata for a BigQuery table.",
    access: "read-only",
    properties: {
      ...resource,
      tableId: stringField("BigQuery table ID."),
    },
    required: ["projectId", "datasetId", "tableId"],
  },
  {
    id: "query",
    description: "Run a read-only BigQuery SQL query.",
    access: "read-only",
    properties: {
      projectId: resource.projectId,
      query: stringField("GoogleSQL query."),
      location: stringField("BigQuery processing location."),
      maximumBytesBilled: stringField("Maximum billable bytes as an integer string."),
      dryRun: booleanField("Validate and estimate the query without running it."),
    },
    required: ["projectId", "query"],
  },
  {
    id: "get_query_results",
    description: "Read rows returned by a completed BigQuery job.",
    access: "read-only",
    properties: {
      projectId: resource.projectId,
      jobId: stringField("BigQuery job ID."),
      location: stringField("BigQuery processing location."),
      ...paginationFields,
    },
    required: ["projectId", "jobId"],
  },
  {
    id: "execute_mutating_query",
    description: "Run a BigQuery SQL statement that may create or modify data.",
    access: "interactive",
    properties: {
      projectId: resource.projectId,
      query: stringField("GoogleSQL statement."),
      location: stringField("BigQuery processing location."),
      maximumBytesBilled: stringField("Maximum billable bytes as an integer string."),
    },
    required: ["projectId", "query"],
  },
  {
    id: "create_dataset",
    description: "Create a BigQuery dataset.",
    access: "interactive",
    properties: {
      ...resource,
      location: stringField("Dataset location."),
      description: stringField("Dataset description."),
    },
    required: ["projectId", "datasetId", "location"],
  },
  {
    id: "create_table",
    description: "Create a table with an explicit schema.",
    access: "interactive",
    properties: {
      ...resource,
      tableId: stringField("BigQuery table ID."),
      schemaJson: stringField("BigQuery table schema as JSON."),
      description: stringField("Table description."),
    },
    required: ["projectId", "datasetId", "tableId", "schemaJson"],
  },
  {
    id: "insert_rows",
    description: "Insert JSON rows into a BigQuery table.",
    access: "interactive",
    properties: {
      ...resource,
      tableId: stringField("BigQuery table ID."),
      rowsJson: stringField("JSON array of rows."),
      insertIds: stringArrayField("Optional idempotency IDs corresponding to rows."),
    },
    required: ["projectId", "datasetId", "tableId", "rowsJson"],
  },
]);

export const BIGQUERY_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "bigquery",
  label: "BigQuery",
  shortLabel: "BQ",
  description: "Inspect schemas, run bounded queries, and manage authorized BigQuery data.",
  category: "Data warehouse",
  logoUrl: "https://cdn.simpleicons.org/googlebigquery/669DF6",
  authentication: "service-account",
  authenticationLabel: "Google service account",
  functionsLabel: "Inspect, Query, Transform",
  samplePrompt: "Estimate this query, run it within the billing limit, and summarize the results.",
  whenToUse: "Use BigQuery for governed analytics over organization datasets.",
  websiteUrl: "https://cloud.google.com/bigquery",
  termsUrl: "https://cloud.google.com/terms",
  privacyUrl: "https://policies.google.com/privacy",
}, capabilities);
