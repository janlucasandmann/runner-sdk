import { createSign, randomUUID } from "node:crypto";

import { resolveConnectorCredentialForOrganization } from "../../connector-oauth-core.mjs";
import {
  booleanSchema,
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createProviderRequestError,
  defineRuntimeTools,
  encodePath,
  invalidInput,
  isRecord,
  numberSchema,
  objectSchema,
  readJsonResponse,
  readString,
  requireString,
  stringArraySchema,
  stringSchema,
  unavailableCredential,
} from "./connector-runtime-utils.mjs";

const BIGQUERY_API_ORIGIN = "https://bigquery.googleapis.com";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWT_GRANT = "urn:ietf:params:oauth:grant-type:jwt-bearer";
const DEFAULT_BIGQUERY_SCOPE = "https://www.googleapis.com/auth/bigquery.readonly";

const pagination = {
  cursor: stringSchema("Opaque BigQuery pagination token."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const resource = {
  projectId: stringSchema("Google Cloud project ID."),
  datasetId: stringSchema("BigQuery dataset ID."),
};

const TOOLS = defineRuntimeTools("BigQuery", [
  {
    name: "list_projects",
    description: "List Google Cloud projects available to BigQuery.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "list_datasets",
    description: "List datasets in a Google Cloud project.",
    inputSchema: objectSchema(
      {
        projectId: resource.projectId,
        ...pagination,
      },
      ["projectId"],
    ),
  },
  {
    name: "get_dataset",
    description: "Get BigQuery dataset metadata and location.",
    inputSchema: objectSchema(resource, ["projectId", "datasetId"]),
  },
  {
    name: "list_tables",
    description: "List tables and views in a BigQuery dataset.",
    inputSchema: objectSchema(
      {
        ...resource,
        ...pagination,
      },
      ["projectId", "datasetId"],
    ),
  },
  {
    name: "get_table",
    description: "Get schema and metadata for a BigQuery table.",
    inputSchema: objectSchema(
      {
        ...resource,
        tableId: stringSchema("BigQuery table ID."),
      },
      ["projectId", "datasetId", "tableId"],
    ),
  },
  {
    name: "query",
    description: "Run a validated read-only BigQuery SQL query.",
    inputSchema: objectSchema(
      {
        projectId: resource.projectId,
        query: stringSchema("GoogleSQL query."),
        location: stringSchema("BigQuery processing location."),
        maximumBytesBilled: stringSchema("Maximum billable bytes as an integer string."),
        dryRun: booleanSchema("Validate and estimate the query without running it."),
      },
      ["projectId", "query"],
    ),
  },
  {
    name: "get_query_results",
    description: "Read rows returned by a completed BigQuery job.",
    inputSchema: objectSchema(
      {
        projectId: resource.projectId,
        jobId: stringSchema("BigQuery job ID."),
        location: stringSchema("BigQuery processing location."),
        ...pagination,
      },
      ["projectId", "jobId"],
    ),
  },
  {
    name: "execute_mutating_query",
    access: "interactive",
    description: "Run an approved BigQuery SQL statement that may create or modify data.",
    inputSchema: objectSchema(
      {
        projectId: resource.projectId,
        query: stringSchema("GoogleSQL statement."),
        location: stringSchema("BigQuery processing location."),
        maximumBytesBilled: stringSchema("Maximum billable bytes as an integer string."),
      },
      ["projectId", "query"],
    ),
  },
  {
    name: "create_dataset",
    access: "interactive",
    description: "Create a BigQuery dataset.",
    inputSchema: objectSchema(
      {
        ...resource,
        location: stringSchema("Dataset location."),
        description: stringSchema("Dataset description."),
      },
      ["projectId", "datasetId", "location"],
    ),
  },
  {
    name: "create_table",
    access: "interactive",
    description: "Create a table with an explicit schema.",
    inputSchema: objectSchema(
      {
        ...resource,
        tableId: stringSchema("BigQuery table ID."),
        schemaJson: stringSchema("BigQuery table schema as JSON."),
        description: stringSchema("Table description."),
      },
      ["projectId", "datasetId", "tableId", "schemaJson"],
    ),
  },
  {
    name: "insert_rows",
    access: "interactive",
    description: "Insert JSON rows into a BigQuery table.",
    inputSchema: objectSchema(
      {
        ...resource,
        tableId: stringSchema("BigQuery table ID."),
        rowsJson: stringSchema("JSON array of rows."),
        insertIds: stringArraySchema("Optional idempotency IDs corresponding to rows."),
      },
      ["projectId", "datasetId", "tableId", "rowsJson"],
    ),
  },
]);

export function createBigQueryConnectorAdapter({
  resolveCredential = resolveConnectorCredentialForOrganization,
  fetchImpl = globalThis.fetch,
  envFileCandidates = [],
  now = () => Date.now(),
} = {}) {
  if (typeof resolveCredential !== "function") {
    throw new TypeError("BigQuery adapter requires a credential resolver.");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("BigQuery adapter requires fetch.");
  }
  const tokenCache = new Map();
  const tokenRequests = new Map();

  async function resolveAccess(grant, { force = false } = {}) {
    const credential = await resolveCredential({
      provider: "bigquery",
      organizationId: grant?.organizationId,
      credentialId: grant?.credentialId,
      envFileCandidates,
      encryptionKeyNames: ["BIGQUERY_TOKEN_ENCRYPTION_KEY", "CONNECTOR_TOKEN_ENCRYPTION_KEY"],
    });
    if (!credential) throw unavailableCredential("bigquery");
    const serviceAccount = normalizeServiceAccount(credential.token);
    const scope = readString(credential.token?.scope) || DEFAULT_BIGQUERY_SCOPE;
    const cacheKey = [
      credential.organizationId,
      credential.credentialId,
      serviceAccount.private_key_id,
      scope,
    ].join(":");
    const cached = tokenCache.get(cacheKey);
    if (!force && cached?.expiresAt > now() + 60_000) {
      return {
        accessToken: cached.accessToken,
        credential,
      };
    }
    if (tokenRequests.has(cacheKey)) {
      return {
        accessToken: await tokenRequests.get(cacheKey),
        credential,
      };
    }
    const request = requestServiceAccountAccessToken({
      serviceAccount,
      scope,
      fetchImpl,
      now,
    })
      .then(({ accessToken, expiresAt }) => {
        tokenCache.set(cacheKey, { accessToken, expiresAt });
        return accessToken;
      })
      .finally(() => {
        tokenRequests.delete(cacheKey);
      });
    tokenRequests.set(cacheKey, request);
    return {
      accessToken: await request,
      credential,
    };
  }

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = TOOLS.get(name);
    if (!definition) throw unknownAction();
    const args = isRecord(rawArguments) ? rawArguments : {};
    let context = await resolveAccess(grant);
    try {
      return await invokeBigQueryAction(
        createBigQueryClient({
          accessToken: context.accessToken,
          fetchImpl,
        }),
        definition.name,
        args,
      );
    } catch (error) {
      if (Number(error?.statusCode) !== 401) throw error;
      context = await resolveAccess(grant, { force: true });
      return invokeBigQueryAction(
        createBigQueryClient({
          accessToken: context.accessToken,
          fetchImpl,
        }),
        definition.name,
        args,
      );
    }
  }

  return Object.freeze({
    id: "bigquery",
    aliases: Object.freeze(["bigquery"]),
    invoke,
    listCapabilities: () => TOOLS.capabilities(),
    listTools: (actionIds) => TOOLS.list(actionIds),
  });
}

async function invokeBigQueryAction(client, name, args) {
  switch (name) {
    case "list_projects":
      return normalizeCollection(
        await client.request("/bigquery/v2/projects", {
          query: {
            maxResults: clampInteger(args.limit, 1, 100, 100),
            pageToken: readString(args.cursor),
          },
        }),
        "projects",
      );
    case "list_datasets": {
      const projectId = requireString(args.projectId, "BigQuery projectId");
      return normalizeCollection(
        await client.request(`/bigquery/v2/projects/${encodePath(projectId)}/datasets`, {
          query: {
            maxResults: clampInteger(args.limit, 1, 100, 100),
            pageToken: readString(args.cursor),
            all: true,
          },
        }),
        "datasets",
      );
    }
    case "get_dataset":
      return client.request(bigQueryResourcePath(args, "datasets"));
    case "list_tables":
      return normalizeCollection(
        await client.request(`${bigQueryResourcePath(args, "datasets")}/tables`, {
          query: {
            maxResults: clampInteger(args.limit, 1, 100, 100),
            pageToken: readString(args.cursor),
          },
        }),
        "tables",
      );
    case "get_table":
      return client.request(
        `${bigQueryResourcePath(args, "datasets")}/tables/${encodePath(
          requireString(args.tableId, "BigQuery tableId"),
        )}`,
      );
    case "query":
      return runReadOnlyQuery(client, args);
    case "get_query_results":
      return client.request(
        `/bigquery/v2/projects/${encodePath(
          requireString(args.projectId, "BigQuery projectId"),
        )}/queries/${encodePath(requireString(args.jobId, "BigQuery jobId"))}`,
        {
          query: compactObject({
            location: readString(args.location),
            maxResults: clampInteger(args.limit, 1, 100, 100),
            pageToken: readString(args.cursor),
            timeoutMs: 10_000,
          }),
        },
      );
    case "execute_mutating_query":
      return runQuery(client, args, {
        requestId: randomUUID(),
      });
    case "create_dataset":
      return client.request(
        `/bigquery/v2/projects/${encodePath(
          requireString(args.projectId, "BigQuery projectId"),
        )}/datasets`,
        {
          method: "POST",
          body: compactObject({
            datasetReference: {
              projectId: requireString(args.projectId, "BigQuery projectId"),
              datasetId: requireString(args.datasetId, "BigQuery datasetId"),
            },
            location: requireString(args.location, "BigQuery location"),
            description: readString(args.description),
          }),
        },
      );
    case "create_table":
      return client.request(`${bigQueryResourcePath(args, "datasets")}/tables`, {
        method: "POST",
        body: compactObject({
          tableReference: {
            projectId: requireString(args.projectId, "BigQuery projectId"),
            datasetId: requireString(args.datasetId, "BigQuery datasetId"),
            tableId: requireString(args.tableId, "BigQuery tableId"),
          },
          schema: normalizeTableSchema(args.schemaJson),
          description: readString(args.description),
        }),
      });
    case "insert_rows": {
      const rows = normalizeRows(args.rowsJson);
      const insertIds = normalizeInsertIds(args.insertIds, rows.length);
      const payload = await client.request(
        `${bigQueryResourcePath(args, "datasets")}/tables/${encodePath(
          requireString(args.tableId, "BigQuery tableId"),
        )}/insertAll`,
        {
          method: "POST",
          body: {
            kind: "bigquery#tableDataInsertAllRequest",
            rows: rows.map((json, index) =>
              compactObject({
                insertId: insertIds?.[index],
                json,
              }),
            ),
          },
        },
      );
      if (Array.isArray(payload?.insertErrors) && payload.insertErrors.length) {
        throw new ConnectorRuntimeError("BigQuery rejected one or more inserted rows.", {
          code: "connector_provider_request_failed",
          statusCode: 400,
          details: {
            insertErrors: payload.insertErrors,
          },
        });
      }
      return {
        success: true,
        insertedRows: rows.length,
      };
    }
    default:
      throw unknownAction();
  }
}

async function runReadOnlyQuery(client, args) {
  const dryRun = await client.request(
    `/bigquery/v2/projects/${encodePath(requireString(args.projectId, "BigQuery projectId"))}/jobs`,
    {
      method: "POST",
      query: compactObject({
        location: readString(args.location),
      }),
      body: {
        configuration: {
          dryRun: true,
          query: compactObject({
            query: requireString(args.query, "BigQuery SQL query"),
            useLegacySql: false,
            maximumBytesBilled: normalizeMaximumBytes(args.maximumBytesBilled),
          }),
        },
        jobReference: compactObject({
          projectId: requireString(args.projectId, "BigQuery projectId"),
          location: readString(args.location),
        }),
      },
    },
  );
  const statementType = readString(dryRun?.statistics?.query?.statementType).toUpperCase();
  if (args.dryRun === true) {
    return {
      dryRun: true,
      statementType,
      statistics: dryRun?.statistics || {},
      configuration: dryRun?.configuration || {},
    };
  }
  if (statementType !== "SELECT") {
    throw invalidInput(
      `The read-only BigQuery action only accepts SELECT statements; BigQuery classified this statement as ${statementType || "unknown"}. Use execute_mutating_query for approved mutations.`,
    );
  }
  return runQuery(client, args);
}

function runQuery(client, args, { requestId } = {}) {
  return client.request(
    `/bigquery/v2/projects/${encodePath(
      requireString(args.projectId, "BigQuery projectId"),
    )}/queries`,
    {
      method: "POST",
      body: compactObject({
        query: requireString(args.query, "BigQuery SQL query"),
        useLegacySql: false,
        location: readString(args.location),
        maximumBytesBilled: normalizeMaximumBytes(args.maximumBytesBilled),
        requestId,
        maxResults: 100,
        timeoutMs: 10_000,
      }),
    },
  );
}

function createBigQueryClient({ accessToken, fetchImpl }) {
  async function request(pathname, { method = "GET", query, body } = {}) {
    const url = new URL(pathname, BIGQUERY_API_ORIGIN);
    if (url.origin !== BIGQUERY_API_ORIGIN) {
      throw invalidInput("BigQuery API URL is invalid.");
    }
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
      throw createProviderRequestError("bigquery", response, payload);
    }
    return payload;
  }
  return Object.freeze({ request });
}

async function requestServiceAccountAccessToken({ serviceAccount, scope, fetchImpl, now }) {
  const issuedAt = Math.floor(now() / 1000);
  const expiresAtSeconds = issuedAt + 3600;
  const header = Buffer.from(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
      ...(readString(serviceAccount.private_key_id)
        ? { kid: readString(serviceAccount.private_key_id) }
        : {}),
    }),
  ).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: requireString(serviceAccount.client_email, "BigQuery service-account client_email"),
      scope,
      aud: GOOGLE_TOKEN_URL,
      iat: issuedAt,
      exp: expiresAtSeconds,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${claims}`;
  let signature;
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    signer.end();
    signature = signer
      .sign(
        requireString(serviceAccount.private_key, "BigQuery service-account private_key").replace(
          /\\n/g,
          "\n",
        ),
      )
      .toString("base64url");
  } catch {
    throw invalidInput("The BigQuery service-account private key is invalid.");
  }
  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: GOOGLE_JWT_GRANT,
      assertion: `${unsigned}.${signature}`,
    }).toString(),
    cache: "no-store",
  });
  const payload = await readJsonResponse(response);
  const accessToken = readString(payload?.access_token);
  if (!response.ok || !accessToken) {
    throw createProviderRequestError(
      "bigquery",
      response,
      payload,
      "Google rejected the BigQuery service-account assertion.",
    );
  }
  const expiresIn = Math.max(60, Number(payload?.expires_in || 3600));
  return {
    accessToken,
    expiresAt: now() + expiresIn * 1000,
  };
}

function normalizeServiceAccount(token) {
  if (isRecord(token?.serviceAccount)) return token.serviceAccount;
  const raw = readString(token?.serviceAccountJson);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isRecord(parsed)) return parsed;
    } catch {}
  }
  throw unavailableCredential("bigquery");
}

function bigQueryResourcePath(args, resourceType) {
  return `/bigquery/v2/projects/${encodePath(
    requireString(args.projectId, "BigQuery projectId"),
  )}/${resourceType}/${encodePath(requireString(args.datasetId, "BigQuery datasetId"))}`;
}

function normalizeCollection(payload, field) {
  const cursor = readString(payload?.nextPageToken);
  return {
    items: Array.isArray(payload?.[field]) ? payload[field] : [],
    cursor,
    hasMore: Boolean(cursor),
    totalItems: payload?.totalItems === undefined ? undefined : Number(payload.totalItems),
  };
}

function normalizeMaximumBytes(value) {
  const normalized = readString(value);
  if (!normalized) return undefined;
  if (!/^\d+$/.test(normalized)) {
    throw invalidInput("BigQuery maximumBytesBilled must be a non-negative integer string.");
  }
  return normalized;
}

function normalizeTableSchema(value) {
  let schema;
  try {
    schema = JSON.parse(requireString(value, "BigQuery schemaJson"));
  } catch {
    throw invalidInput("BigQuery schemaJson must be valid JSON.");
  }
  if (Array.isArray(schema)) schema = { fields: schema };
  if (!isRecord(schema) || !Array.isArray(schema.fields)) {
    throw invalidInput("BigQuery schemaJson must contain a fields array.");
  }
  return schema;
}

function normalizeRows(value) {
  let rows;
  try {
    rows = JSON.parse(requireString(value, "BigQuery rowsJson"));
  } catch {
    throw invalidInput("BigQuery rowsJson must be valid JSON.");
  }
  if (!Array.isArray(rows) || !rows.length || rows.some((row) => !isRecord(row))) {
    throw invalidInput("BigQuery rowsJson must be a non-empty JSON array of objects.");
  }
  if (rows.length > 500) {
    throw invalidInput("BigQuery insert_rows accepts at most 500 rows per call.");
  }
  return rows;
}

function normalizeInsertIds(value, rowCount) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw invalidInput("BigQuery insertIds must be an array.");
  }
  const values = value.map(readString);
  if (values.length !== rowCount || values.some((entry) => !entry)) {
    throw invalidInput("BigQuery insertIds must contain one non-empty ID per row.");
  }
  return values;
}

function unknownAction() {
  return new ConnectorRuntimeError("Unknown BigQuery action.", {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}
