import {
  normalizeAdCreationCommandFromMetadata,
  normalizeParseCreationCommandFromMetadata,
  normalizeResearchCreationCommandFromMetadata,
  normalizeScrapeCreationCommandFromMetadata,
  normalizeSlideCreationCommandFromMetadata,
  normalizeLoopCommandFromMetadata,
} from "../composer-commands.js";
import {
  buildAssistantMessageRunMetadata,
  sortRunnerConversationMessagesChronologically,
  type RunnerConversationMessage,
} from "../conversation-messages.js";
import { normalizeRunnerTurnMessageMetadata } from "../email-presentation.js";
import { generateRunnerClientId } from "../id-utils.js";
import { normalizeQuotedSelection } from "../quoted-selection.js";
import { normalizeTurnAttachments } from "../turn-attachments.js";
import type { RunnerTurn } from "../turn-types.js";
import {
  applyHydratedRunningThreadState,
  isTurnResponseLog,
  turnPresentation,
} from "./turn-state.js";

export interface RunnerHydratedMessageTurnMeta {
  agentName?: string | null;
  environmentName?: string | null;
  backendUrl?: string;
  threadStatus?: string | null;
  completedAtMs?: number | null;
  threadMetadata?: Record<string, unknown> | null;
}

function createUserTurn(
  message: RunnerConversationMessage,
  timestampMs: number,
  meta: RunnerHydratedMessageTurnMeta | undefined,
  presentation: "default" | "btw",
): RunnerTurn {
  return {
    id: message.id || generateRunnerClientId("turn"),
    sourceMessageId: message.id || null,
    prompt: message.content || "",
    messageMetadata: normalizeRunnerTurnMessageMetadata(
      message.logMetadata,
      meta?.threadMetadata,
    ),
    logs: [],
    startedAtMs: timestampMs,
    completedAtMs: timestampMs,
    status: presentation === "btw" ? "running" : "completed",
    animateOnRender: false,
    agentName: meta?.agentName ?? null,
    environmentName: meta?.environmentName ?? null,
    presentation,
    quotedSelection: normalizeQuotedSelection(message.logMetadata?.quotedSelection),
    attachments: normalizeTurnAttachments(
      message.logMetadata?.attachments,
      meta?.backendUrl,
    ),
    slideCreationCommand: normalizeSlideCreationCommandFromMetadata(message.logMetadata),
    researchCreationCommand: normalizeResearchCreationCommandFromMetadata(
      message.logMetadata,
    ),
    scrapeCreationCommand: normalizeScrapeCreationCommandFromMetadata(message.logMetadata),
    parseCreationCommand: normalizeParseCreationCommandFromMetadata(message.logMetadata),
    adCreationCommand: normalizeAdCreationCommandFromMetadata(message.logMetadata),
    loopCommand: normalizeLoopCommandFromMetadata(message.logMetadata),
  };
}

function appendAssistantMessage(
  turn: RunnerTurn,
  message: RunnerConversationMessage,
  timestampMs: number,
): void {
  const responseIndex = turn.logs.findIndex(isTurnResponseLog);
  const messageMetadata = buildAssistantMessageRunMetadata(message);
  if (responseIndex === -1) {
    turn.logs.push({
      time: message.createdAt || new Date(timestampMs).toISOString(),
      message: message.content || "",
      type: "info",
      eventType: "agent_message",
      metadata: messageMetadata,
    });
  } else {
    const existing = turn.logs[responseIndex];
    turn.logs[responseIndex] = {
      ...existing,
      message: `${existing.message}\n\n${message.content || ""}`.trim(),
      metadata: {
        ...(existing.metadata || {}),
        ...(messageMetadata || {}),
      },
    };
  }
  turn.completedAtMs = timestampMs;
  turn.status = "completed";
}

export function buildHydratedTurnsFromMessages(
  messages: RunnerConversationMessage[],
  meta?: RunnerHydratedMessageTurnMeta,
): RunnerTurn[] {
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(messages);
  const turns: RunnerTurn[] = [];
  let currentTurn: RunnerTurn | null = null;
  let pendingBtwTurn: RunnerTurn | null = null;

  const commit = (key: "current" | "btw"): void => {
    const turn = key === "current" ? currentTurn : pendingBtwTurn;
    if (turn && (turn.prompt.trim().length > 0 || turn.logs.length > 0)) {
      turns.push(turn);
    }
    if (key === "current") {
      currentTurn = null;
    } else {
      pendingBtwTurn = null;
    }
  };

  chronologicalMessages.forEach((message, index) => {
    const parsedTimestamp = message.createdAt ? Date.parse(message.createdAt) : Number.NaN;
    const timestampMs = Number.isFinite(parsedTimestamp)
      ? parsedTimestamp
      : Date.now() + index;

    if (message.role === "user") {
      if (/^\/btw\b/i.test((message.content || "").trim())) {
        commit("btw");
        pendingBtwTurn = createUserTurn(message, timestampMs, meta, "btw");
      } else {
        commit("btw");
        commit("current");
        currentTurn = createUserTurn(message, timestampMs, meta, "default");
      }
      return;
    }
    if (message.role !== "assistant") {
      return;
    }

    const belongsToBtw =
      Boolean(message.logMetadata?.isBTW) ||
      (pendingBtwTurn !== null && turnPresentation(pendingBtwTurn) === "btw");
    if (belongsToBtw && pendingBtwTurn) {
      appendAssistantMessage(pendingBtwTurn, message, timestampMs);
      commit("btw");
      return;
    }

    if (!currentTurn) {
      currentTurn = {
        id: message.id || generateRunnerClientId("turn"),
        sourceMessageId: null,
        prompt: "",
        logs: [],
        startedAtMs: timestampMs,
        completedAtMs: timestampMs,
        status: "completed",
        animateOnRender: false,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
        presentation: "default",
      };
    }
    appendAssistantMessage(currentTurn, message, timestampMs);
  });

  commit("btw");
  commit("current");
  const sortedTurns = [...turns].sort(
    (left, right) =>
      left.startedAtMs - right.startedAtMs || left.id.localeCompare(right.id),
  );
  if (sortedTurns[0]) {
    sortedTurns[0].isInitialTurn = true;
  }
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

export function attachHydratedMessageIdsToTurns(
  turns: RunnerTurn[],
  messages: RunnerConversationMessage[],
  backendUrl?: string,
  threadMetadata?: Record<string, unknown> | null,
): RunnerTurn[] {
  const userMessages = messages.filter(
    (message) =>
      message.role === "user" &&
      typeof message.id === "string" &&
      message.id.trim().length > 0 &&
      typeof message.content === "string",
  );
  if (userMessages.length === 0) {
    return turns;
  }

  let nextUserMessageIndex = 0;
  return turns.map((turn) => {
    let matchedMessage: RunnerConversationMessage | null = null;
    if (typeof turn.sourceMessageId === "string" && turn.sourceMessageId.trim()) {
      matchedMessage =
        userMessages.find((message) => message.id === turn.sourceMessageId) || null;
    }
    if (!matchedMessage && turn.prompt.trim()) {
      let index = userMessages.findIndex(
        (message, messageIndex) =>
          messageIndex >= nextUserMessageIndex &&
          message.content.trim() === turn.prompt.trim(),
      );
      if (index === -1 && nextUserMessageIndex < userMessages.length) {
        index = nextUserMessageIndex;
      }
      if (index !== -1) {
        matchedMessage = userMessages[index] || null;
        nextUserMessageIndex = index + 1;
      }
    }
    if (!matchedMessage) {
      return turn;
    }
    const matchedMessageId = matchedMessage.id;
    if (!matchedMessageId) {
      return turn;
    }
    return {
      ...turn,
      id: turn.sourceMessageId ? turn.id : matchedMessageId,
      sourceMessageId: matchedMessageId,
      messageMetadata: normalizeRunnerTurnMessageMetadata(
        matchedMessage.logMetadata,
        threadMetadata,
      ),
      quotedSelection: normalizeQuotedSelection(
        matchedMessage.logMetadata?.quotedSelection,
      ),
      attachments: normalizeTurnAttachments(
        matchedMessage.logMetadata?.attachments,
        backendUrl,
      ),
    };
  });
}
