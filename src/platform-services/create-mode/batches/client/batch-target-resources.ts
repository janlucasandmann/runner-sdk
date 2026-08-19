import type {
  BatchMetronomeManualRunContext,
  BatchPreparedProjectTicket,
  BatchProjectOption,
  BatchProjectTicketOption,
  BatchSelectableTargetKind,
  BatchTargetResourceOption,
} from "./batches-types.js";

export interface BatchTargetResourceApiOptions {
  baseUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
}

export interface PrepareBatchProjectTicketOptions extends BatchTargetResourceApiOptions {
  idempotencyKey?: string | null;
  runKind?: "implementation" | "review";
}

const RESOURCE_PATHS: Record<BatchSelectableTargetKind, string> = {
  metronome_run: "/metronomes?includeArchived=false&limit=500",
  evaluation_run: "/evaluations?limit=500",
  agent_optimization: "/fine-tuning/jobs?view=overview&limit=100",
};

const RESOURCE_LIST_KEYS: Record<BatchSelectableTargetKind, readonly string[]> = {
  metronome_run: ["metronomes", "workflows"],
  evaluation_run: ["evaluations", "evaluationSets", "evaluation_sets"],
  agent_optimization: ["jobs", "fineTuningJobs", "fine_tuning_jobs"],
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function readResourceList(payload: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  const source = asRecord(payload);
  const data = asRecord(source.data);
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  for (const candidate of [source.data, source.items, source.records]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (response.ok) return payload;
  const source = asRecord(payload);
  const message =
    readString(source.message, source.error, source.detail) ||
    (typeof payload === "string" ? payload : "") ||
    `Platform API request failed (${response.status}).`;
  throw new Error(message);
}

function normalizeResource(
  targetKind: BatchSelectableTargetKind,
  rawResource: unknown,
  index: number,
): BatchTargetResourceOption | null {
  const source = asRecord(rawResource);
  const metadata = asRecord(source.metadata);
  const id =
    targetKind === "metronome_run"
      ? readString(
          source.id,
          source.metronomeId,
          source.metronome_id,
          source.workflowId,
          source.workflow_id,
        )
      : targetKind === "evaluation_run"
        ? readString(source.id, source.evaluationId, source.evaluation_id)
        : readString(source.id, source.jobId, source.job_id);
  if (!id) return null;

  const fallbackName =
    targetKind === "metronome_run"
      ? `Workflow ${index + 1}`
      : targetKind === "evaluation_run"
        ? `Evaluation ${index + 1}`
        : `Agent Optimization ${index + 1}`;
  const name = readString(source.name, source.title, source.label, fallbackName);
  const status = readString(source.status, source.phase, metadata.status) || null;
  const relatedName =
    targetKind === "metronome_run"
      ? readString(
          source.projectName,
          source.project_name,
          metadata.projectName,
          metadata.project_name,
        )
      : targetKind === "agent_optimization"
        ? readString(
            source.targetAgentName,
            source.target_agent_name,
            source.agentName,
            source.agent_name,
          )
        : "";
  const description =
    readString(source.description, source.summary) ||
    [relatedName, status].filter(Boolean).join(" · ") ||
    id;
  const versionId =
    targetKind === "agent_optimization"
      ? null
      : readString(
          source.publishedVersionId,
          source.published_version_id,
          source.currentVersionId,
          source.current_version_id,
          source.versionId,
          source.version_id,
          metadata.publishedVersionId,
          metadata.published_version_id,
          metadata.currentVersionId,
          metadata.current_version_id,
        ) || null;

  const definition = targetKind === "metronome_run" ? asRecord(source.definition) : {};
  const nodes = Array.isArray(source.nodes)
    ? source.nodes
    : Array.isArray(definition.nodes)
      ? definition.nodes
      : [];
  const edges = Array.isArray(source.edges)
    ? source.edges
    : Array.isArray(definition.edges)
      ? definition.edges
      : [];

  return {
    id,
    targetKind,
    name,
    description,
    status,
    versionId,
    ...(targetKind === "metronome_run" ? { definition, nodes, edges } : {}),
  };
}

function readVersionDefinition(rawVersion: unknown): {
  versionId: string;
  definition: Record<string, unknown>;
  nodes: unknown[];
  edges: unknown[];
} {
  const source = asRecord(rawVersion);
  const snapshot = asRecord(source.snapshot);
  const directDefinition = asRecord(source.definition);
  const snapshotDefinition = asRecord(snapshot.definition);
  const definition = Object.keys(directDefinition).length
    ? directDefinition
    : Object.keys(snapshotDefinition).length
      ? snapshotDefinition
      : snapshot;
  const nodes = Array.isArray(source.nodes)
    ? source.nodes
    : Array.isArray(definition.nodes)
      ? definition.nodes
      : Array.isArray(snapshot.nodes)
        ? snapshot.nodes
        : [];
  const edges = Array.isArray(source.edges)
    ? source.edges
    : Array.isArray(definition.edges)
      ? definition.edges
      : Array.isArray(snapshot.edges)
        ? snapshot.edges
        : [];
  return {
    versionId: readString(source.id, source.versionId, source.version_id),
    definition: { ...definition, nodes, edges },
    nodes,
    edges,
  };
}

function normalizedServerKind(rawServer: unknown): string {
  const source = asRecord(rawServer);
  const metadata = asRecord(source.metadata);
  const config = asRecord(source.config);
  const details = asRecord(source.details);
  const candidates = [
    source.kind,
    source.type,
    source.serverKind,
    source.server_kind,
    source.resourceKind,
    source.resource_kind,
    source.resourceType,
    source.resource_type,
    source.category,
    source.subtype,
    metadata.kind,
    metadata.type,
    metadata.category,
    metadata.subtype,
    metadata.runtime,
    config.kind,
    config.type,
    config.category,
    config.subtype,
    config.runtime,
    details.kind,
    details.type,
    details.category,
    details.subtype,
    details.runtime,
  ];
  return (
    candidates
      .map((value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[-\s]+/g, "_"),
      )
      .find(Boolean) || ""
  );
}

function classifyServer(rawServer: unknown): "function" | "web_app" | "database" | "auth" | "" {
  const source = asRecord(rawServer);
  const kind = normalizedServerKind(rawServer);
  const searchable = [kind, source.id, source.name, source.title]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  if (/\b(auth|authentication|identity|user_auth)\b/.test(searchable) || kind.endsWith("_auth")) {
    return "auth";
  }
  if (
    /\b(database|databases|postgres|postgresql|document_database|sql_database)\b/.test(
      searchable,
    ) ||
    kind.endsWith("_database")
  ) {
    return "database";
  }
  if (
    /\b(web_app|webapp|website|static_site|hosted_app|frontend)\b/.test(searchable) ||
    kind.endsWith("_web_app")
  ) {
    return "web_app";
  }
  if (
    /\b(function|functions|cloud_function|edge_function|nodejs|javascript|typescript)\b/.test(
      searchable,
    ) ||
    kind.endsWith("_function") ||
    String(source.id || "").startsWith("fn_")
  ) {
    return "function";
  }
  return "";
}

function normalizeServerOptions(payload: unknown) {
  const buckets = {
    functionOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    webAppOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    databaseOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    authOptions: [] as Array<{ id: string; name: string; kind?: string }>,
  };
  readResourceList(payload, ["servers", "items", "resources"]).forEach((rawServer) => {
    const source = asRecord(rawServer);
    const id = readString(source.id, source.serverId, source.server_id);
    if (!id) return;
    const item = {
      id,
      name: readString(source.name, source.title, source.label, id),
      kind: normalizedServerKind(rawServer),
    };
    const classification = classifyServer(rawServer);
    if (classification === "function") buckets.functionOptions.push(item);
    else if (classification === "web_app") buckets.webAppOptions.push(item);
    else if (classification === "database") buckets.databaseOptions.push(item);
    else if (classification === "auth") buckets.authOptions.push(item);
  });
  Object.values(buckets).forEach((items) => {
    items.sort((left, right) => left.name.localeCompare(right.name));
  });
  return buckets;
}

export async function loadBatchMetronomeManualRunContext(
  metronomeId: string,
  versionId: string | null | undefined,
  options: BatchTargetResourceApiOptions = {},
): Promise<BatchMetronomeManualRunContext> {
  const normalizedMetronomeId = String(metronomeId || "").trim();
  const normalizedVersionId = String(versionId || "").trim();
  if (!normalizedMetronomeId) throw new Error("Select a Workflow first.");
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const headers = { ...(options.requestHeaders || {}) };
  const versionsPath = `/metronomes/${encodeURIComponent(normalizedMetronomeId)}/versions`;
  const [versionResponse, serversResult] = await Promise.all([
    fetch(`${baseUrl}${versionsPath}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers,
    }),
    fetch(`${baseUrl}/servers`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers,
    })
      .then(readResponse)
      .catch(() => null),
  ]);
  const versionPayload = await readResponse(versionResponse);
  const versions = readResourceList(versionPayload, [
    "versions",
    "metronomeVersions",
    "metronome_versions",
    "workflowVersions",
    "workflow_versions",
  ]);
  const rawVersion = normalizedVersionId
    ? versions.find((candidate) => {
        const source = asRecord(candidate);
        return readString(source.id, source.versionId, source.version_id) === normalizedVersionId;
      })
    : versions.find((candidate) => {
        const status = readString(asRecord(candidate).status).toLowerCase();
        return status === "active" || status === "published";
      }) || versions[0];
  if (normalizedVersionId && !rawVersion) {
    throw new Error("The pinned Workflow version is no longer available.");
  }
  if (!rawVersion) throw new Error("This Workflow does not have a published version.");
  const version = readVersionDefinition(rawVersion);
  if (!version.versionId && !normalizedVersionId) {
    throw new Error("The published Workflow version could not be resolved.");
  }
  const serverOptions = normalizeServerOptions(serversResult);
  return {
    workflow: {
      id: normalizedMetronomeId,
      name: readString(version.definition.name, `Workflow ${normalizedMetronomeId}`),
      definition: version.definition,
    },
    definition: version.definition,
    versionId: version.versionId || normalizedVersionId,
    nodes: version.nodes,
    edges: version.edges,
    ...serverOptions,
  };
}

function normalizeProject(rawProject: unknown, index: number): BatchProjectOption | null {
  const source = asRecord(rawProject);
  const metadata = asRecord(source.metadata);
  const summary = asRecord(source.summary);
  const id = readString(source.id, source.projectId, source.project_id);
  if (!id) return null;
  const name = readString(source.name, source.title, `Project ${index + 1}`);
  const status = readString(source.status, source.state, metadata.status) || null;
  const description =
    readString(source.description, source.summaryText, metadata.description) ||
    [
      readString(summary.openTasksCount, summary.open_tasks_count)
        ? `${readString(summary.openTasksCount, summary.open_tasks_count)} open tickets`
        : "",
      status,
    ]
      .filter(Boolean)
      .join(" · ") ||
    id;
  return { id, name, description, status };
}

function normalizeProjectTicket(
  projectId: string,
  rawTicket: unknown,
  index: number,
): BatchProjectTicketOption | null {
  const source = asRecord(rawTicket);
  const metadata = asRecord(source.metadata);
  const runnerMetadata = asRecord(metadata.runnerPlayground);
  const id = readString(source.id, source.taskId, source.task_id);
  if (!id) return null;
  const ticketNumber =
    readString(
      source.ticketNumber,
      source.ticket_number,
      runnerMetadata.ticketNumber,
      runnerMetadata.ticket_number,
    ) || null;
  const title = readString(source.title, source.name, `Ticket ${index + 1}`);
  const name = ticketNumber ? `${ticketNumber} · ${title}` : title;
  const status = readString(source.status, source.state, metadata.status) || null;
  const priority = readString(source.priority, metadata.priority);
  const description =
    readString(source.description, source.summary) ||
    [status, priority].filter(Boolean).join(" · ") ||
    id;
  return {
    id,
    projectId,
    name,
    description,
    status,
    ticketNumber,
    disabled: status === "canceled",
  };
}

export async function listBatchTargetResources(
  targetKind: BatchSelectableTargetKind,
  options: BatchTargetResourceApiOptions = {},
): Promise<BatchTargetResourceOption[]> {
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}${RESOURCE_PATHS[targetKind]}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { ...(options.requestHeaders || {}) },
  });
  const payload = await readResponse(response);
  const seen = new Set<string>();
  return readResourceList(payload, RESOURCE_LIST_KEYS[targetKind])
    .map((resource, index) => normalizeResource(targetKind, resource, index))
    .filter((resource): resource is BatchTargetResourceOption => {
      if (!resource || seen.has(resource.id)) return false;
      seen.add(resource.id);
      return true;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function listBatchProjects(
  options: BatchTargetResourceApiOptions = {},
): Promise<BatchProjectOption[]> {
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/projects?view=overview`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { ...(options.requestHeaders || {}) },
  });
  const payload = await readResponse(response);
  const seen = new Set<string>();
  return readResourceList(payload, ["projects"])
    .map(normalizeProject)
    .filter((project): project is BatchProjectOption => {
      if (!project || seen.has(project.id)) return false;
      seen.add(project.id);
      return true;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function listBatchProjectTickets(
  projectId: string,
  options: BatchTargetResourceApiOptions = {},
): Promise<BatchProjectTicketOption[]> {
  const normalizedProjectId = String(projectId || "").trim();
  if (!normalizedProjectId) return [];
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const query = new URLSearchParams({ projectId: normalizedProjectId, limit: "500" });
  const response = await fetch(`${baseUrl}/tasks?${query.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { ...(options.requestHeaders || {}) },
  });
  const payload = await readResponse(response);
  const seen = new Set<string>();
  return readResourceList(payload, ["tasks"])
    .map((ticket, index) => normalizeProjectTicket(normalizedProjectId, ticket, index))
    .filter((ticket): ticket is BatchProjectTicketOption => {
      if (!ticket || seen.has(ticket.id)) return false;
      seen.add(ticket.id);
      return true;
    })
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
}

export async function prepareBatchProjectTicket(
  ticketId: string,
  options: PrepareBatchProjectTicketOptions = {},
): Promise<BatchPreparedProjectTicket> {
  const normalizedTicketId = String(ticketId || "").trim();
  if (!normalizedTicketId) throw new Error("Select a project ticket first.");
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const response = await fetch(
    `${baseUrl}/tasks/${encodeURIComponent(normalizedTicketId)}/run-thread`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.requestHeaders || {}),
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        executionMode: "deferred",
        moveToInProgress: false,
        idempotencyKey: options.idempotencyKey || undefined,
        metadata: {
          source: "batch_composer",
          triggerKind: "manual",
          runKind: options.runKind || "implementation",
        },
      }),
    },
  );
  const payload = asRecord(await readResponse(response));
  const thread = asRecord(payload.thread);
  const threadId = readString(thread.id, payload.threadId, payload.thread_id);
  if (!threadId) throw new Error("The project ticket thread could not be prepared.");
  return {
    threadId,
    threadTitle: readString(thread.title, "Project ticket Batch"),
    taskPrompt: readString(thread.task, thread.prompt),
  };
}
