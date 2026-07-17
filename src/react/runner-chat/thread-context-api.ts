import { iterateSseData } from "../../sse.js";
import { buildRunnerHeaders } from "./api-utils.js";
import {
  DEFAULT_THREAD_CONTEXT_ACTIONS,
  type RunnerChatThreadContext,
  type RunnerChatThreadContextAction,
  type RunnerChatThreadContextAvailableActions,
  type RunnerChatThreadContextDetails,
} from "./thread-context-utils.js";

interface RunnerThreadContextRequest {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  threadId: string;
}

export interface RunnerThreadContextDetailsResponse {
  context: RunnerChatThreadContextDetails | null;
  availableActions: RunnerChatThreadContextAvailableActions;
  nativeError: string | null;
}

export interface RunnerThreadContextActionResponse {
  type?: RunnerChatThreadContextAction;
  message?: string;
  responseText?: string;
  sessionId?: string | null;
  thread?: {
    id: string;
    title?: string;
  };
}

function buildThreadContextUrl(
  request: RunnerThreadContextRequest,
  suffix = "",
): string {
  return `${request.backendUrl}/threads/${encodeURIComponent(request.threadId)}${suffix}`;
}

async function parseJsonResponse<T>(
  response: Response,
  fallbackError: string,
): Promise<T> {
  const body = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = body ? JSON.parse(body) as Record<string, unknown> : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    const message =
      typeof parsed.message === "string"
        ? parsed.message
        : typeof parsed.error === "string"
          ? parsed.error
          : fallbackError;
    throw new Error(message);
  }
  return parsed as T;
}

export async function fetchRunnerThreadContext(
  request: RunnerThreadContextRequest,
): Promise<RunnerChatThreadContext | null> {
  const response = await fetch(buildThreadContextUrl(request, "/context"), {
    method: "GET",
    headers: buildRunnerHeaders(request.requestHeaders, request.apiKey.trim()),
  });
  const parsed = await parseJsonResponse<{
    context?: RunnerChatThreadContext;
  }>(
    response,
    `Failed to load thread context (${response.status})`,
  );
  return parsed.context || null;
}

export async function fetchRunnerThreadContextDetails(
  request: RunnerThreadContextRequest,
): Promise<RunnerThreadContextDetailsResponse> {
  const response = await fetch(buildThreadContextUrl(request, "/context/details"), {
    method: "GET",
    headers: buildRunnerHeaders(request.requestHeaders, request.apiKey.trim()),
  });
  const parsed = await parseJsonResponse<{
    context?: RunnerChatThreadContextDetails;
    availableActions?: RunnerChatThreadContextAvailableActions;
    nativeError?: string | null;
  }>(
    response,
    `Failed to load thread context details (${response.status})`,
  );
  return {
    context: parsed.context || null,
    availableActions: parsed.availableActions || DEFAULT_THREAD_CONTEXT_ACTIONS,
    nativeError: parsed.nativeError || null,
  };
}

export async function requestRunnerThreadContextAction(
  request: RunnerThreadContextRequest & {
    action: RunnerChatThreadContextAction;
    prompt?: string;
  },
): Promise<RunnerThreadContextActionResponse> {
  const headers = buildRunnerHeaders(request.requestHeaders, request.apiKey.trim());
  headers.set("Content-Type", "application/json");
  const response = await fetch(buildThreadContextUrl(request, "/context/actions"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: request.action,
      ...(request.prompt ? { prompt: request.prompt } : {}),
    }),
  });
  const parsed = await parseJsonResponse<{
    action?: RunnerThreadContextActionResponse;
  }>(
    response,
    `Failed to execute ${request.action} (${response.status})`,
  );
  return parsed.action || {};
}

export async function streamRunnerThreadBtw(
  request: RunnerThreadContextRequest & {
    prompt: string;
    onMessage?: (message: string) => void;
  },
): Promise<string> {
  const headers = buildRunnerHeaders(request.requestHeaders, request.apiKey.trim());
  headers.set("Content-Type", "application/json");
  const response = await fetch(
    buildThreadContextUrl(request, "/context/actions/btw/stream"),
    {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: request.prompt }),
    },
  );
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(bodyText || `Failed to execute /btw (${response.status})`);
  }
  if (!response.body) {
    throw new Error("BTW stream response has no body");
  }

  let fullText = "";
  for await (const data of iterateSseData(response.body)) {
    if (!data || data === "[DONE]") continue;
    let event: Record<string, unknown> | null = null;
    try {
      event = JSON.parse(data) as Record<string, unknown>;
    } catch {
      event = null;
    }
    if (!event) continue;

    if (event.type === "btw.delta" && typeof event.text === "string") {
      fullText = event.text;
      request.onMessage?.(fullText);
      continue;
    }
    if (event.type === "btw.completed" && typeof event.message === "string") {
      fullText = event.message;
      request.onMessage?.(fullText);
      continue;
    }
    if (event.type === "stream.error") {
      const errorMessage =
        typeof event.error === "object"
        && event.error
        && typeof (event.error as { message?: unknown }).message === "string"
          ? (event.error as { message: string }).message || "Failed to execute /btw."
          : "Failed to execute /btw.";
      throw new Error(errorMessage);
    }
  }
  return fullText;
}
