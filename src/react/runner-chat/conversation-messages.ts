import type { RunnerLog } from "../../types.js";
import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./api-utils.js";
import {
  extractRunnerVisibleContentFromHiddenExecutionPrompt,
  isRunnerInternalHiddenExecutionPromptContent,
} from "./agent-options.js";
import { RUNNER_COMPUTE_TOKENS_PER_DOLLAR } from "./composer-commands.js";
import {
  getRecordNumber,
  getRecordObject,
  getRecordString,
  normalizeRecordObject,
} from "./record-utils.js";
import { parseIsoTimestampMs } from "./time-utils.js";

export interface RunnerConversationMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  durationMs?: number | null;
  actionsCount?: number | null;
  logMetadata?: Record<string, unknown> | null;
}

const AGENT_RUNTIME_INTERRUPTED_MESSAGE =
  "The agent stopped unexpectedly before it could finish. Please retry this turn. If the issue continues, contact support.";
const LLM_PROVIDER_UNAVAILABLE_MESSAGE =
  "The selected model provider is temporarily unavailable. Please retry this turn in a moment.";

export function buildAssistantMessageRunMetadata(
  message: RunnerConversationMessage
): RunnerLog["metadata"] | undefined {
  const baseMetadata =
    message.logMetadata &&
    typeof message.logMetadata === "object" &&
    !Array.isArray(message.logMetadata)
      ? message.logMetadata
      : {};
  const metadata: Record<string, unknown> = { ...baseMetadata };
  if (
    typeof message.durationMs === "number" &&
    Number.isFinite(message.durationMs)
  ) {
    metadata.durationMs = message.durationMs;
  }
  if (
    typeof message.inputTokens === "number" &&
    Number.isFinite(message.inputTokens)
  ) {
    metadata.inputTokens = message.inputTokens;
  }
  if (
    typeof message.outputTokens === "number" &&
    Number.isFinite(message.outputTokens)
  ) {
    metadata.outputTokens = message.outputTokens;
  }
  if (
    typeof message.actionsCount === "number" &&
    Number.isFinite(message.actionsCount)
  ) {
    metadata.actionsCount = message.actionsCount;
  }
  return Object.keys(metadata).length > 0
    ? (metadata as RunnerLog["metadata"])
    : undefined;
}

export function sanitizeRunnerBudgetMessage(value: string): string {
  return String(value || "")
    .replace(
      /Insufficient budget:\s*Insufficient balance:\s*\$-?\d+(?:\.\d+)?\.?\s*Please add funds\.?/gi,
      "Insufficient budget: Insufficient balance. Please add credits or upgrade your plan to continue."
    )
    .replace(
      /Insufficient balance:\s*\$-?\d+(?:\.\d+)?\.?\s*Please add funds\.?/gi,
      "Insufficient balance. Please add credits or upgrade your plan to continue."
    )
    .replace(/\bcompute tokens\b/gi, "credits");
}

function isInternalAgentRuntimeFailureMessage(value: string): boolean {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }
  return (
    /\bclaw\s+worker\b/i.test(normalized) ||
    /\bclaude\s+worker\b/i.test(normalized) ||
    /\bworker\s+(?:exited|closed|is not available|produced no output|request failed|ready timeout)\b/i.test(
      normalized
    ) ||
    /\b(?:docker\s+exec|container execution)\s+failed\b/i.test(normalized) ||
    /\bcontainer no longer exists\b/i.test(normalized) ||
    /\bexited with code\s+137\b/i.test(normalized)
  );
}

function isLlmProviderUnavailableMessage(value: string): boolean {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }
  const hasUnavailableStatus =
    /\bapi returned\s+503\b/i.test(normalized) ||
    /\b503\s+service unavailable\b/i.test(normalized) ||
    /\bservice unavailable\b/i.test(normalized) ||
    /\btemporarily unavailable\b/i.test(normalized);
  const hasProviderMarker =
    /"code"\s*:\s*3045\b/i.test(normalized) ||
    /\bAiError:\s*AiError:\s*Unknown internal error\b/i.test(normalized) ||
    /\b(?:cloudflare|workers ai|moonshot|model provider|llm provider)\b/i.test(
      normalized
    );
  const hasRetryWrapper = /\bapi failed after\s+\d+\s+attempts\b/i.test(
    normalized
  );

  return (
    (hasProviderMarker && hasUnavailableStatus) ||
    (hasRetryWrapper && hasUnavailableStatus)
  );
}

function getRunnerFailureReplacement(value: string): string | null {
  if (isInternalAgentRuntimeFailureMessage(value)) {
    return AGENT_RUNTIME_INTERRUPTED_MESSAGE;
  }
  if (isLlmProviderUnavailableMessage(value)) {
    return LLM_PROVIDER_UNAVAILABLE_MESSAGE;
  }
  return null;
}

export function sanitizeRunnerMessage(value: string): string {
  const normalized = sanitizeRunnerBudgetMessage(value);
  const replacementMessage = getRunnerFailureReplacement(normalized);
  if (!replacementMessage) {
    return normalized;
  }
  const replacement = `Execution failed: ${replacementMessage}`;
  if (/\[Execution failed\]/i.test(normalized)) {
    return normalized.replace(
      /\[Execution failed\][\s\S]*$/i,
      `[Execution failed]\n${replacement}`
    );
  }
  if (/^execution failed\b/i.test(normalized.trim())) {
    return replacement;
  }
  return replacementMessage;
}

export function isRunnerModelProviderUnavailableMessage(
  value: unknown
): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = sanitizeRunnerBudgetMessage(value);
  return (
    isLlmProviderUnavailableMessage(normalized) ||
    sanitizeRunnerMessage(normalized).includes(
      LLM_PROVIDER_UNAVAILABLE_MESSAGE
    )
  );
}

export function isComputeTokenBudgetErrorMessage(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = sanitizeRunnerBudgetMessage(value)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return false;
  }
  return (
    (normalized.includes("compute tokens") &&
      (normalized.includes("insufficient") ||
        normalized.includes("balance") ||
        normalized.includes("upgrade") ||
        normalized.includes("quota"))) ||
    (normalized.includes("insufficient") &&
      (normalized.includes("budget") || normalized.includes("balance")))
  );
}

export function isComputeTokenBudgetErrorLog(
  log: RunnerLog | null | undefined
): boolean {
  if (!log) {
    return false;
  }
  const errorRecord = normalizeRecordObject(log.metadata?.error);
  const errorCode =
    typeof errorRecord?.code === "string"
      ? errorRecord.code.trim().toLowerCase()
      : "";
  if (
    errorCode === "compute_tokens_exhausted" ||
    errorCode === "insufficient_compute_tokens"
  ) {
    return true;
  }
  const metadataRecord = normalizeRecordObject(log.metadata);
  const candidates = [
    log.message,
    typeof errorRecord?.message === "string" ? errorRecord.message : "",
    typeof metadataRecord?.message === "string"
      ? metadataRecord.message
      : "",
  ];
  return candidates.some((candidate) =>
    isComputeTokenBudgetErrorMessage(candidate)
  );
}

function normalizeRunnerConversationMessageContent(value: unknown): string {
  if (typeof value === "string") {
    return sanitizeRunnerMessage(value);
  }
  if (!Array.isArray(value)) {
    return "";
  }
  const normalized = value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return "";
      }
      return getRecordString(entry as Record<string, unknown>, [
        "text",
        "content",
        "message",
      ]);
    })
    .filter(Boolean)
    .join("\n")
    .trim();
  return sanitizeRunnerMessage(normalized);
}

export function normalizeRunnerConversationMessage(
  value: unknown
): RunnerConversationMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const role = getRecordString(record, [
    "role",
    "authorRole",
    "author_role",
  ])
    .trim()
    .toLowerCase();
  if (!role) {
    return null;
  }

  const rawContent = normalizeRunnerConversationMessageContent(
    record.content ?? record.message ?? record.text
  );
  const content =
    role === "user"
      ? extractRunnerVisibleContentFromHiddenExecutionPrompt(rawContent)
      : rawContent;
  if (
    role === "user" &&
    isRunnerInternalHiddenExecutionPromptContent(rawContent) &&
    !content
  ) {
    return null;
  }
  const logMetadataCandidate = getRecordObject(record, [
    "logMetadata",
    "log_metadata",
    "messageMetadata",
    "message_metadata",
    "metadata",
  ]);
  const usageRecord = getRecordObject(record, [
    "usage",
    "tokenUsage",
    "token_usage",
  ]);
  const directAttachments = Array.isArray(record.attachments)
    ? record.attachments
    : null;
  const directModel = getRecordString(record, [
    "model",
    "modelName",
    "model_name",
    "modelId",
    "model_id",
    "runModel",
  ]);
  const directProvider = getRecordString(record, [
    "provider",
    "providerName",
    "provider_name",
    "modelProvider",
    "model_provider",
  ]);
  const directCostUsd =
    getRecordNumber(record, [
      "costUsd",
      "costUSD",
      "cost_usd",
      "totalCostUsd",
      "total_cost_usd",
      "usdCost",
      "usd_cost",
    ]) ??
    getRecordNumber(usageRecord, [
      "costUsd",
      "costUSD",
      "cost_usd",
      "totalCostUsd",
      "total_cost_usd",
      "usdCost",
      "usd_cost",
    ]);
  const explicitComputeTokens =
    getRecordNumber(record, [
      "computeTokens",
      "compute_tokens",
      "costCT",
      "costCt",
      "cost_ct",
      "ct",
      "totalComputeTokens",
      "total_compute_tokens",
    ]) ??
    getRecordNumber(usageRecord, [
      "computeTokens",
      "compute_tokens",
      "costCT",
      "costCt",
      "cost_ct",
      "ct",
      "totalComputeTokens",
      "total_compute_tokens",
    ]);
  const directComputeTokens =
    explicitComputeTokens ??
    (directCostUsd !== null
      ? Math.round(
          directCostUsd * RUNNER_COMPUTE_TOKENS_PER_DOLLAR
        )
      : null);
  const inputTokens =
    getRecordNumber(record, ["inputTokens", "input_tokens"]) ??
    getRecordNumber(usageRecord, ["inputTokens", "input_tokens"]);
  const outputTokens =
    getRecordNumber(record, ["outputTokens", "output_tokens"]) ??
    getRecordNumber(usageRecord, ["outputTokens", "output_tokens"]);
  const durationMs = getRecordNumber(record, ["durationMs", "duration_ms"]);
  const actionsCount = getRecordNumber(record, [
    "actionsCount",
    "actions_count",
  ]);
  const directRunMetadata: Record<string, unknown> = {};
  if (directModel) {
    directRunMetadata.model = directModel;
  }
  if (directProvider) {
    directRunMetadata.provider = directProvider;
  }
  if (directCostUsd !== null) {
    directRunMetadata.costUsd = directCostUsd;
    directRunMetadata.costUSD = directCostUsd;
    directRunMetadata.cost_usd = directCostUsd;
  }
  if (directComputeTokens !== null) {
    directRunMetadata.computeTokens = directComputeTokens;
    directRunMetadata.costCT = directComputeTokens;
    directRunMetadata.costCt = directComputeTokens;
  }
  const logMetadata =
    logMetadataCandidate ||
    directAttachments ||
    Object.keys(directRunMetadata).length > 0
      ? {
          ...(logMetadataCandidate || {}),
          ...directRunMetadata,
          ...(directAttachments ? { attachments: directAttachments } : {}),
        }
      : null;

  return {
    id:
      getRecordString(record, ["id", "messageId", "message_id"]) ||
      undefined,
    role,
    content,
    createdAt:
      getRecordString(record, [
        "createdAt",
        "created_at",
        "created",
        "timestamp",
      ]) || undefined,
    inputTokens,
    outputTokens,
    durationMs,
    actionsCount,
    logMetadata,
  };
}

export function sortRunnerConversationMessagesChronologically(
  messages: RunnerConversationMessage[]
): RunnerConversationMessage[] {
  if (messages.length < 2) {
    return messages;
  }

  const entries = messages.map((message, index) => ({
    message,
    index,
    timestampMs: parseIsoTimestampMs(message.createdAt),
  }));
  const canonicalEntries = entries.filter(
    (entry) =>
      entry.message.role === "user" ||
      entry.message.role === "assistant"
  );
  const canSort =
    entries.every((entry) => entry.timestampMs !== null) ||
    (canonicalEntries.length > 0 &&
      canonicalEntries.every((entry) => entry.timestampMs !== null));
  if (!canSort) {
    return messages;
  }

  return [...entries]
    .sort((left, right) => {
      if (left.timestampMs === null || right.timestampMs === null) {
        if (left.timestampMs === null && right.timestampMs === null) {
          return left.index - right.index;
        }
        return left.timestampMs === null ? 1 : -1;
      }
      if (left.timestampMs !== right.timestampMs) {
        return left.timestampMs - right.timestampMs;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.message);
}

function getProjectMentionMessageIdentity(
  message: RunnerConversationMessage,
): string | null {
  if (message.role !== "user") {
    return null;
  }
  const metadata = normalizeRecordObject(message.logMetadata);
  const mention = getRecordObject(metadata, ["projectMention", "project_mention"]);
  const source = getRecordObject(mention, ["source", "mentionSource", "mention_source"]);
  const sourceId = getRecordString(source, ["id", "sourceId", "source_id"]).trim();
  if (!sourceId) {
    return null;
  }
  const sourceType = getRecordString(source, ["type", "sourceType", "source_type"])
    .trim()
    .toLowerCase();
  const projectId = getRecordString(source, ["projectId", "project_id"]).trim();
  return ["project-mention", sourceType, sourceId, projectId].join(":");
}

function mergeDuplicateConversationMessages(
  previous: RunnerConversationMessage,
  next: RunnerConversationMessage,
): RunnerConversationMessage {
  const previousMetadata = normalizeRecordObject(previous.logMetadata);
  const nextMetadata = normalizeRecordObject(next.logMetadata);
  return {
    ...previous,
    inputTokens: previous.inputTokens ?? next.inputTokens,
    outputTokens: previous.outputTokens ?? next.outputTokens,
    durationMs: previous.durationMs ?? next.durationMs,
    actionsCount: previous.actionsCount ?? next.actionsCount,
    id: previous.id || next.id,
    content: previous.content || next.content,
    createdAt: previous.createdAt || next.createdAt,
    logMetadata: previousMetadata || nextMetadata
      ? { ...(nextMetadata || {}), ...(previousMetadata || {}) }
      : null,
  };
}

/**
 * Message history can temporarily contain both a legacy row and one or more
 * canonical event projections for the same persisted message. Collapse them
 * by durable ID and, for retry-safe Project mentions, by their source record.
 * Ordinary repeated prose remains distinct.
 */
export function dedupeRunnerConversationMessages(
  messages: RunnerConversationMessage[],
): RunnerConversationMessage[] {
  if (messages.length < 2) {
    return messages;
  }
  const result: RunnerConversationMessage[] = [];
  const indexById = new Map<string, number>();
  const indexByMention = new Map<string, number>();
  const indexByIdlessTimestamp = new Map<string, number>();

  for (const message of messages) {
    const id = String(message.id || "").trim();
    const mentionIdentity = getProjectMentionMessageIdentity(message);
    const idlessIdentity = !id && message.createdAt
      ? `${message.role}\u0000${message.createdAt}\u0000${message.content}`
      : null;
    const existingIndex = mentionIdentity !== null && indexByMention.has(mentionIdentity)
      ? indexByMention.get(mentionIdentity)
      : id && indexById.has(id)
        ? indexById.get(id)
        : idlessIdentity !== null && indexByIdlessTimestamp.has(idlessIdentity)
          ? indexByIdlessTimestamp.get(idlessIdentity)
          : undefined;

    if (existingIndex !== undefined) {
      const merged = mergeDuplicateConversationMessages(result[existingIndex], message);
      result[existingIndex] = merged;
      if (id) indexById.set(id, existingIndex);
      if (merged.id) indexById.set(merged.id, existingIndex);
      if (mentionIdentity) indexByMention.set(mentionIdentity, existingIndex);
      if (idlessIdentity) indexByIdlessTimestamp.set(idlessIdentity, existingIndex);
      continue;
    }

    const index = result.length;
    result.push(message);
    if (id) indexById.set(id, index);
    if (mentionIdentity) indexByMention.set(mentionIdentity, index);
    if (idlessIdentity) indexByIdlessTimestamp.set(idlessIdentity, index);
  }
  return result;
}

export function getRunnerLogAbsoluteTimestampMs(
  log: RunnerLog
): number | null {
  const createdAtMs = parseIsoTimestampMs(log.createdAt);
  if (createdAtMs !== null) {
    return createdAtMs;
  }
  return parseIsoTimestampMs(log.time);
}

export function sortRunnerLogsChronologically(logs: RunnerLog[]): RunnerLog[] {
  if (logs.length < 2) {
    return logs;
  }

  const entries = logs.map((log, index) => ({
    log,
    index,
    timestampMs: getRunnerLogAbsoluteTimestampMs(log),
  }));
  if (!entries.every((entry) => entry.timestampMs !== null)) {
    return logs;
  }

  return [...entries]
    .sort((left, right) => {
      if (left.timestampMs !== right.timestampMs) {
        return (left.timestampMs ?? 0) - (right.timestampMs ?? 0);
      }
      return left.index - right.index;
    })
    .map((entry) => entry.log);
}

function getRunnerLogMetadataRecord(
  log: RunnerLog | null | undefined
): Record<string, unknown> | null {
  const metadata = log?.metadata;
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : null;
}

function getRunnerLogNumber(
  log: RunnerLog | null | undefined,
  keys: string[]
): number | null {
  return (
    getRecordNumber(getRunnerLogMetadataRecord(log), keys) ??
    getRecordNumber(
      log as Record<string, unknown> | null | undefined,
      keys
    )
  );
}

export function mergeConversationMessageRunMetadataFromLogs(
  messages: RunnerConversationMessage[],
  logs: RunnerLog[]
): RunnerConversationMessage[] {
  if (messages.length === 0 || logs.length === 0) {
    return messages;
  }

  const assistantResponseLogs = logs.filter(
    (log) =>
      log.eventType === "agent_message" ||
      log.eventType === "llm_response"
  );
  const completionLogs = logs.filter(
    (log) => log.eventType === "turn_completed"
  );
  if (assistantResponseLogs.length === 0 && completionLogs.length === 0) {
    return messages;
  }

  let changed = false;
  let assistantLogIndex = 0;
  let completionLogIndex = 0;

  const nextMessages = messages.map((message) => {
    if (message.role !== "assistant") {
      return message;
    }

    const responseLog = assistantResponseLogs[assistantLogIndex++] || null;
    const completionLog = completionLogs[completionLogIndex++] || null;
    const responseMetadata = getRunnerLogMetadataRecord(responseLog);
    const completionMetadata = getRunnerLogMetadataRecord(completionLog);
    const messageMetadata =
      message.logMetadata &&
      typeof message.logMetadata === "object" &&
      !Array.isArray(message.logMetadata)
        ? message.logMetadata
        : null;
    const mergedMetadata = {
      ...(responseMetadata || {}),
      ...(completionMetadata || {}),
      ...(messageMetadata || {}),
    };
    const hasMergedMetadata = Object.keys(mergedMetadata).length > 0;
    const inputTokens =
      message.inputTokens ??
      getRunnerLogNumber(responseLog, ["inputTokens", "input_tokens"]) ??
      getRunnerLogNumber(completionLog, ["inputTokens", "input_tokens"]);
    const outputTokens =
      message.outputTokens ??
      getRunnerLogNumber(responseLog, ["outputTokens", "output_tokens"]) ??
      getRunnerLogNumber(completionLog, ["outputTokens", "output_tokens"]);
    const durationMs =
      message.durationMs ??
      getRunnerLogNumber(responseLog, ["durationMs", "duration_ms"]) ??
      getRunnerLogNumber(completionLog, ["durationMs", "duration_ms"]);
    const actionsCount =
      message.actionsCount ??
      getRunnerLogNumber(responseLog, ["actionsCount", "actions_count"]) ??
      getRunnerLogNumber(completionLog, ["actionsCount", "actions_count"]);

    if (
      !hasMergedMetadata &&
      inputTokens === message.inputTokens &&
      outputTokens === message.outputTokens &&
      durationMs === message.durationMs &&
      actionsCount === message.actionsCount
    ) {
      return message;
    }

    changed = true;
    return {
      ...message,
      inputTokens,
      outputTokens,
      durationMs,
      actionsCount,
      logMetadata: hasMergedMetadata
        ? mergedMetadata
        : message.logMetadata,
    };
  });

  return changed ? nextMessages : messages;
}

export async function fetchAllThreadMessages(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerConversationMessage[]> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  const pageSize = 200;
  const messages: RunnerConversationMessage[] = [];
  let offset = 0;

  while (true) {
    const response = await fetch(
      `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/messages?limit=${pageSize}&offset=${offset}&compact=1`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const body = await response.text();
    let parsed: {
      data?: unknown[];
      message?: string;
      error?: string;
      has_more?: boolean;
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
          `Failed to load thread messages (${response.status})`
      );
    }

    const pageItems = Array.isArray(parsed.data)
      ? parsed.data
          .map(normalizeRunnerConversationMessage)
          .filter(
            (message): message is RunnerConversationMessage =>
              Boolean(message)
          )
      : [];
    messages.push(...pageItems);

    if (!parsed.has_more || pageItems.length === 0) {
      break;
    }
    offset += pageItems.length;
  }

  return sortRunnerConversationMessagesChronologically(
    dedupeRunnerConversationMessages(messages),
  );
}
