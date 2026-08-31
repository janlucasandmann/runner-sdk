import type {
  RunnerThreadControlInput,
  RunnerThreadRoutedMessageInput,
  RunnerThreadRoutedMessageResult,
  RunnerThreadRunCommandResult,
} from "../../thread/types.js";
import { generateRunnerClientId } from "./id-utils.js";
import { buildRunnerVoiceHeaders } from "./voice-realtime-protocol.js";

export interface RunnerCommunicatorAnswer {
  content: string;
  receiptId: string;
  receiptStatus: string;
}

export interface TryRouteRunnerCommunicatorMessageOptions {
  activeRunId?: string | null;
  apiKey: string;
  backendUrl: string;
  content: string;
  controlRun: (
    runId: string,
    control: RunnerThreadControlInput,
  ) => Promise<RunnerThreadRunCommandResult>;
  fetchImpl?: typeof fetch;
  hasRoutableActiveRun: boolean;
  now?: () => number;
  onAnswer: (answer: RunnerCommunicatorAnswer) => void;
  onError: (message: string) => void;
  onRestoreComposer: (content: string) => void;
  onStop: () => Promise<void>;
  postMessage: (
    message: RunnerThreadRoutedMessageInput,
  ) => Promise<RunnerThreadRoutedMessageResult>;
  requestHeaders?: HeadersInit;
  threadId?: string | null;
  usesCanonicalThreadSurface: boolean;
}

function looksLikeStatusQuestion(content: string): boolean {
  return (
    /(^|\s)@communicator\b/i.test(content) ||
    (/\b(status|progress|summary|update|happening|doing|working on|where are we|how(?:'s| is) it going|still running|what changed|why did)\b/i.test(
      content,
    ) &&
      (content.includes("?") ||
        /^(what|where|why|how|is|are|can you tell|give me)/i.test(content))) ||
    (content.includes("?") &&
      /\b(tests?|files?|changes?|decisions?|assumptions?|errors?|build|branch|deploy(?:ment)?|worker|run)\b/i.test(
        content,
      ) &&
      /^(did|does|has|have|which|what|when|where|why|how|is|are|can|could|would)/i.test(content))
  );
}

function looksLikeWorkerInstruction(content: string): boolean {
  return (
    /^(?:please\s+|can you\s+|could you\s+|would you\s+)?(?:add|analy[sz]e|build|change|configure|continue|copy|create|debug|deploy|design|document|edit|execute|find|fix|implement|improve|inspect|install|integrate|investigate|make|migrate|move|optimi[sz]e|publish|refactor|remove|rename|review|revert|retry|run|search|set\s+up|ship|test|update|upgrade|use|write)\b/i.test(
      content,
    ) || /^(?:do not|don't|instead|also)\b/i.test(content)
  );
}

function readDeterministicControl(content: string): string | null {
  return (
    content
      .match(
        /^(stop|pause|cancel|resume|park)(?:\s+(?:(?:this|the current|the|current)\s+)?(?:run|task|worker|job|deployment|deploy))?(?:\s+now)?[.!]?$/i,
      )?.[1]
      ?.toLowerCase() || null
  );
}

export async function tryRouteRunnerCommunicatorMessage({
  activeRunId,
  apiKey,
  backendUrl,
  content,
  controlRun,
  fetchImpl = globalThis.fetch,
  hasRoutableActiveRun,
  now = () => Date.now(),
  onAnswer,
  onError,
  onRestoreComposer,
  onStop,
  postMessage,
  requestHeaders,
  threadId,
  usesCanonicalThreadSurface,
}: TryRouteRunnerCommunicatorMessageOptions): Promise<boolean> {
  const normalizedContent = content.trim();
  const resolvedThreadId = String(threadId || "").trim();
  if (!normalizedContent || !resolvedThreadId || !backendUrl || !apiKey.trim()) {
    return false;
  }

  const deterministicControl = readDeterministicControl(normalizedContent);
  if (deterministicControl) {
    if (deterministicControl === "stop" || deterministicControl === "cancel") {
      if (!hasRoutableActiveRun) {
        onError("There is no active run to stop.");
        return true;
      }
      await onStop();
      return true;
    }
    if (!activeRunId) {
      onError(
        `The current runtime cannot ${deterministicControl} at a safe checkpoint yet. The command was not sent as a worker task.`,
      );
      return true;
    }
    try {
      const command = await controlRun(activeRunId, {
        action: deterministicControl as "pause" | "resume" | "park",
        reason: "Explicit deterministic control from the thread composer.",
        idempotencyKey: `runner-chat-control:${resolvedThreadId}:${activeRunId}:${deterministicControl}:${now()}`,
      });
      if (command.effectApplied === false) {
        onError(
          command.limitation ||
            "The control request was recorded and is waiting for the run coordinator.",
        );
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
    return true;
  }

  const fallbackLooksLikeStatusQuestion = looksLikeStatusQuestion(normalizedContent);
  const fallbackLooksLikeWorkerInstruction = looksLikeWorkerInstruction(normalizedContent);
  const explicitlyAddressedCommunicator = /(^|\s)@communicator\b/i.test(normalizedContent);

  try {
    const headers = buildRunnerVoiceHeaders(requestHeaders, apiKey);
    let shouldUseCommunicator =
      explicitlyAddressedCommunicator ||
      (hasRoutableActiveRun &&
        (fallbackLooksLikeStatusQuestion || !fallbackLooksLikeWorkerInstruction));
    let targetRunId = activeRunId || null;
    let controlAction: string | null = null;

    try {
      const classificationResponse = await fetchImpl(
        `${backendUrl}/threads/${encodeURIComponent(resolvedThreadId)}/activity/classify`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ content: normalizedContent }),
        },
      );
      if (classificationResponse.ok) {
        const classification = (await classificationResponse.json()) as Record<string, unknown>;
        const decision =
          classification.decision && typeof classification.decision === "object"
            ? (classification.decision as Record<string, unknown>)
            : {};
        const rawRoute = String(decision.route || "")
          .trim()
          .toLowerCase();
        shouldUseCommunicator =
          classification.suggestedTransport === "activity_message" && rawRoute === "communicator";
        const targetRunActive = classification.targetRunActive === true;
        if (
          shouldUseCommunicator &&
          !targetRunActive &&
          !explicitlyAddressedCommunicator
        ) {
          return false;
        }
        targetRunId =
          typeof classification.targetRunId === "string" ? classification.targetRunId : targetRunId;
        controlAction = typeof decision.controlAction === "string" ? decision.controlAction : null;

        if (rawRoute === "control") {
          if (controlAction === "stop" || controlAction === "cancel") {
            await onStop();
            return true;
          }
          if (targetRunId && ["pause", "resume", "park"].includes(controlAction || "")) {
            const command = await controlRun(targetRunId, {
              action: controlAction as "pause" | "resume" | "park",
              reason: "Explicit control message from the thread composer.",
              idempotencyKey: `runner-chat-control:${resolvedThreadId}:${targetRunId}:${controlAction}:${now()}`,
            });
            if (command.effectApplied === false) {
              onError(
                command.limitation ||
                  "The control request was recorded and is waiting for the run coordinator.",
              );
            }
            return true;
          }
          onError(
            controlAction
              ? `There is no controllable run to ${controlAction}. The command was not sent as a worker task.`
              : "The message was classified as run control, but no supported control action was found. It was not sent as a worker task.",
          );
          return true;
        }
        if (!shouldUseCommunicator) return false;
      }
    } catch {
      // Older backends rely on the conservative local status fallback.
    }
    if (!shouldUseCommunicator) return false;

    const clientMessageId = generateRunnerClientId("activity-message");
    let routed: RunnerThreadRoutedMessageResult;
    try {
      routed = await postMessage({
        clientMessageId,
        content: normalizedContent,
        intendedRoute: "communicator",
        deliveryMode: "fyi",
        metadata: {
          source: "runner_chat_communicator_preflight",
        },
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onError(
        `${
          normalizedError.message || "Could not confirm the communicator response."
        } The message was not rerouted to the worker.`,
      );
      onRestoreComposer(normalizedContent);
      return true;
    }

    const responseText = routed.communicator?.message.content.trim() || "";
    if (!responseText) {
      onError(
        "The communicator accepted the message but did not return a response. It was not rerouted to the worker.",
      );
      onRestoreComposer(normalizedContent);
      return true;
    }
    if (!usesCanonicalThreadSurface) {
      onAnswer({
        content: responseText,
        receiptId: String(routed.routingReceipt?.id || ""),
        receiptStatus: String(routed.routingReceipt?.status || "answered"),
      });
    }
    return true;
  } catch {
    // The legacy worker queue remains the safe migration fallback.
    return false;
  }
}
