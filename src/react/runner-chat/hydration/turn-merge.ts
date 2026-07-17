import type { RunnerLog } from "../../../types.js";
import {
  isBrowserSkillCommand,
  isComputerUseMcpLog,
} from "../../../platform-ui/components/thread-components/log-boxes/index.js";
import { stripRunnerSystemTags as stripSystemTags } from "../../runner-markdown.js";
import {
  getRunnerLogAbsoluteTimestampMs,
  sortRunnerLogsChronologically,
  type RunnerConversationMessage,
} from "../conversation-messages.js";
import { parseSecondsFromClock } from "../time-utils.js";
import { pickTurnAttachments } from "../turn-attachments.js";
import type { RunnerTurn } from "../turn-types.js";
import {
  dedupeAdjacentRunnerLogs,
  normalizeHydratedLog,
  shouldDisplayTimelineLog,
} from "./log-normalization.js";
import {
  buildHydratedTurnsFromMessages,
  type RunnerHydratedMessageTurnMeta,
} from "./message-turns.js";
import {
  getTurnAssistantMessageText,
  getTurnLatestProgressTimestampMs,
  isActiveTurnStatus,
  isTerminalTurnStatus,
  isTurnResponseLog,
  turnHasVisibleExecutionProgress,
  turnPresentation,
} from "./turn-state.js";

function normalizeTurnPrompt(prompt: string): string {
  return stripSystemTags(prompt || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function runnerLogHasMetronomeWorkflowPromptReplacement(log: RunnerLog): boolean {
  if (log.eventType !== "metronome_workflow" && !log.metadata?.metronomeWorkflow) {
    return false;
  }
  const workflow =
    log.metadata?.metronomeWorkflow &&
    typeof log.metadata.metronomeWorkflow === "object"
      ? (log.metadata.metronomeWorkflow as Record<string, unknown>)
      : null;
  if (!workflow) {
    return false;
  }
  if (workflow.displayAsPrompt === true) {
    return true;
  }
  const status = String(workflow.status || log.metadata?.status || "")
    .trim()
    .toLowerCase();
  return (
    status === "running" &&
    !String(workflow.triggerCommand || "").trim() &&
    !String(workflow.triggerEventId || "").trim() &&
    !String(workflow.definitionSource || "").trim()
  );
}

export function turnsLikelyMatch(
  localTurn: RunnerTurn,
  hydratedTurn: RunnerTurn,
): boolean {
  const localPresentation = turnPresentation(localTurn);
  const hydratedPresentation = turnPresentation(hydratedTurn);
  const localPrompt = normalizeTurnPrompt(localTurn.prompt);
  const hydratedPrompt = normalizeTurnPrompt(hydratedTurn.prompt);
  const localAssistantText = normalizeTurnPrompt(
    getTurnAssistantMessageText(localTurn),
  );
  const hydratedAssistantText = normalizeTurnPrompt(
    getTurnAssistantMessageText(hydratedTurn),
  );
  const localTimelineCount = localTurn.logs.filter(shouldDisplayTimelineLog).length;
  const hydratedTimelineCount =
    hydratedTurn.logs.filter(shouldDisplayTimelineLog).length;
  const localSourceMessageId =
    typeof localTurn.sourceMessageId === "string" && localTurn.sourceMessageId.trim()
      ? localTurn.sourceMessageId.trim()
      : "";
  const hydratedSourceMessageId =
    typeof hydratedTurn.sourceMessageId === "string" &&
    hydratedTurn.sourceMessageId.trim()
      ? hydratedTurn.sourceMessageId.trim()
      : "";

  if (localPresentation === "btw" || hydratedPresentation === "btw") {
    if (localPresentation !== "btw" || hydratedPresentation !== "btw") {
      return false;
    }
    if (localPrompt && hydratedPrompt && localPrompt === hydratedPrompt) {
      return true;
    }
    const localText = getTurnAssistantMessageText(localTurn);
    const hydratedText = getTurnAssistantMessageText(hydratedTurn);
    return Boolean(
      localText &&
        hydratedText &&
        (localText === hydratedText ||
          localText.startsWith(hydratedText) ||
          hydratedText.startsWith(localText)),
    );
  }

  if (localTurn.status === "queued" && localPrompt && hydratedPrompt) {
    return localPrompt === hydratedPrompt;
  }
  if (
    localPresentation === "context-action-notice" ||
    hydratedPresentation === "context-action-notice"
  ) {
    const localActionType = localTurn.logs.find(
      (log) => log.eventType === "action_summary",
    )?.metadata?.actionType;
    const hydratedActionType = hydratedTurn.logs.find(
      (log) => log.eventType === "action_summary",
    )?.metadata?.actionType;
    return Boolean(
      localActionType &&
        hydratedActionType &&
        localActionType === hydratedActionType,
    );
  }
  if (
    localSourceMessageId &&
    hydratedSourceMessageId &&
    localSourceMessageId === hydratedSourceMessageId
  ) {
    return true;
  }
  if (localPrompt && hydratedPrompt && localPrompt === hydratedPrompt) {
    const localText = getTurnAssistantMessageText(localTurn);
    const hydratedText = getTurnAssistantMessageText(hydratedTurn);
    return (
      !localText ||
      !hydratedText ||
      localText === hydratedText ||
      localText.startsWith(hydratedText) ||
      hydratedText.startsWith(localText)
    );
  }

  const oneSideMissingPrompt =
    (!localPrompt && hydratedPrompt) || (localPrompt && !hydratedPrompt);
  if (
    oneSideMissingPrompt &&
    Math.abs((localTurn.startedAtMs || 0) - (hydratedTurn.startedAtMs || 0)) <=
      60_000
  ) {
    if (
      localAssistantText &&
      hydratedAssistantText &&
      (localAssistantText === hydratedAssistantText ||
        localAssistantText.startsWith(hydratedAssistantText) ||
        hydratedAssistantText.startsWith(localAssistantText))
    ) {
      return true;
    }
    const localHasPrompt = localPrompt.length > 0;
    const hydratedHasPrompt = hydratedPrompt.length > 0;
    const localHasTimeline = localTimelineCount > 0;
    const hydratedHasTimeline = hydratedTimelineCount > 0;
    if (
      (localHasPrompt && !localHasTimeline && hydratedHasTimeline) ||
      (hydratedHasPrompt && !hydratedHasTimeline && localHasTimeline) ||
      (localHasPrompt && hydratedHasTimeline) ||
      (hydratedHasPrompt && localHasTimeline)
    ) {
      return true;
    }
  }

  if (!localPrompt && !hydratedPrompt) {
    const oneSideIsTimelineHeavy =
      (localTimelineCount > 0 &&
        hydratedTimelineCount === 0 &&
        hydratedAssistantText.length > 0) ||
      (hydratedTimelineCount > 0 &&
        localTimelineCount === 0 &&
        localAssistantText.length > 0);
    if (
      oneSideIsTimelineHeavy &&
      Math.abs((localTurn.startedAtMs || 0) - (hydratedTurn.startedAtMs || 0)) <=
        60_000
    ) {
      return true;
    }
  }
  return false;
}

function stringifyLogField(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function hasVisualBrowserScreenshot(log: RunnerLog): boolean {
  if (log.eventType === "command_execution") {
    const command = String(log.metadata?.command || log.message || "");
    if (!isBrowserSkillCommand(command)) {
      return false;
    }
    const output = `${String(log.metadata?.output || "")}\n${String(log.message || "")}`;
    return (
      /BROWSER_SKILL_RESULT::/.test(output) &&
      /screenshotPaths?|browser-skill\/[^\s"'<>]+\.(?:png|jpe?g|webp)/i.test(output)
    );
  }
  if (isComputerUseMcpLog(log)) {
    const resultText = stringifyLogField(log.metadata?.result || log.message);
    return (
      /COMPUTER_USE_RESULT::/.test(resultText) &&
      /screenshotPaths?|tmp\/computer-use\/[^\s"'<>]+\.(?:png|jpe?g|webp)/i.test(
        resultText,
      )
    );
  }
  return false;
}

function isFallbackAssistantResponseText(value: string): boolean {
  return (
    String(value || "").replace(/\s+/g, " ").trim().toLowerCase() ===
    "[task executed - no detailed response captured]"
  );
}

function shouldPreserveLocalTurnProgress(
  localTurn: RunnerTurn,
  hydratedTurn: RunnerTurn,
): boolean {
  const localAssistantText = getTurnAssistantMessageText(localTurn);
  const hydratedAssistantText = getTurnAssistantMessageText(hydratedTurn);
  if (
    localAssistantText.trim() &&
    !isFallbackAssistantResponseText(localAssistantText) &&
    isFallbackAssistantResponseText(hydratedAssistantText)
  ) {
    return true;
  }
  const localScreenshotCount = localTurn.logs.filter(hasVisualBrowserScreenshot).length;
  const hydratedScreenshotCount =
    hydratedTurn.logs.filter(hasVisualBrowserScreenshot).length;
  if (localScreenshotCount > hydratedScreenshotCount) {
    return true;
  }

  const localTerminal = isTerminalTurnStatus(localTurn.status);
  const hydratedTerminal = isTerminalTurnStatus(hydratedTurn.status);
  if (localTerminal !== hydratedTerminal) {
    if (!localTerminal) return false;
    if (!turnHasVisibleExecutionProgress(localTurn)) return false;
    return !turnHasVisibleExecutionProgress(hydratedTurn);
  }
  if (localTurn.logs.length !== hydratedTurn.logs.length) {
    return localTurn.logs.length > hydratedTurn.logs.length;
  }
  if (localAssistantText.length !== hydratedAssistantText.length) {
    return localAssistantText.length > hydratedAssistantText.length;
  }
  const localLastMessageLength = String(
    localTurn.logs[localTurn.logs.length - 1]?.message || "",
  ).length;
  const hydratedLastMessageLength = String(
    hydratedTurn.logs[hydratedTurn.logs.length - 1]?.message || "",
  ).length;
  if (localLastMessageLength !== hydratedLastMessageLength) {
    return localLastMessageLength > hydratedLastMessageLength;
  }
  return (
    getTurnLatestProgressTimestampMs(localTurn) >
    getTurnLatestProgressTimestampMs(hydratedTurn)
  );
}

function replaceTurnResponseLogs(
  logs: RunnerLog[],
  nextResponseLogs: RunnerLog[],
): RunnerLog[] {
  if (nextResponseLogs.length === 0) {
    return logs;
  }
  const nextLogs: RunnerLog[] = [];
  let inserted = false;
  for (const log of logs) {
    if (isTurnResponseLog(log)) {
      if (!inserted) {
        nextLogs.push(...nextResponseLogs);
        inserted = true;
      }
    } else {
      nextLogs.push(log);
    }
  }
  if (!inserted) {
    nextLogs.push(...nextResponseLogs);
  }
  return nextLogs;
}

function getTimelineTimestampMs(
  log: RunnerLog,
  threadStartedAtMs?: number | null,
): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (absoluteTimestampMs !== null) {
    return absoluteTimestampMs;
  }
  const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  return relativeSeconds !== null && threadStartedAtMs != null
    ? threadStartedAtMs + relativeSeconds * 1000
    : null;
}

function insertHydratedTimelineLogs(
  turn: RunnerTurn,
  logs: RunnerLog[],
  meta?: { threadStartedAtMs?: number | null },
): RunnerTurn {
  if (logs.length === 0) {
    return turn;
  }
  const visibleLogs: RunnerLog[] = [];
  let status = turn.status;
  let completedAtMs = turn.completedAtMs;
  let durationSeconds = turn.durationSeconds ?? null;
  for (const log of logs) {
    if (log.eventType === "turn_completed") {
      visibleLogs.push(log);
      const durationMs =
        typeof log.metadata?.durationMs === "number" ? log.metadata.durationMs : null;
      if (durationMs !== null && durationMs >= 0) {
        durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        completedAtMs = turn.startedAtMs + durationMs;
      }
      if (log.type === "error") {
        status = "failed";
      } else if (isActiveTurnStatus(status)) {
        status = "completed";
      }
      continue;
    }
    visibleLogs.push(log);
    if (log.eventType === "permission_request") {
      const permissionStatus = String(
        log.metadata?.status || log.metadata?.decision || "",
      )
        .trim()
        .toLowerCase();
      if (!permissionStatus || permissionStatus === "pending") {
        status = "permission_asked";
        completedAtMs = undefined;
      } else if (status === "permission_asked") {
        status = "running";
      }
      continue;
    }
    if (log.type === "error") {
      status = "failed";
    }
  }

  const latestTimestampMs = visibleLogs.reduce<number | null>((latest, log) => {
    const timestampMs = getTimelineTimestampMs(
      log,
      meta?.threadStartedAtMs ?? turn.startedAtMs,
    );
    return timestampMs === null
      ? latest
      : latest === null
        ? timestampMs
        : Math.max(latest, timestampMs);
  }, null);
  if (
    !isActiveTurnStatus(status) &&
    latestTimestampMs !== null &&
    (completedAtMs == null ||
      completedAtMs <= turn.startedAtMs ||
      latestTimestampMs > completedAtMs)
  ) {
    completedAtMs = latestTimestampMs;
  }
  if (
    (durationSeconds == null || durationSeconds <= 0) &&
    completedAtMs != null &&
    Number.isFinite(turn.startedAtMs) &&
    completedAtMs >= turn.startedAtMs
  ) {
    durationSeconds = Math.max(
      0,
      Math.round((completedAtMs - turn.startedAtMs) / 1000),
    );
  }

  const responseIndex = turn.logs.findIndex(isTurnResponseLog);
  const nextLogs =
    responseIndex === -1
      ? [...turn.logs, ...visibleLogs]
      : [
          ...turn.logs.slice(0, responseIndex),
          ...visibleLogs,
          ...turn.logs.slice(responseIndex),
        ];
  return {
    ...turn,
    logs: dedupeAdjacentRunnerLogs(nextLogs),
    status,
    completedAtMs,
    durationSeconds,
  };
}

export function mergeHydratedTimelineLogsIntoMessageTurns(
  turns: RunnerTurn[],
  logs: RunnerLog[],
  meta?: { startedAtMs?: number | null },
): RunnerTurn[] | null {
  if (turns.length === 0 || logs.length === 0) {
    return turns;
  }
  const timelineLogs = dedupeAdjacentRunnerLogs(
    sortRunnerLogsChronologically(logs.map(normalizeHydratedLog)),
  ).filter(
    (log) =>
      log.eventType !== "user_message" &&
      !(log as RunnerLog & { isUserMessage?: boolean }).isUserMessage &&
      !isTurnResponseLog(log),
  );
  if (timelineLogs.length === 0) {
    return turns;
  }

  const assignableTurns = turns
    .map((turn, index) => ({ turn, index }))
    .filter(
      ({ turn }) =>
        turnPresentation(turn) !== "context-action-notice" && turn.prompt.trim(),
    );
  if (assignableTurns.length === 0) {
    return null;
  }
  const canAssignByTimestamp =
    assignableTurns.every(({ turn }) => Number.isFinite(turn.startedAtMs)) &&
    timelineLogs.every(
      (log) => getTimelineTimestampMs(log, meta?.startedAtMs) !== null,
    );
  if (!canAssignByTimestamp && assignableTurns.length > 1) {
    return null;
  }
  const firstAssignableTurn = assignableTurns[0];
  if (!firstAssignableTurn) {
    return null;
  }

  const buckets = new Map<number, RunnerLog[]>();
  for (const log of timelineLogs) {
    let targetIndex = firstAssignableTurn.index;
    if (canAssignByTimestamp) {
      const timestampMs = getTimelineTimestampMs(log, meta?.startedAtMs) ?? 0;
      for (const candidate of assignableTurns) {
        if (candidate.turn.startedAtMs <= timestampMs + 1000) {
          targetIndex = candidate.index;
        } else {
          break;
        }
      }
    }
    const bucket = buckets.get(targetIndex) || [];
    bucket.push(log);
    buckets.set(targetIndex, bucket);
  }
  return turns.map((turn, index) =>
    insertHydratedTimelineLogs(turn, buckets.get(index) || [], {
      threadStartedAtMs: meta?.startedAtMs ?? null,
    }),
  );
}

export function mergeHydratedMessageTurnsIntoTurns(
  turns: RunnerTurn[],
  messages: RunnerConversationMessage[],
  meta?: RunnerHydratedMessageTurnMeta,
): RunnerTurn[] {
  if (turns.length === 0 || messages.length === 0) {
    return turns;
  }
  const messageTurns = buildHydratedTurnsFromMessages(messages, meta);
  if (messageTurns.length === 0) {
    return turns;
  }

  const mergeMessageTurn = (turn: RunnerTurn, messageTurn: RunnerTurn): RunnerTurn => {
    const responseLogs = messageTurn.logs.filter(isTurnResponseLog);
    const turnResponseText = getTurnAssistantMessageText(turn);
    const messageResponseText = getTurnAssistantMessageText(messageTurn);
    const preferMessageResponse =
      responseLogs.length > 0 &&
      !isFallbackAssistantResponseText(messageResponseText) &&
      (!turnResponseText ||
        isFallbackAssistantResponseText(turnResponseText) ||
        messageResponseText === turnResponseText ||
        messageResponseText.startsWith(turnResponseText) ||
        messageResponseText.length > turnResponseText.length);
    return {
      ...turn,
      prompt: turn.prompt || messageTurn.prompt,
      messageMetadata: turn.messageMetadata ?? messageTurn.messageMetadata ?? null,
      sourceMessageId: turn.sourceMessageId ?? messageTurn.sourceMessageId ?? null,
      quotedSelection: turn.quotedSelection ?? messageTurn.quotedSelection ?? null,
      attachments: pickTurnAttachments(turn.attachments, messageTurn.attachments),
      logs: preferMessageResponse
        ? replaceTurnResponseLogs(turn.logs, responseLogs)
        : turn.logs,
      completedAtMs: turn.completedAtMs ?? messageTurn.completedAtMs,
      durationSeconds: turn.durationSeconds ?? messageTurn.durationSeconds ?? null,
      agentName: turn.agentName ?? messageTurn.agentName ?? null,
      environmentName: turn.environmentName ?? messageTurn.environmentName ?? null,
      slideCreationCommand:
        turn.slideCreationCommand ?? messageTurn.slideCreationCommand ?? null,
      researchCreationCommand:
        turn.researchCreationCommand ?? messageTurn.researchCreationCommand ?? null,
      scrapeCreationCommand:
        turn.scrapeCreationCommand ?? messageTurn.scrapeCreationCommand ?? null,
      parseCreationCommand:
        turn.parseCreationCommand ?? messageTurn.parseCreationCommand ?? null,
      adCreationCommand: turn.adCreationCommand ?? messageTurn.adCreationCommand ?? null,
    };
  };

  const consumed = new Set<number>();
  let mergedTurns = turns.map((turn) => {
    const index = messageTurns.findIndex(
      (messageTurn, messageIndex) =>
        !consumed.has(messageIndex) && turnsLikelyMatch(turn, messageTurn),
    );
    if (index === -1) {
      return turn;
    }
    const matchedMessageTurn = messageTurns[index];
    if (!matchedMessageTurn) {
      return turn;
    }
    consumed.add(index);
    return mergeMessageTurn(turn, matchedMessageTurn);
  });

  const unmatched: RunnerTurn[] = [];
  messageTurns.forEach((messageTurn, index) => {
    if (consumed.has(index)) return;
    const assistantOnly =
      !messageTurn.prompt.trim() && messageTurn.logs.some(isTurnResponseLog);
    if (assistantOnly) {
      const targetIndex = mergedTurns.findIndex(
        (turn) =>
          turn.logs.some(runnerLogHasMetronomeWorkflowPromptReplacement) ||
          (!turn.prompt.trim() && turn.logs.length > 0),
      );
      if (targetIndex !== -1) {
        mergedTurns = mergedTurns.map((turn, turnIndex) =>
          turnIndex === targetIndex ? mergeMessageTurn(turn, messageTurn) : turn,
        );
        consumed.add(index);
        return;
      }
    }
    unmatched.push(messageTurn);
  });
  if (unmatched.length === 0) {
    return mergedTurns;
  }
  return [...mergedTurns, ...unmatched]
    .sort(
      (left, right) =>
        (left.startedAtMs || 0) - (right.startedAtMs || 0) ||
        left.id.localeCompare(right.id),
    )
    .map((turn, index) => ({ ...turn, isInitialTurn: index === 0 }));
}

export function mergeHydratedTurns(
  existingTurns: RunnerTurn[],
  hydratedTurns: RunnerTurn[],
): RunnerTurn[] {
  const mergedTurns = [...hydratedTurns];
  for (const localTurn of existingTurns) {
    const localPresentation = turnPresentation(localTurn);
    const carryIfUnmatched =
      localTurn.status === "queued" ||
      !isTerminalTurnStatus(localTurn.status) ||
      localPresentation === "btw" ||
      Boolean(localTurn.quotedSelection) ||
      Boolean(localTurn.attachments?.length);
    const hydratedIndex = mergedTurns.findIndex((turn) =>
      turnsLikelyMatch(localTurn, turn),
    );
    if (hydratedIndex === -1) {
      if (carryIfUnmatched) {
        mergedTurns.push(localTurn);
      }
      continue;
    }

    const hydratedTurn = mergedTurns[hydratedIndex];
    if (shouldPreserveLocalTurnProgress(localTurn, hydratedTurn)) {
      mergedTurns[hydratedIndex] = {
        ...hydratedTurn,
        ...localTurn,
        presentation: localPresentation,
        quotedSelection:
          localTurn.quotedSelection ?? hydratedTurn.quotedSelection ?? null,
        attachments: pickTurnAttachments(
          localTurn.attachments,
          hydratedTurn.attachments,
        ),
        sourceMessageId:
          localTurn.sourceMessageId ?? hydratedTurn.sourceMessageId ?? null,
      };
      continue;
    }
    mergedTurns[hydratedIndex] = {
      ...hydratedTurn,
      ...(!hydratedTurn.presentation && localPresentation !== "default"
        ? { presentation: localPresentation }
        : {}),
      quotedSelection:
        hydratedTurn.quotedSelection ?? localTurn.quotedSelection ?? null,
      attachments: pickTurnAttachments(
        hydratedTurn.attachments,
        localTurn.attachments,
      ),
      sourceMessageId:
        hydratedTurn.sourceMessageId ?? localTurn.sourceMessageId ?? null,
      slideCreationCommand:
        hydratedTurn.slideCreationCommand ?? localTurn.slideCreationCommand ?? null,
      researchCreationCommand:
        hydratedTurn.researchCreationCommand ??
        localTurn.researchCreationCommand ??
        null,
      scrapeCreationCommand:
        hydratedTurn.scrapeCreationCommand ?? localTurn.scrapeCreationCommand ?? null,
      parseCreationCommand:
        hydratedTurn.parseCreationCommand ?? localTurn.parseCreationCommand ?? null,
      adCreationCommand:
        hydratedTurn.adCreationCommand ?? localTurn.adCreationCommand ?? null,
    };
  }
  return [...mergedTurns]
    .sort(
      (left, right) =>
        (left.startedAtMs || 0) - (right.startedAtMs || 0) ||
        left.id.localeCompare(right.id),
    )
    .map((turn, index) => ({ ...turn, isInitialTurn: index === 0 }));
}
