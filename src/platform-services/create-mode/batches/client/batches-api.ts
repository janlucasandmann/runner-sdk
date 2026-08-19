import type {
  BatchCapacity,
  BatchJob,
  BatchJobAttempt,
  BatchJobDraft,
  BatchJobEvent,
} from "./batches-types.js";

export interface BatchesApiOptions {
  basePath?: string;
  requestHeaders?: HeadersInit;
}

export class BatchesApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BatchesApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: BatchesApiOptions,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${options.basePath || "/api/real/batch-jobs"}${path}`, {
    ...init,
    headers: {
      ...(options.requestHeaders || {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const raw = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }
  if (!response.ok) {
    throw new BatchesApiError(
      String(body.message || body.error || `Batch request failed (${response.status}).`),
      response.status,
    );
  }
  return body as T;
}

export async function listBatchJobs(options: BatchesApiOptions): Promise<BatchJob[]> {
  const collected = new Map<string, BatchJob>();
  let cursor = "";
  // The centralized overview is client-filtered like Skills. Follow the
  // service's stable keyset cursor so large organization queues are complete
  // without asking the API for an unbounded response.
  for (let page = 0; page < 20; page += 1) {
    const query = new URLSearchParams({ limit: "250" });
    if (cursor) query.set("cursor", cursor);
    const response = await request<{
      jobs?: BatchJob[];
      data?: BatchJob[];
      hasMore?: boolean;
      nextCursor?: string | null;
    }>(`?${query.toString()}`, options);
    const jobs = Array.isArray(response.jobs)
      ? response.jobs
      : Array.isArray(response.data)
        ? response.data
        : [];
    jobs.forEach((job) => {
      collected.set(job.id, job);
    });
    const nextCursor = String(response.nextCursor || "").trim();
    if (!response.hasMore || !nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  }
  return Array.from(collected.values());
}

export function getBatchJob(
  id: string,
  options: BatchesApiOptions,
): Promise<{ job: BatchJob; events: BatchJobEvent[]; attempts: BatchJobAttempt[] }> {
  return request(`/${encodeURIComponent(id)}`, options);
}

export async function createBatchJob(
  draft: BatchJobDraft & { name: string; targetKind: NonNullable<BatchJobDraft["targetKind"]> },
  options: BatchesApiOptions,
): Promise<BatchJob> {
  const response = await request<{ job: BatchJob }>("", options, {
    method: "POST",
    body: JSON.stringify(draft),
  });
  return response.job;
}

export async function updateBatchJob(
  id: string,
  draft: BatchJobDraft,
  options: BatchesApiOptions,
): Promise<BatchJob> {
  const response = await request<{ job: BatchJob }>(`/${encodeURIComponent(id)}`, options, {
    method: "PATCH",
    body: JSON.stringify({
      name: draft.name,
      description: draft.description,
      definition: draft.definition,
      targetResourceId: draft.targetResourceId,
      targetVersionId: draft.targetVersionId,
      startPolicy: draft.startPolicy,
    }),
  });
  return response.job;
}

export async function runBatchJobAction(
  id: string,
  action: "start" | "hold" | "cancel",
  options: BatchesApiOptions,
): Promise<BatchJob> {
  const response = await request<{ job: BatchJob }>(
    `/${encodeURIComponent(id)}/${action}`,
    options,
    { method: "POST", body: "{}" },
  );
  return response.job;
}

export async function reorderBatchJob(
  id: string,
  index: number,
  options: BatchesApiOptions,
): Promise<BatchJob> {
  const response = await request<{ job: BatchJob }>(`/${encodeURIComponent(id)}/reorder`, options, {
    method: "POST",
    body: JSON.stringify({ index }),
  });
  return response.job;
}

export async function deleteBatchJob(id: string, options: BatchesApiOptions): Promise<void> {
  await request(`/${encodeURIComponent(id)}`, options, { method: "DELETE" });
}

export async function getBatchCapacity(
  options: BatchesApiOptions,
): Promise<{ capacity: BatchCapacity; queue: Record<string, number> }> {
  return request("/capacity", options);
}
