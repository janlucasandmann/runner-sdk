import {
  FINE_TUNING_CT_PER_DOLLAR,
  clampScore,
  compactFineTuningReferenceMetadata,
  computeTokensToUsd,
  hasPlainObjectContent,
  normalizeResponseArray,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readFirstPlainObject,
  readPlainObject,
  sanitizeReferenceText,
} from "./primitives.mjs";

export function getRecordType(record) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  return normalizeString(source.eventType || source.event_type || source.type || source.kind || metadata.eventType || metadata.event_type || metadata.type).toLowerCase();
}

export function getRecordTimestamp(record) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  return normalizeString(source.timestamp || source.createdAt || source.created_at || source.completedAt || source.completed_at || source.time || source.at);
}

export function readFineTuningRecordText(value, depth = 0) {
  if (value === null || value === undefined || depth > 5) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    return value.map((item) => readFineTuningRecordText(item, depth + 1)).filter(Boolean).join("\n").trim();
  }
  if (typeof value !== "object") return "";
  const source = value;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const candidates = [
    source.output_text,
    source.outputText,
    source.finalMessage,
    source.final_message,
    source.summary,
    source.runSummary,
    source.run_summary,
    source.result,
    source.output,
    source.response,
    source.content,
    source.text,
    source.message,
    source.message?.content,
    source.data?.content,
    source.data?.message,
    metadata.output_text,
    metadata.outputText,
    metadata.finalMessage,
    metadata.final_message,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
    metadata.result,
    metadata.output,
    metadata.response,
    metadata.content,
    metadata.text,
    metadata.message,
  ];
  for (const candidate of candidates) {
    const text = readFineTuningRecordText(candidate, depth + 1);
    if (text) return text;
  }
  return "";
}

export function extractFineTuningThreadSummaryFromRecords(records) {
  const orderedRecords = (Array.isArray(records) ? records : [])
    .filter((record) => record && typeof record === "object")
    .sort((left, right) => getRecordTimestamp(left).localeCompare(getRecordTimestamp(right)));
  const preferredRecords = orderedRecords.filter((record) => {
    const type = getRecordType(record);
    const role = normalizeString(record?.role || record?.messageRole || record?.message_role).toLowerCase();
    return role === "assistant" || type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const candidates = preferredRecords.length ? preferredRecords : orderedRecords;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const text = sanitizeFineTuningAnalysisText(readFineTuningRecordText(candidates[index]));
    if (!text) continue;
    if (text.includes("You are running a fine-tuning analysis job")) continue;
    if (text.includes("Required execution path:")) continue;
    return text;
  }
  return "";
}

export function readComputeTokenValue(source) {
  if (!source || typeof source !== "object") return 0;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const usage = source.usage && typeof source.usage === "object" && !Array.isArray(source.usage) ? source.usage : {};
  const candidates = [
    source.costTokens,
    source.cost_tokens,
    source.costCt,
    source.costCT,
    source.cost_ct,
    source.computeTokens,
    source.compute_tokens,
    source.totalCT,
    source.totalCt,
    source.total_ct,
    source.ct,
    usage.costTokens,
    usage.cost_tokens,
    usage.costCt,
    usage.costCT,
    usage.cost_ct,
    usage.computeTokens,
    usage.compute_tokens,
    usage.totalCT,
    usage.totalCt,
    usage.total_ct,
    usage.ct,
    metadata.costTokens,
    metadata.cost_tokens,
    metadata.costCt,
    metadata.costCT,
    metadata.cost_ct,
    metadata.computeTokens,
    metadata.compute_tokens,
    metadata.totalCT,
    metadata.totalCt,
    metadata.total_ct,
    metadata.ct,
  ];
  for (const candidate of candidates) {
    const tokenCount = normalizeTokenCount(candidate);
    if (tokenCount > 0) return tokenCount;
  }
  return 0;
}

export function readUsdCostValue(source) {
  if (!source || typeof source !== "object") return 0;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const usage = source.usage && typeof source.usage === "object" && !Array.isArray(source.usage) ? source.usage : {};
  const candidates = [
    source.costUsd,
    source.costUSD,
    source.cost_usd,
    source.usdCost,
    source.usd_cost,
    source.totalCostUsd,
    source.totalCostUSD,
    source.total_cost_usd,
    source.totalUsd,
    source.totalUSD,
    source.total_usd,
    usage.costUsd,
    usage.costUSD,
    usage.cost_usd,
    usage.usdCost,
    usage.usd_cost,
    usage.totalCostUsd,
    usage.totalCostUSD,
    usage.total_cost_usd,
    usage.totalUsd,
    usage.totalUSD,
    usage.total_usd,
    metadata.costUsd,
    metadata.costUSD,
    metadata.cost_usd,
    metadata.usdCost,
    metadata.usd_cost,
    metadata.totalCostUsd,
    metadata.totalCostUSD,
    metadata.total_cost_usd,
    metadata.totalUsd,
    metadata.totalUSD,
    metadata.total_usd,
  ];
  for (const candidate of candidates) {
    const usdCost = normalizeUsdCost(candidate);
    if (usdCost > 0) return usdCost;
  }
  return 0;
}

export function readNestedCostValues(value, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) {
    return { costTokens: 0, costUsd: 0 };
  }
  seen.add(value);
  const directTokens = readComputeTokenValue(value);
  const directUsd = readUsdCostValue(value);
  if (directTokens > 0 || directUsd > 0) {
    return { costTokens: directTokens, costUsd: directUsd };
  }
  const nestedValues = [
    value.usage,
    value.tokenUsage,
    value.token_usage,
    value.metrics,
    value.billing,
    value.cost,
    value.result,
    value.response,
    value.metadata,
  ].map((candidate) => readNestedCostValues(candidate, depth + 1, seen));
  return nestedValues.reduce((best, item) => ({
    costTokens: Math.max(best.costTokens, item.costTokens),
    costUsd: Math.max(best.costUsd, item.costUsd),
  }), { costTokens: 0, costUsd: 0 });
}

export function extractThreadCosts(records) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  const preferredRecords = sourceRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const recordsForCost = preferredRecords.length > 0 ? preferredRecords : sourceRecords;
  const seenCostKeys = new Set();
  const totals = recordsForCost.reduce((sum, record, index) => {
    const costs = readNestedCostValues(record);
    if (costs.costTokens <= 0 && costs.costUsd <= 0) return sum;
    const timestamp = getRecordTimestamp(record);
    const type = getRecordType(record);
    const key = timestamp || type
      ? [timestamp, type, String(costs.costTokens), String(costs.costUsd)].join("|")
      : [normalizeString(record.id || record.logId || record.log_id || record.stepId || record.step_id) || String(index), String(costs.costTokens), String(costs.costUsd)].join("|");
    if (seenCostKeys.has(key)) return sum;
    seenCostKeys.add(key);
    return {
      costTokens: sum.costTokens + costs.costTokens,
      costUsd: sum.costUsd + costs.costUsd,
    };
  }, { costTokens: 0, costUsd: 0 });
  return {
    costTokens: totals.costTokens,
    costUsd: totals.costUsd || computeTokensToUsd(totals.costTokens),
  };
}


