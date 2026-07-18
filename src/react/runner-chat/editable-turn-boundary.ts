import { fetchAllThreadMessages, type RunnerConversationMessage } from "./conversation-messages.js";
import { isBtwTurnPrompt } from "./log-presentation.js";
import { isThreadContextCommandPrompt } from "./thread-context-utils.js";
import type { RunnerTurn } from "./turn-types.js";

interface RunnerEditableTurnBoundaryServices {
  fetchMessages: typeof fetchAllThreadMessages;
}

export interface RunnerEditableTurnBoundary {
  messageId: string;
  truncateAtMessageIndex: number;
}

export interface ResolveRunnerEditableTurnBoundaryOptions {
  apiKey: string;
  backendUrl: string;
  requestHeaders?: HeadersInit;
  services?: Partial<RunnerEditableTurnBoundaryServices>;
  threadId?: string | null;
  turnId: string;
  turns: readonly RunnerTurn[];
}

function getFallbackMessageId(turn: RunnerTurn, turnId: string): string {
  if (typeof turn.sourceMessageId === "string" && turn.sourceMessageId.trim().startsWith("msg_")) {
    return turn.sourceMessageId.trim();
  }
  return turnId.startsWith("msg_") ? turnId : "";
}

function isCanonicalEditableUserMessage(message: RunnerConversationMessage): boolean {
  return (
    message.role === "user" &&
    typeof message.id === "string" &&
    message.id.trim().startsWith("msg_") &&
    typeof message.content === "string" &&
    !isBtwTurnPrompt(message.content) &&
    !isThreadContextCommandPrompt(message.content)
  );
}

function isEditableConversationTurn(turn: RunnerTurn): boolean {
  return (
    turn.presentation !== "btw" &&
    turn.presentation !== "context-action-notice" &&
    turn.prompt.trim().length > 0
  );
}

function boundaryForMessage(
  messages: readonly RunnerConversationMessage[],
  messageId: string,
): RunnerEditableTurnBoundary {
  const messageIndex = messages.findIndex((message) => message.id === messageId);
  return {
    messageId,
    truncateAtMessageIndex: messageIndex === -1 ? 0 : messageIndex,
  };
}

/**
 * Resolves a local conversation turn to its canonical user-message boundary.
 *
 * Canonical message identity wins, followed by stable conversation position
 * and prompt matching. Compatibility fallbacks are retained for unsaved and
 * older hydrated turns, but internal `/btw` and context-command messages never
 * participate in positional matching.
 */
export async function resolveRunnerEditableTurnBoundary({
  apiKey,
  backendUrl,
  requestHeaders,
  services,
  threadId,
  turnId,
  turns,
}: ResolveRunnerEditableTurnBoundaryOptions): Promise<RunnerEditableTurnBoundary> {
  const targetTurn = turns.find((turn) => turn.id === turnId);
  if (!targetTurn) {
    throw new Error("Message not found.");
  }

  const fallbackMessageId = getFallbackMessageId(targetTurn, turnId);
  const normalizedThreadId = String(threadId || "").trim();
  if (!normalizedThreadId || !apiKey.trim()) {
    if (fallbackMessageId) {
      return {
        messageId: fallbackMessageId,
        truncateAtMessageIndex: 0,
      };
    }
    throw new Error("Message not found.");
  }

  const fetchMessages = services?.fetchMessages || fetchAllThreadMessages;
  const messages = await fetchMessages({
    apiKey: apiKey.trim(),
    backendUrl,
    requestHeaders,
    threadId: normalizedThreadId,
  });
  const canonicalUserMessages = messages.filter(isCanonicalEditableUserMessage);

  if (
    fallbackMessageId &&
    canonicalUserMessages.some((message) => message.id === fallbackMessageId)
  ) {
    return boundaryForMessage(messages, fallbackMessageId);
  }

  const editableConversationTurns = turns.filter(isEditableConversationTurn);
  const editableTurnIndex = editableConversationTurns.findIndex((turn) => turn.id === turnId);
  const positionalMessage = canonicalUserMessages[editableTurnIndex];
  if (editableTurnIndex !== -1 && positionalMessage?.id) {
    return boundaryForMessage(messages, positionalMessage.id);
  }

  const promptMatch = canonicalUserMessages.find(
    (message) => message.content.trim() === targetTurn.prompt.trim(),
  );
  if (promptMatch?.id) {
    return boundaryForMessage(messages, promptMatch.id);
  }

  const onlyCanonicalMessage = canonicalUserMessages[0];
  if (canonicalUserMessages.length === 1 && onlyCanonicalMessage?.id) {
    return boundaryForMessage(messages, onlyCanonicalMessage.id);
  }

  if (fallbackMessageId) {
    return {
      messageId: fallbackMessageId,
      truncateAtMessageIndex: 0,
    };
  }

  throw new Error("Message not found.");
}
