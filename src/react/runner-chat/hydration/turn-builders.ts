import type { RunnerLog } from "../../../types.js";
import { stripRunnerSystemTags as stripSystemTags } from "../../runner-markdown.js";
import {
  extractRunnerVisibleContentFromHiddenExecutionPrompt,
  isRunnerInternalHiddenExecutionPromptContent,
} from "../agent-options.js";
import {
  dedupeRunnerConversationMessages,
  sortRunnerConversationMessagesChronologically,
  sortRunnerLogsChronologically,
  type RunnerConversationMessage,
} from "../conversation-messages.js";
import { normalizeRunnerTurnMessageMetadata } from "../email-presentation.js";
import { generateRunnerClientId } from "../id-utils.js";
import { parseIsoTimestampMs, parseSecondsFromClock } from "../time-utils.js";
import { isThreadContextCommandPrompt } from "../thread-context-utils.js";
import { normalizeTurnAttachments } from "../turn-attachments.js";
import type { RunnerTurn } from "../turn-types.js";
import {
  isTerminalThreadLifecycleStatus,
  terminalTurnStatusFromThreadStatus,
} from "./lifecycle-status.js";
import {
  dedupeAdjacentRunnerLogs,
  normalizeHydratedLog,
} from "./log-normalization.js";
import {
  attachHydratedMessageIdsToTurns,
  buildHydratedTurnsFromMessages,
} from "./message-turns.js";
import {
  mergeHydratedMessageTurnsIntoTurns,
  mergeHydratedTimelineLogsIntoMessageTurns,
} from "./turn-merge.js";
import {
  applyHydratedRunningThreadState,
  isActiveTurnStatus,
  isTurnResponseLog,
} from "./turn-state.js";
import type { RunnerThreadHydrationPayload } from "./types.js";

export function buildHydratedTurnsFromPayload(
  payload: RunnerThreadHydrationPayload,
  fallbackMeta?: {
    agentName?: string | null;
    environmentName?: string | null;
    backendUrl?: string;
  },
): RunnerTurn[] {
  const messages = sortRunnerConversationMessagesChronologically(
    dedupeRunnerConversationMessages(payload.messages),
  );
  const logs = sortRunnerLogsChronologically(payload.logs.map(normalizeHydratedLog));
  const hasCanonicalMessages = messages.some(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  );
  const messageMeta = {
    agentName: payload.agentName ?? fallbackMeta?.agentName ?? null,
    environmentName:
      payload.environmentName ?? fallbackMeta?.environmentName ?? null,
    backendUrl: fallbackMeta?.backendUrl,
    threadStatus: payload.threadStatus,
    completedAtMs: payload.completedAtMs,
    threadMetadata: payload.threadMetadata,
  };

  if (hasCanonicalMessages) {
    const messageTurns = buildHydratedTurnsFromMessages(messages, messageMeta);
    if (messageTurns.length > 0) {
      const merged = mergeHydratedTimelineLogsIntoMessageTurns(messageTurns, logs, {
        startedAtMs: payload.startedAtMs,
      });
      if (merged) {
        return applyHydratedRunningThreadState(merged, {
          threadStatus: payload.threadStatus,
          completedAtMs: payload.completedAtMs,
        });
      }
    }
  }

  const turnsFromLogs = buildHydratedTurnsFromLogs(
    logs,
    payload.initialPrompt,
    messages,
    {
      durationSeconds: payload.durationSeconds,
      startedAtMs: payload.startedAtMs,
      completedAtMs: payload.completedAtMs,
      threadStatus: payload.threadStatus,
      agentName: payload.agentName,
      environmentName: payload.environmentName,
      backendUrl: fallbackMeta?.backendUrl,
      threadMetadata: payload.threadMetadata,
    },
  );
  const merged = mergeHydratedMessageTurnsIntoTurns(
    turnsFromLogs,
    messages,
    messageMeta,
  );
  const hasHydratedConversationTurns = merged.some(
    (turn) => turn.prompt.trim() || turn.logs.some(isTurnResponseLog),
  );
  return hasCanonicalMessages && !hasHydratedConversationTurns
    ? buildHydratedTurnsFromMessages(messages, messageMeta)
    : merged;
}

export function buildHydratedTurnsFromLogs(
  logs: RunnerLog[],
  initialPrompt: string,
  messages: RunnerConversationMessage[],
  meta?: {
    durationSeconds?: number | null;
    startedAtMs?: number | null;
    completedAtMs?: number | null;
    threadStatus?: string | null;
    agentName?: string | null;
    environmentName?: string | null;
    backendUrl?: string;
    threadMetadata?: Record<string, unknown> | null;
  },
): RunnerTurn[] {
  const turns: RunnerTurn[] = [];
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(
    dedupeRunnerConversationMessages(messages),
  );
  const dedupedLogs = dedupeAdjacentRunnerLogs(
    sortRunnerLogsChronologically(logs.map(normalizeHydratedLog)),
  );
  let pendingBtwTurn: RunnerTurn | null = null;
  let currentTurn: RunnerTurn | null = initialPrompt.trim()
    ? {
        id: generateRunnerClientId("turn"),
        prompt: initialPrompt.trim(),
        messageMetadata: normalizeRunnerTurnMessageMetadata(
          null,
          meta?.threadMetadata,
        ),
        logs: [],
        startedAtMs: meta?.startedAtMs ?? Date.now(),
        completedAtMs: meta?.completedAtMs ?? meta?.startedAtMs ?? Date.now(),
        durationSeconds: meta?.durationSeconds ?? null,
        status: "completed",
        animateOnRender: false,
        isInitialTurn: true,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
      }
    : null;

  const ensureCurrentTurn = (index: number): RunnerTurn => {
    if (currentTurn) {
      return currentTurn;
    }
    const timestampMs = Date.now() + index;
    currentTurn = {
      id: generateRunnerClientId("turn"),
      prompt: "",
      messageMetadata: null,
      logs: [],
      startedAtMs: timestampMs,
      completedAtMs: timestampMs,
      status: "completed",
      animateOnRender: false,
      agentName: meta?.agentName ?? null,
      environmentName: meta?.environmentName ?? null,
    };
    return currentTurn;
  };
  const commit = (key: "current" | "btw"): void => {
    const turn = key === "current" ? currentTurn : pendingBtwTurn;
    if (turn && (turn.prompt.trim() || turn.logs.length > 0)) {
      turns.push(turn);
    }
    if (key === "current") {
      currentTurn = null;
    } else {
      pendingBtwTurn = null;
    }
  };
  const safeTimestamp = (log: RunnerLog, index: number): number => {
    const absolute = parseIsoTimestampMs(log.time);
    if (absolute !== null) {
      return absolute;
    }
    const relative = log.time ? parseSecondsFromClock(log.time) : null;
    return relative !== null && meta?.startedAtMs != null
      ? meta.startedAtMs + relative * 1000
      : Date.now() + index;
  };

  dedupedLogs.forEach((log, index) => {
    if (
      log.eventType === "user_message" ||
      (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage
    ) {
      const rawPrompt = stripSystemTags(log.message || "");
      const prompt = extractRunnerVisibleContentFromHiddenExecutionPrompt(rawPrompt);
      if (isRunnerInternalHiddenExecutionPromptContent(rawPrompt) && !prompt) {
        return;
      }
      const startedAtMs = safeTimestamp(log, index);
      const baseTurn: RunnerTurn = {
        id: generateRunnerClientId("turn"),
        prompt,
        messageMetadata: normalizeRunnerTurnMessageMetadata(
          log.metadata,
          meta?.threadMetadata,
        ),
        logs: [],
        startedAtMs,
        completedAtMs: startedAtMs,
        status: /^\/btw\b/i.test(prompt.trim()) ? "running" : "completed",
        animateOnRender: false,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
        presentation: /^\/btw\b/i.test(prompt.trim()) ? "btw" : "default",
        attachments: normalizeTurnAttachments(
          (log.metadata as Record<string, unknown> | undefined)?.attachments,
          meta?.backendUrl,
        ),
      };
      if (baseTurn.presentation === "btw") {
        commit("btw");
        pendingBtwTurn = baseTurn;
      } else {
        commit("btw");
        commit("current");
        currentTurn = baseTurn;
      }
      return;
    }

    if (isTurnResponseLog(log) && pendingBtwTurn) {
      pendingBtwTurn.logs.push(log);
      pendingBtwTurn.completedAtMs = safeTimestamp(log, index);
      pendingBtwTurn.status = log.type === "error" ? "failed" : "completed";
      commit("btw");
      return;
    }

    const actionType = log.metadata?.actionType;
    if (
      log.eventType === "action_summary" &&
      (actionType === "compact" ||
        actionType === "clear" ||
        actionType === "fork" ||
        actionType === "revert" ||
        actionType === "reapply")
    ) {
      let commandPrompt = "";
      if (
        currentTurn?.prompt.trim() &&
        currentTurn.logs.length === 0 &&
        isThreadContextCommandPrompt(currentTurn.prompt, actionType)
      ) {
        commandPrompt = currentTurn.prompt;
        currentTurn = null;
      } else {
        commit("current");
      }
      const timestampMs = parseIsoTimestampMs(log.time) ?? Date.now() + index;
      turns.push({
        id: generateRunnerClientId("turn"),
        prompt: commandPrompt,
        logs: [log],
        startedAtMs: timestampMs,
        completedAtMs: timestampMs,
        status: "completed",
        animateOnRender: false,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
        presentation: "context-action-notice",
      });
      currentTurn = null;
      return;
    }

    const turn = ensureCurrentTurn(index);
    turn.logs.push(log);
    if (log.eventType === "turn_completed") {
      const durationMs =
        typeof log.metadata?.durationMs === "number" ? log.metadata.durationMs : null;
      if (durationMs !== null && durationMs >= 0) {
        turn.durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        turn.completedAtMs = turn.startedAtMs + durationMs;
      }
      if (log.type === "error") {
        turn.status = "failed";
      } else if (isActiveTurnStatus(turn.status)) {
        turn.status = "completed";
      }
      return;
    }
    if (log.eventType === "permission_request") {
      const permissionStatus = String(
        log.metadata?.status || log.metadata?.decision || "",
      )
        .trim()
        .toLowerCase();
      if (!permissionStatus || permissionStatus === "pending") {
        turn.status = "permission_asked";
        turn.completedAtMs = undefined;
      } else if (turn.status === "permission_asked") {
        if (
          isTerminalThreadLifecycleStatus(meta?.threadStatus) ||
          meta?.completedAtMs != null
        ) {
          turn.status = terminalTurnStatusFromThreadStatus(meta?.threadStatus);
          turn.completedAtMs = meta?.completedAtMs ?? safeTimestamp(log, index);
        } else {
          turn.status = "running";
        }
      }
      return;
    }
    if (isTurnResponseLog(log)) {
      const legacyDurationMs = (
        log.metadata as { duration_ms?: unknown } | undefined
      )?.duration_ms;
      const durationMs =
        typeof log.metadata?.durationMs === "number"
          ? log.metadata.durationMs
          : typeof legacyDurationMs === "number"
            ? legacyDurationMs
            : null;
      if (durationMs !== null && durationMs >= 0) {
        turn.durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        turn.completedAtMs = turn.startedAtMs + durationMs;
      }
      turn.status = log.type === "error" ? "failed" : "completed";
      return;
    }
    if (log.type === "error") {
      turn.status = "failed";
    }
  });

  commit("btw");
  commit("current");
  const sortedTurns = [...turns].sort(
    (left, right) =>
      left.startedAtMs - right.startedAtMs || left.id.localeCompare(right.id),
  );
  sortedTurns.forEach((turn, index) => {
    turn.agentName ||= meta?.agentName ?? null;
    turn.environmentName ||= meta?.environmentName ?? null;
    if (index === 0) {
      turn.isInitialTurn = true;
      if (meta?.durationSeconds != null) turn.durationSeconds = meta.durationSeconds;
      if (meta?.startedAtMs != null) turn.startedAtMs = meta.startedAtMs;
      if (meta?.completedAtMs != null) turn.completedAtMs = meta.completedAtMs;
    }
  });
  return applyHydratedRunningThreadState(
    attachHydratedMessageIdsToTurns(
      sortedTurns,
      chronologicalMessages,
      meta?.backendUrl,
      meta?.threadMetadata,
    ),
    meta,
  );
}
