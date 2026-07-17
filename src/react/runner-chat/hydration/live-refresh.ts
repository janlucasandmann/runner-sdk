import type { RunnerLog } from "../../../types.js";
import {
  fetchAllThreadMessages,
  mergeConversationMessageRunMetadataFromLogs,
  sortRunnerConversationMessagesChronologically,
  sortRunnerLogsChronologically,
} from "../conversation-messages.js";
import { parseIsoTimestampMs } from "../time-utils.js";
import type { RunnerTurn } from "../turn-types.js";
import { fetchThreadLogsSnapshot } from "./api.js";
import { resolveHydratedThreadLifecycleStatus } from "./lifecycle-status.js";
import { normalizeHydratedLog } from "./log-normalization.js";
import { turnPresentation } from "./turn-state.js";
import type { RunnerThreadHydrationPayload } from "./types.js";

export function resolveHydrationInitialPrompt(
  turns: RunnerTurn[],
  cachedPayload?: RunnerThreadHydrationPayload | null,
): string {
  const cachedPrompt =
    typeof cachedPayload?.initialPrompt === "string"
      ? cachedPayload.initialPrompt.trim()
      : "";
  if (cachedPrompt) {
    return cachedPrompt;
  }
  const firstPromptTurn = turns.find(
    (turn) =>
      String(turn.prompt || "").trim() &&
      turnPresentation(turn) !== "context-action-notice",
  );
  return typeof firstPromptTurn?.prompt === "string"
    ? firstPromptTurn.prompt.trim()
    : "";
}

export async function fetchThreadLiveRefreshPayload(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
  statusSnapshot: {
    status: string | null;
    updatedAt: string | null;
    completedAt: string | null;
  };
  existingTurns: RunnerTurn[];
  cachedPayload?: RunnerThreadHydrationPayload | null;
}): Promise<RunnerThreadHydrationPayload> {
  const logsSnapshot = await fetchThreadLogsSnapshot({
    backendUrl: params.backendUrl,
    apiKey: params.apiKey,
    threadId: params.threadId,
    requestHeaders: params.requestHeaders,
  });
  const cachedPayload = params.cachedPayload || null;
  const rawMessages = sortRunnerConversationMessagesChronologically(
    Array.isArray(cachedPayload?.messages) && cachedPayload.messages.length > 0
      ? cachedPayload.messages
      : await fetchAllThreadMessages({
          backendUrl: params.backendUrl,
          apiKey: params.apiKey,
          threadId: params.threadId,
          requestHeaders: params.requestHeaders,
        }).catch(() => []),
  );
  const logs = sortRunnerLogsChronologically(
    logsSnapshot.logs.map(normalizeHydratedLog),
  );
  const messages = mergeConversationMessageRunMetadataFromLogs(rawMessages, logs);
  const hasCanonicalMessages = messages.some(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  );
  const hydrationLogs = logs.filter((log) => {
    if (!hasCanonicalMessages) {
      return (
        log.eventType !== "user_message" &&
        log.eventType !== "agent_message" &&
        log.eventType !== "llm_response"
      );
    }
    if (
      log.eventType === "user_message" ||
      (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage
    ) {
      return false;
    }
    return log.eventType !== "agent_message" && log.eventType !== "llm_response";
  });

  const completedAtMs =
    parseIsoTimestampMs(params.statusSnapshot.completedAt) ??
    cachedPayload?.completedAtMs ??
    null;
  const rawThreadStatus =
    logsSnapshot.status ??
    params.statusSnapshot.status ??
    cachedPayload?.threadStatus ??
    null;
  return {
    threadId: params.threadId,
    threadStatus: resolveHydratedThreadLifecycleStatus(
      rawThreadStatus,
      completedAtMs,
    ),
    threadUpdatedAt:
      params.statusSnapshot.updatedAt ?? cachedPayload?.threadUpdatedAt ?? null,
    threadEnvironmentId: cachedPayload?.threadEnvironmentId ?? null,
    threadEnvironmentName:
      logsSnapshot.environmentName ??
      cachedPayload?.threadEnvironmentName ??
      cachedPayload?.environmentName ??
      null,
    initialPrompt: resolveHydrationInitialPrompt(
      params.existingTurns,
      cachedPayload,
    ),
    logs: hydrationLogs,
    messages,
    durationSeconds:
      logsSnapshot.durationSeconds ?? cachedPayload?.durationSeconds ?? null,
    startedAtMs: cachedPayload?.startedAtMs ?? null,
    completedAtMs,
    agentName: logsSnapshot.agentName ?? cachedPayload?.agentName ?? null,
    environmentName:
      logsSnapshot.environmentName ??
      cachedPayload?.environmentName ??
      cachedPayload?.threadEnvironmentName ??
      null,
  };
}
