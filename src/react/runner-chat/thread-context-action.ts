import {
  type RunnerThreadContextActionResponse,
  requestRunnerThreadContextAction,
} from "./thread-context-api.js";
import {
  formatThreadContextCommandText,
  type RunnerChatThreadContextAction,
} from "./thread-context-utils.js";

interface RunnerThreadContextActionServices {
  requestAction: typeof requestRunnerThreadContextAction;
}

interface RunnerContextNoticeOptions {
  prompt?: string;
}

interface RunnerContextNoticeUpdateOptions {
  failed?: boolean;
}

export interface ExecuteRunnerThreadContextActionOptions {
  action: RunnerChatThreadContextAction;
  apiKey: string;
  appendBtwTurn: (commandText: string, responseText: string) => void;
  appendNotice: (action: RunnerChatThreadContextAction, message: string) => string;
  appendPendingNotice: (
    action: RunnerChatThreadContextAction,
    message: string,
    options?: RunnerContextNoticeOptions,
  ) => string;
  backendUrl: string;
  beginAction: (action: RunnerChatThreadContextAction) => void;
  commandText?: string;
  finishAction: () => void;
  markContextCleared: () => void;
  onThreadForked: (threadId: string) => void;
  prompt?: string;
  refreshDetails: (threadId: string) => void;
  requestHeaders?: HeadersInit;
  services?: Partial<RunnerThreadContextActionServices>;
  threadId?: string | null;
  updateNotice: (
    turnId: string,
    message: string,
    options?: RunnerContextNoticeUpdateOptions,
  ) => void;
}

function requireThreadContextActionIdentity({
  apiKey,
  backendUrl,
  threadId,
}: Pick<ExecuteRunnerThreadContextActionOptions, "apiKey" | "backendUrl" | "threadId">): string {
  if (!backendUrl) {
    throw new Error("backendUrl is required.");
  }
  if (!apiKey) {
    throw new Error("apiKey is required.");
  }
  const resolvedThreadId = String(threadId || "").trim();
  if (!resolvedThreadId) {
    throw new Error("Start a conversation first before using this context action.");
  }
  return resolvedThreadId;
}

/**
 * Executes one thread-context command as a single lifecycle transaction.
 *
 * The caller owns presentation state, while this boundary guarantees that
 * pending notices, context refreshes, fork transitions, and loading state stay
 * aligned with the remote action outcome.
 */
export async function executeRunnerThreadContextAction({
  action,
  apiKey,
  appendBtwTurn,
  appendNotice,
  appendPendingNotice,
  backendUrl,
  beginAction,
  commandText,
  finishAction,
  markContextCleared,
  onThreadForked,
  prompt,
  refreshDetails,
  requestHeaders,
  services,
  threadId,
  updateNotice,
}: ExecuteRunnerThreadContextActionOptions): Promise<void> {
  const resolvedThreadId = requireThreadContextActionIdentity({
    apiKey,
    backendUrl,
    threadId,
  });
  const requestAction = services?.requestAction || requestRunnerThreadContextAction;

  beginAction(action);
  let pendingNoticeTurnId: string | null = null;

  try {
    if (action === "compact") {
      pendingNoticeTurnId = appendPendingNotice("compact", "Compacting context", {
        prompt: commandText || formatThreadContextCommandText("compact", prompt),
      });
    }

    const actionPayload: RunnerThreadContextActionResponse = await requestAction({
      action,
      apiKey,
      backendUrl,
      prompt,
      requestHeaders,
      threadId: resolvedThreadId,
    });
    const resolvedCommandText = commandText || `/${action}`;
    const responseText =
      actionPayload.responseText || actionPayload.message || `Completed /${action}.`;

    if (action === "fork") {
      const nextThreadId = actionPayload.thread?.id;
      if (!nextThreadId) {
        throw new Error("Fork completed without returning a new thread.");
      }
      onThreadForked(nextThreadId);
      appendNotice("fork", "Forked into a new conversation");
      refreshDetails(nextThreadId);
      return;
    }

    if (action === "clear") {
      markContextCleared();
      appendNotice("clear", "Context was cleared");
    } else if (action === "compact") {
      if (pendingNoticeTurnId) {
        updateNotice(pendingNoticeTurnId, "Context was compacted");
      } else {
        appendNotice("compact", "Context was compacted");
      }
    } else if (action === "btw") {
      appendBtwTurn(resolvedCommandText, responseText);
    }

    refreshDetails(resolvedThreadId);
  } catch (error) {
    if (action === "compact" && pendingNoticeTurnId) {
      updateNotice(pendingNoticeTurnId, "Failed to compact context", { failed: true });
    }
    throw error;
  } finally {
    finishAction();
  }
}
