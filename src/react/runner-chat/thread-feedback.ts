import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./api-utils.js";
import {
  getRecordNumber,
  getRecordString,
} from "./record-utils.js";

export type RunnerThreadFeedbackRating = "up" | "down";
export type RunnerThreadFeedbackReportType =
  | "general"
  | "bug"
  | "child_safety"
  | "response";

export interface RunnerThreadFeedbackState {
  userRating: RunnerThreadFeedbackRating | null;
  upCount: number;
  downCount: number;
  reportCount: number;
  isSubmitting: boolean;
}

export const RUNNER_THREAD_FEEDBACK_REPORT_OPTIONS: Array<{
  value: RunnerThreadFeedbackReportType;
  label: string;
}> = [
  { value: "general", label: "General feedback" },
  { value: "bug", label: "Report issue / bug" },
  { value: "child_safety", label: "Child safety concern" },
  { value: "response", label: "Response feedback" },
];

function normalizeRunnerThreadFeedback(
  value: unknown
): Omit<RunnerThreadFeedbackState, "isSubmitting"> {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const rawUserRating = getRecordString(record, [
    "userRating",
    "user_rating",
    "rating",
  ])
    .trim()
    .toLowerCase();
  return {
    userRating:
      rawUserRating === "up" || rawUserRating === "down"
        ? rawUserRating
        : null,
    upCount: Math.max(
      0,
      Math.round(
        getRecordNumber(record, [
          "upCount",
          "up_count",
          "upvotes",
          "thumbsUp",
        ]) ?? 0
      )
    ),
    downCount: Math.max(
      0,
      Math.round(
        getRecordNumber(record, [
          "downCount",
          "down_count",
          "downvotes",
          "thumbsDown",
        ]) ?? 0
      )
    ),
    reportCount: Math.max(
      0,
      Math.round(
        getRecordNumber(record, [
          "reportCount",
          "report_count",
          "reports",
        ]) ?? 0
      )
    ),
  };
}

export async function fetchThreadFeedback(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<Omit<RunnerThreadFeedbackState, "isSubmitting">> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/feedback`,
    {
      method: "GET",
      headers: buildRunnerHeaders(
        params.requestHeaders,
        params.apiKey
      ),
      cache: "no-store",
    }
  );
  const body = await response.text();
  let parsed: unknown = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    const record =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    throw new Error(
      getRecordString(record, ["message", "error"]) ||
        `Failed to load thread feedback (${response.status})`
    );
  }
  return normalizeRunnerThreadFeedback(parsed);
}

export async function setThreadFeedback(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  rating: RunnerThreadFeedbackRating;
  requestHeaders?: HeadersInit;
}): Promise<Omit<RunnerThreadFeedbackState, "isSubmitting">> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(
    params.requestHeaders,
    params.apiKey
  );
  headers.set("Content-Type", "application/json");
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/feedback`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ rating: params.rating }),
    }
  );
  const body = await response.text();
  let parsed: unknown = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    const record =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    throw new Error(
      getRecordString(record, ["message", "error"]) ||
        `Failed to save thread feedback (${response.status})`
    );
  }
  return normalizeRunnerThreadFeedback(parsed);
}

export async function reportThreadFeedbackIssue(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  reportType: RunnerThreadFeedbackReportType;
  message: string;
  metadata?: Record<string, unknown> | null;
  requestHeaders?: HeadersInit;
}): Promise<void> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(
    params.requestHeaders,
    params.apiKey
  );
  headers.set("Content-Type", "application/json");
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/feedback/report`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        reportType: params.reportType,
        message: params.message,
        metadata: params.metadata ?? null,
      }),
    }
  );
  const body = await response.text();
  let parsed: unknown = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    const record =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    throw new Error(
      getRecordString(record, ["message", "error"]) ||
        `Failed to report issue (${response.status})`
    );
  }
}
