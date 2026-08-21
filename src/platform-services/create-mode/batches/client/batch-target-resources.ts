import type {
  BatchMetronomeManualRunContext,
  BatchPreparedProjectTicket,
  BatchProjectOption,
  BatchProjectTicketOption,
  BatchSelectableTargetKind,
  BatchTargetResourceOption,
} from "./batches-types.js";
import { loadMetronomeManualRunContext } from "../../metronome/client/manual-run-context.js";

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

export async function loadBatchMetronomeManualRunContext(
  metronomeId: string,
  versionId: string | null | undefined,
  options: BatchTargetResourceApiOptions = {},
): Promise<BatchMetronomeManualRunContext> {
  return loadMetronomeManualRunContext(metronomeId, versionId, options);
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
