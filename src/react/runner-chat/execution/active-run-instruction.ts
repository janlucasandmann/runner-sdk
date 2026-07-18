import type {
  RunnerThreadRoutedMessageInput,
  RunnerThreadRoutedMessageResult,
  RunnerThreadRoutingReceipt,
} from "../../../thread/types.js";
import { generateRunnerClientId } from "../id-utils.js";

export type RunnerActiveRunInstructionStatus = "queued" | "delivered" | "delivery_unavailable";

export interface RunnerActiveRunInstructionResult {
  status: RunnerActiveRunInstructionStatus;
  result: RunnerThreadRoutedMessageResult;
  receipt: RunnerThreadRoutingReceipt;
}

export interface PersistRunnerActiveRunInstructionOptions {
  clientMessageId: string;
  content: string;
  postMessage: (
    message: RunnerThreadRoutedMessageInput,
  ) => Promise<RunnerThreadRoutedMessageResult>;
  runId: string;
  source?: string;
}

export interface TryRouteRunnerActiveRunInstructionOptions {
  content: string;
  createClientMessageId?: () => string;
  enabled: boolean;
  onNotice: (message: string) => void;
  onRestoreComposer: (content: string) => void;
  postMessage: (
    message: RunnerThreadRoutedMessageInput,
  ) => Promise<RunnerThreadRoutedMessageResult>;
  projectionMatchesThread: boolean;
  runId?: string | null;
}

function normalized(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/**
 * Persists a worker instruction before the UI claims it has been queued.
 *
 * The activity-message endpoint owns both the message and its routing receipt;
 * a page-local execution queue is intentionally not used for canonical runs.
 */
export async function persistRunnerActiveRunInstruction({
  clientMessageId,
  content,
  postMessage,
  runId,
  source = "runner_chat_active_run_instruction",
}: PersistRunnerActiveRunInstructionOptions): Promise<RunnerActiveRunInstructionResult> {
  const normalizedContent = content.trim();
  const normalizedRunId = runId.trim();
  const normalizedMessageId = clientMessageId.trim();
  if (!normalizedContent) throw new Error("A worker instruction cannot be empty.");
  if (!normalizedRunId) throw new Error("An active run is required to route this instruction.");
  if (!normalizedMessageId)
    throw new Error("A stable message identity is required to route this instruction.");

  const result = await postMessage({
    id: normalizedMessageId,
    clientMessageId: normalizedMessageId,
    content: normalizedContent,
    intendedRoute: "worker",
    deliveryMode: "checkpoint",
    replyToRunId: normalizedRunId,
    metadata: {
      source,
      idempotencyKey: normalizedMessageId,
      coordinatorDurable: true,
    },
  });

  if (result.accepted === false) {
    throw new Error(result.limitation || "The backend did not accept the worker instruction.");
  }
  const receipt = result.routingReceipt || result.delivery;
  if (!receipt) {
    throw new Error(
      "The backend stored no routing receipt, so worker delivery could not be confirmed.",
    );
  }
  if (normalized(receipt.route) !== "worker") {
    throw new Error(
      `The instruction was routed to ${receipt.route || "an unknown target"} instead of the worker.`,
    );
  }
  if (receipt.runId && receipt.runId !== normalizedRunId) {
    throw new Error("The worker instruction was attached to a different run.");
  }

  const receiptStatus = normalized(receipt.status);
  const status: RunnerActiveRunInstructionStatus =
    receiptStatus === "delivered" && result.delivered !== false
      ? "delivered"
      : receiptStatus === "failed"
        ? "delivery_unavailable"
        : "queued";

  return { status, result, receipt };
}

export function getRunnerActiveRunInstructionNotice(
  instruction: RunnerActiveRunInstructionResult,
): string | null {
  if (instruction.status === "delivered") return null;
  if (instruction.status === "delivery_unavailable") {
    return (
      instruction.result.limitation ||
      "The message was saved, but worker delivery is currently unavailable."
    );
  }
  if (instruction.result.coordinatorRequired || instruction.result.effectApplied === false) {
    return (
      instruction.result.limitation ||
      "The instruction is durably queued for the worker's next checkpoint."
    );
  }
  return null;
}

/**
 * Routes a composer message to the active canonical worker and owns the
 * delivery-failure contract. A handled failure restores the composer instead
 * of allowing the same message to fall through to a second execution path.
 */
export async function tryRouteRunnerActiveRunInstruction({
  content,
  createClientMessageId = () => generateRunnerClientId("worker-instruction"),
  enabled,
  onNotice,
  onRestoreComposer,
  postMessage,
  projectionMatchesThread,
  runId,
}: TryRouteRunnerActiveRunInstructionOptions): Promise<boolean> {
  const normalizedContent = content.trim();
  const normalizedRunId = String(runId || "").trim();
  if (!normalizedContent || !normalizedRunId || !enabled || !projectionMatchesThread) {
    return false;
  }

  try {
    const instruction = await persistRunnerActiveRunInstruction({
      clientMessageId: createClientMessageId(),
      content: normalizedContent,
      postMessage,
      runId: normalizedRunId,
    });
    const notice = getRunnerActiveRunInstructionNotice(instruction);
    if (notice) onNotice(notice);
    return true;
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    onNotice(
      `${
        normalizedError.message || "Worker delivery could not be confirmed."
      } The message remains in the composer and was not placed in the page-local queue.`,
    );
    onRestoreComposer(normalizedContent);
    return true;
  }
}
