import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./api-utils.js";

export type RunnerForkFileCopyMode = "all" | "thread_only" | "none";
export type RunnerForkTarget =
  | "existing_environment"
  | "new_forked_environment";
export type RunnerForkExistingEnvironmentFileCopyMode =
  | "thread_only"
  | "none";

export async function createThread(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  title?: string;
  appId?: string;
  environmentId?: string;
  projectId?: string | null;
  agentId?: string;
  reasoningEffort?: string | null;
  metadata?: Record<string, unknown> | null;
  privateMode?: boolean;
}): Promise<{
  threadId: string;
  title: string | null;
  environmentId: string | null;
}> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  headers.set("Content-Type", "application/json");
  const baseMetadata =
    params.metadata &&
    typeof params.metadata === "object" &&
    !Array.isArray(params.metadata)
      ? params.metadata
      : undefined;
  const runnerPlaygroundMetadata =
    baseMetadata?.runnerPlayground &&
    typeof baseMetadata.runnerPlayground === "object" &&
    !Array.isArray(baseMetadata.runnerPlayground)
      ? baseMetadata.runnerPlayground
      : {};
  const metadata =
    baseMetadata || params.privateMode
      ? {
          ...(baseMetadata || {}),
          runnerPlayground: {
            ...runnerPlaygroundMetadata,
            ...(params.privateMode
              ? {
                  privateMode: true,
                  privateModeCreatedAt: new Date().toISOString(),
                }
              : {}),
          },
        }
      : undefined;

  const response = await fetch(`${backendUrl}/threads`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: params.title,
      appId: params.appId,
      environmentId: params.environmentId,
      projectId: params.projectId || undefined,
      agentId: params.agentId,
      reasoningEffort: params.reasoningEffort || undefined,
      metadata,
    }),
  });

  const body = await response.text();
  let parsed: {
    thread?: {
      id?: string;
      title?: string | null;
      environmentId?: string | null;
    };
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to create thread (${response.status})`
    );
  }

  const threadId = parsed.thread?.id;
  if (!threadId || typeof threadId !== "string") {
    throw new Error(
      "Thread creation succeeded but response.thread.id is missing"
    );
  }

  return {
    threadId,
    title:
      typeof parsed.thread?.title === "string"
        ? parsed.thread.title
        : null,
    environmentId:
      typeof parsed.thread?.environmentId === "string"
        ? parsed.thread.environmentId
        : null,
  };
}

export const DEFAULT_NEW_THREAD_TITLE = "New Thread";

export function isDefaultThreadTitle(
  title: string | null | undefined
): boolean {
  return (
    !title ||
    title.trim().toLowerCase() ===
      DEFAULT_NEW_THREAD_TITLE.toLowerCase()
  );
}

export async function generateThreadTitle(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  threadId: string;
  message: string;
}): Promise<string> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/generate-title`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ message: params.message }),
    }
  );

  const body = await response.text();
  let parsed: {
    thread?: { title?: string };
    title?: string;
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to generate thread title (${response.status})`
    );
  }

  const nextTitle =
    (typeof parsed.thread?.title === "string"
      ? parsed.thread.title
      : "") ||
    (typeof parsed.title === "string" ? parsed.title : "");
  if (!nextTitle.trim()) {
    throw new Error(
      "Thread title generation succeeded but response title is missing"
    );
  }
  return nextTitle.trim();
}

export async function cancelThreadExecution(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<void> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(
    params.requestHeaders,
    params.apiKey
  );
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/cancel`,
    { method: "POST", headers }
  );

  const bodyText = await response.text().catch(() => "");
  let parsed: { message?: string; error?: string } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = { message: bodyText };
  }

  if (!response.ok) {
    const message =
      parsed.message ||
      parsed.error ||
      `Failed to cancel thread (${response.status})`;
    if (
      response.status === 400 &&
      /no active execution|no running execution/i.test(message)
    ) {
      return;
    }
    throw new Error(message);
  }
}

export async function forkThreadRequest(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  truncateAtMessageIndex?: number;
  environmentTarget?: RunnerForkTarget;
  environmentName?: string;
  targetEnvironmentId?: string;
  fileCopyMode?: RunnerForkFileCopyMode;
  requestHeaders?: HeadersInit;
}): Promise<{
  thread: { id: string };
  environmentId?: string | null;
  environmentName?: string | null;
}> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(
    params.requestHeaders,
    params.apiKey
  );
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/copy`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...(typeof params.truncateAtMessageIndex === "number"
          ? { truncateAtMessageIndex: params.truncateAtMessageIndex }
          : {}),
        environmentTarget: params.environmentTarget,
        environmentName: params.environmentName,
        targetEnvironmentId: params.targetEnvironmentId,
        fileCopyMode: params.fileCopyMode,
      }),
    }
  );

  const body = await response.text();
  let parsed: {
    thread?: { id?: string };
    environmentId?: string | null;
    environmentName?: string | null;
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to fork thread (${response.status})`
    );
  }

  const nextThreadId = parsed.thread?.id;
  if (!nextThreadId || typeof nextThreadId !== "string") {
    throw new Error(
      "Fork completed without returning a new thread."
    );
  }

  return {
    thread: { id: nextThreadId },
    environmentId:
      typeof parsed.environmentId === "string" &&
      parsed.environmentId.trim()
        ? parsed.environmentId
        : null,
    environmentName:
      typeof parsed.environmentName === "string" &&
      parsed.environmentName.trim()
        ? parsed.environmentName
        : null,
  };
}
