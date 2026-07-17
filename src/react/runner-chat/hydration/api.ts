import type { RunnerDeepResearchSession, RunnerLog, RunnerThreadStep } from "../../../types.js";
import { buildRunnerHeaders, sanitizeBackendUrl } from "../api-utils.js";
import {
  fetchAllThreadMessages,
  mergeConversationMessageRunMetadataFromLogs,
  sortRunnerConversationMessagesChronologically,
  sortRunnerLogsChronologically,
  type RunnerConversationMessage,
} from "../conversation-messages.js";
import { parseDurationSecondsValue, parseIsoTimestampMs } from "../time-utils.js";
import {
  buildFailedThreadFallbackLogs,
  resolveHydratedThreadLifecycleStatus,
} from "./lifecycle-status.js";
import { normalizeHydratedLog } from "./log-normalization.js";
import {
  fetchHydratedStepDiffEntries,
  mergeThreadDiffsIntoLogs,
  mergeThreadStepsIntoLogs,
  parseThreadSteps,
} from "./step-diffs.js";
import type { RunnerThreadDiffEntry, RunnerThreadHydrationPayload } from "./types.js";

export interface RunnerThreadLogsSnapshot {
  logs: RunnerLog[];
  status: string | null;
  durationSeconds: number | null;
  agentName: string | null;
  environmentName: string | null;
}

export interface RunnerThreadStatusSnapshot {
  threadId: string;
  status: string | null;
  updatedAt: string | null;
  completedAt: string | null;
}

export async function fetchThreadHydrationPayload(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
  messagesPromise?: Promise<RunnerConversationMessage[]>;
}): Promise<RunnerThreadHydrationPayload> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  const messagesPromise =
    params.messagesPromise ||
    fetchAllThreadMessages({
      backendUrl,
      apiKey: params.apiKey,
      threadId: params.threadId,
      requestHeaders: params.requestHeaders,
    }).catch(() => []);

  const [threadResponse, logsResponse, stepsResponse, messages] = await Promise.all([
    fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
    fetch(
      `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/logs?compact=1&includeConversation=0`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    ),
    fetch(
      `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/steps?limit=500&compact=1`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    ).catch(() => null),
    messagesPromise,
  ]);

  const [threadBody, logsBody, stepsBody] = await Promise.all([
    threadResponse.text(),
    logsResponse.text(),
    stepsResponse ? stepsResponse.text() : Promise.resolve(""),
  ]);
  let parsedThread: {
    thread?: {
      id?: string | null;
      title?: string | null;
      status?: string | null;
      task?: string | null;
      environmentId?: string | null;
      duration?: string | number | null;
      startedAt?: string | null;
      completedAt?: string | null;
      updatedAt?: string | null;
      lastMessagePreview?: string | null;
      metadata?: Record<string, unknown> | null;
      agentName?: string | null;
      environmentName?: string | null;
    };
    message?: string;
    error?: string;
  } = {};
  let parsedLogs: {
    logs?: RunnerLog[];
    status?: string | null;
    updatedAt?: string | null;
    duration?: string | number | null;
    agentName?: string | null;
    environmentName?: string | null;
    message?: string;
    error?: string;
  } = {};
  let parsedSteps: { data?: RunnerThreadStep[]; message?: string; error?: string } = {};
  try {
    parsedThread = threadBody ? JSON.parse(threadBody) : {};
  } catch {
    parsedThread = {};
  }
  try {
    parsedLogs = logsBody ? JSON.parse(logsBody) : {};
  } catch {
    parsedLogs = {};
  }
  if (stepsResponse?.ok) {
    try {
      parsedSteps = stepsBody ? JSON.parse(stepsBody) : {};
    } catch {
      parsedSteps = {};
    }
  }

  if (!threadResponse.ok) {
    throw new Error(
      parsedThread.message ||
        parsedThread.error ||
        `Failed to load thread (${threadResponse.status})`,
    );
  }
  if (!logsResponse.ok) {
    throw new Error(
      parsedLogs.message ||
        parsedLogs.error ||
        `Failed to load thread logs (${logsResponse.status})`,
    );
  }

  const startedAtMs = parseIsoTimestampMs(parsedThread.thread?.startedAt);
  const completedAtMs = parseIsoTimestampMs(parsedThread.thread?.completedAt);
  const steps = parseThreadSteps(parsedSteps.data);
  let diffEntries: RunnerThreadDiffEntry[] = [];
  const rawThreadStatus =
    typeof parsedLogs.status === "string" && parsedLogs.status.trim()
      ? parsedLogs.status.trim()
      : typeof parsedThread.thread?.status === "string" &&
          parsedThread.thread.status.trim()
        ? parsedThread.thread.status.trim()
        : null;
  const parsedRunnerLogs = Array.isArray(parsedLogs.logs)
    ? parsedLogs.logs.map(normalizeHydratedLog)
    : [];
  const chronologicalLogs = sortRunnerLogsChronologically(
    buildFailedThreadFallbackLogs({
      logs: parsedRunnerLogs,
      threadStatus: rawThreadStatus,
      title: parsedThread.thread?.title,
      task: parsedThread.thread?.task,
      lastMessagePreview: parsedThread.thread?.lastMessagePreview,
      updatedAt: parsedThread.thread?.updatedAt ?? parsedLogs.updatedAt,
      completedAt: parsedThread.thread?.completedAt,
      metadata: parsedThread.thread?.metadata ?? null,
    }).map(normalizeHydratedLog),
  );
  const chronologicalMessages = mergeConversationMessageRunMetadataFromLogs(
    sortRunnerConversationMessagesChronologically(messages),
    chronologicalLogs,
  );
  const hasCanonicalConversation = chronologicalMessages.some(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  );
  const hydrationLogs = chronologicalLogs.filter((log) => {
    if (!hasCanonicalConversation) {
      return true;
    }
    if (
      log.eventType === "user_message" ||
      (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage
    ) {
      return false;
    }
    return log.eventType !== "agent_message" && log.eventType !== "llm_response";
  });

  const shouldHydrateStepDiffs =
    hydrationLogs.some((log) => log.eventType === "file_change") ||
    steps.some((step) => {
      const metadata = step.metadata || {};
      return (
        String(step.stepKind || "").toLowerCase() === "file_change" ||
        String(step.eventType || "").toLowerCase() === "file_change" ||
        Boolean(metadata.diffs && typeof metadata.diffs === "object")
      );
    });
  if (shouldHydrateStepDiffs && steps.length > 0) {
    diffEntries = await fetchHydratedStepDiffEntries({
      backendUrl,
      threadId: params.threadId,
      headers,
      steps,
    });
  }
  const logs = mergeThreadStepsIntoLogs(
    mergeThreadDiffsIntoLogs(hydrationLogs, diffEntries),
    steps,
    diffEntries,
    startedAtMs,
  );

  return {
    threadId:
      typeof parsedThread.thread?.id === "string" && parsedThread.thread.id.trim()
        ? parsedThread.thread.id
        : params.threadId,
    threadStatus: resolveHydratedThreadLifecycleStatus(rawThreadStatus, completedAtMs),
    threadUpdatedAt:
      typeof parsedLogs.updatedAt === "string" && parsedLogs.updatedAt.trim()
        ? parsedLogs.updatedAt
        : null,
    threadEnvironmentId:
      typeof parsedThread.thread?.environmentId === "string" &&
      parsedThread.thread.environmentId.trim()
        ? parsedThread.thread.environmentId
        : null,
    threadEnvironmentName:
      parsedLogs.environmentName ?? parsedThread.thread?.environmentName ?? null,
    threadMetadata: parsedThread.thread?.metadata ?? null,
    initialPrompt:
      typeof parsedThread.thread?.task === "string" ? parsedThread.thread.task : "",
    logs,
    messages: chronologicalMessages,
    durationSeconds: parseDurationSecondsValue(
      parsedLogs.duration ?? parsedThread.thread?.duration,
    ),
    startedAtMs,
    completedAtMs,
    agentName: parsedLogs.agentName ?? parsedThread.thread?.agentName ?? null,
    environmentName:
      parsedLogs.environmentName ?? parsedThread.thread?.environmentName ?? null,
  };
}

export async function fetchThreadLogsSnapshot(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerThreadLogsSnapshot> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/logs?compact=1&includeConversation=0`,
    {
      method: "GET",
      headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
      cache: "no-store",
    },
  );
  const bodyText = await response.text();
  let parsed: {
    logs?: RunnerLog[];
    status?: string | null;
    duration?: string | number | null;
    agentName?: string | null;
    environmentName?: string | null;
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to load thread logs (${response.status})`,
    );
  }
  const status =
    typeof parsed.status === "string" && parsed.status.trim()
      ? parsed.status.trim()
      : null;
  return {
    logs: buildFailedThreadFallbackLogs({
      logs: Array.isArray(parsed.logs) ? parsed.logs.map(normalizeHydratedLog) : [],
      threadStatus: status,
    }),
    status,
    durationSeconds: parseDurationSecondsValue(parsed.duration),
    agentName: parsed.agentName ?? null,
    environmentName: parsed.environmentName ?? null,
  };
}

export async function fetchThreadStatusSnapshot(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerThreadStatusSnapshot> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/status`,
    {
      method: "GET",
      headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
      cache: "no-store",
    },
  );
  const bodyText = await response.text();
  let parsed: {
    threadId?: string;
    id?: string;
    status?: string | null;
    updatedAt?: string | null;
    completedAt?: string | null;
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to load thread status (${response.status})`,
    );
  }
  const completedAt =
    typeof parsed.completedAt === "string" && parsed.completedAt.trim()
      ? parsed.completedAt
      : null;
  return {
    threadId:
      typeof parsed.threadId === "string" && parsed.threadId.trim()
        ? parsed.threadId
        : typeof parsed.id === "string" && parsed.id.trim()
          ? parsed.id
          : params.threadId,
    status: resolveHydratedThreadLifecycleStatus(
      typeof parsed.status === "string" && parsed.status.trim()
        ? parsed.status.trim()
        : null,
      parseIsoTimestampMs(completedAt),
    ),
    updatedAt:
      typeof parsed.updatedAt === "string" && parsed.updatedAt.trim()
        ? parsed.updatedAt
        : null,
    completedAt,
  };
}

export function normalizeRunnerDeepResearchSession(
  value: unknown,
): RunnerDeepResearchSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const session = value as Record<string, unknown>;
  const metadata =
    session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
      ? (session.metadata as Record<string, unknown>)
      : null;
  const sources = Array.isArray(metadata?.sources)
    ? metadata.sources.filter(
        (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
  return {
    id: typeof session.id === "string" ? session.id : "",
    threadId: typeof session.threadId === "string" ? session.threadId : "",
    userId: typeof session.userId === "string" ? session.userId : "",
    interactionId:
      typeof session.interactionId === "string" ? session.interactionId : null,
    topic: typeof session.topic === "string" ? session.topic : "",
    status: typeof session.status === "string" ? session.status : "starting",
    createdAt: typeof session.createdAt === "string" ? session.createdAt : "",
    startedAt: typeof session.startedAt === "string" ? session.startedAt : null,
    completedAt:
      typeof session.completedAt === "string" ? session.completedAt : null,
    elapsedSeconds:
      typeof session.elapsedSeconds === "number" ? session.elapsedSeconds : null,
    thinkingSummaries: Array.isArray(session.thinkingSummaries)
      ? session.thinkingSummaries
          .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const summary = entry as Record<string, unknown>;
            const text = typeof summary.summary === "string" ? summary.summary : "";
            if (!text.trim()) return null;
            return {
              timestamp:
                typeof summary.timestamp === "string" ? summary.timestamp : "",
              phase: typeof summary.phase === "string" ? summary.phase : "Thinking",
              summary: text,
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      : [],
    reportPath: typeof session.reportPath === "string" ? session.reportPath : null,
    reportLength:
      typeof session.reportLength === "number" ? session.reportLength : null,
    sourcesCount:
      typeof session.sourcesCount === "number" ? session.sourcesCount : null,
    reportManifestPath:
      typeof metadata?.reportManifestPath === "string" &&
      metadata.reportManifestPath.trim()
        ? metadata.reportManifestPath.trim()
        : null,
    sources,
    errorMessage:
      typeof session.errorMessage === "string" ? session.errorMessage : null,
    metadata,
  };
}

export async function fetchThreadResearchSessions(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerDeepResearchSession[]> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/research`,
    {
      method: "GET",
      headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
      cache: "no-store",
    },
  );
  const bodyText = await response.text();
  let parsed: { data?: unknown[]; message?: string; error?: string } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to load deep research sessions (${response.status})`,
    );
  }
  return Array.isArray(parsed.data)
    ? parsed.data
        .map(normalizeRunnerDeepResearchSession)
        .filter((entry): entry is RunnerDeepResearchSession => Boolean(entry?.id))
    : [];
}
