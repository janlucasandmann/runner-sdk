import {
  EVALUATION_CT_PER_DOLLAR,
  createEvaluationId,
  getCreatorIdentity,
  normalizeEvaluator,
  normalizePassThreshold,
  normalizePersonIdentity,
  normalizeRunCount,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readComputeTokenValue,
  readUsdCostValue,
} from "./primitives.mjs";
import {
  extractFinalSummaryFromRecords,
  extractStreamSummary,
  getRecordTimestamp,
  getRecordType,
  normalizeCaseRefinementResult,
  normalizeResponseArray,
  normalizeSourceThreadRecord,
  readRecordText,
  takeSourceThreadContext,
} from "./records.mjs";

export function compactSnapshotRecord(record) {
  if (!record || typeof record !== "object") return null;
  const text = readRecordText(record);
  return {
    id: normalizeString(record.id || record.messageId || record.message_id || record.stepId || record.step_id),
    type: getRecordType(record),
    createdAt: getRecordTimestamp(record),
    text: text.length > 1800 ? `${text.slice(0, 1800).trimEnd()}...` : text,
  };
}

export function readNestedComputeTokenValue(value, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) {
    return 0;
  }
  seen.add(value);
  const directValue = readComputeTokenValue(value);
  if (directValue > 0) return directValue;
  const candidates = [];
  [
    value.usage,
    value.tokenUsage,
    value.token_usage,
    value.metrics,
    value.billing,
    value.cost,
    value.result,
    value.response,
    value.metadata,
  ].forEach((candidate) => {
    const tokenCount = readNestedComputeTokenValue(candidate, depth + 1, seen);
    if (tokenCount > 0) candidates.push(tokenCount);
  });
  return candidates.length > 0 ? Math.max(...candidates) : 0;
}

export function readNestedUsdCostValue(value, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) {
    return 0;
  }
  seen.add(value);
  const directValue = readUsdCostValue(value);
  if (directValue > 0) return directValue;
  const candidates = [];
  [
    value.usage,
    value.tokenUsage,
    value.token_usage,
    value.metrics,
    value.billing,
    value.cost,
    value.result,
    value.response,
    value.metadata,
  ].forEach((candidate) => {
    const usdCost = readNestedUsdCostValue(candidate, depth + 1, seen);
    if (usdCost > 0) candidates.push(usdCost);
  });
  return candidates.length > 0 ? Math.max(...candidates) : 0;
}

export function extractThreadCostTokens(records) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  const explicitThreadTotals = sourceRecords
    .map((record) => {
      const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
      return normalizeTokenCount(
        record.totalCT
        ?? record.totalCt
        ?? record.total_ct
        ?? record.totalCostCT
        ?? record.total_cost_ct
        ?? record.threadCT
        ?? record.threadCt
        ?? record.thread_ct
        ?? metadata.totalCT
        ?? metadata.totalCt
        ?? metadata.total_ct
        ?? metadata.totalCostCT
        ?? metadata.total_cost_ct
        ?? metadata.threadCT
        ?? metadata.threadCt
        ?? metadata.thread_ct
      );
    })
    .filter((count) => count > 0);
  if (explicitThreadTotals.length > 0) {
    return Math.max(...explicitThreadTotals);
  }
  const preferredRecords = sourceRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const recordsForCost = preferredRecords.length > 0 ? preferredRecords : sourceRecords;
  const seenCostKeys = new Set();
  return recordsForCost.reduce((sum, record, index) => {
    const tokenCount = readNestedComputeTokenValue(record);
    if (tokenCount <= 0) return sum;
    const timestamp = getRecordTimestamp(record);
    const type = getRecordType(record);
    const key = timestamp || type
      ? [timestamp, type, String(tokenCount)].join("|")
      : [normalizeString(record.id || record.logId || record.log_id || record.stepId || record.step_id) || String(index), String(tokenCount)].join("|");
    if (seenCostKeys.has(key)) return sum;
    seenCostKeys.add(key);
    return sum + tokenCount;
  }, 0);
}

export function extractThreadCostUsd(records) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  const explicitThreadTotals = sourceRecords
    .map((record) => {
      const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
      return normalizeUsdCost(
        record.totalUsd
        ?? record.totalUSD
        ?? record.total_usd
        ?? record.totalCostUsd
        ?? record.total_cost_usd
        ?? record.threadUsd
        ?? record.threadUSD
        ?? record.thread_usd
        ?? metadata.totalUsd
        ?? metadata.totalUSD
        ?? metadata.total_usd
        ?? metadata.totalCostUsd
        ?? metadata.total_cost_usd
        ?? metadata.threadUsd
        ?? metadata.threadUSD
        ?? metadata.thread_usd
      );
    })
    .filter((cost) => cost > 0);
  if (explicitThreadTotals.length > 0) {
    return Math.max(...explicitThreadTotals);
  }
  const preferredRecords = sourceRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const recordsForCost = preferredRecords.length > 0 ? preferredRecords : sourceRecords;
  const seenCostKeys = new Set();
  const directUsd = recordsForCost.reduce((sum, record, index) => {
    const usdCost = readNestedUsdCostValue(record);
    if (usdCost <= 0) return sum;
    const timestamp = getRecordTimestamp(record);
    const type = getRecordType(record);
    const key = timestamp || type
      ? [timestamp, type, String(usdCost)].join("|")
      : [normalizeString(record.id || record.logId || record.log_id || record.stepId || record.step_id) || String(index), String(usdCost)].join("|");
    if (seenCostKeys.has(key)) return sum;
    seenCostKeys.add(key);
    return sum + usdCost;
  }, 0);
  if (directUsd > 0) return directUsd;
  const tokenCost = extractThreadCostTokens(recordsForCost);
  return tokenCost > 0 ? tokenCost / EVALUATION_CT_PER_DOLLAR : 0;
}

