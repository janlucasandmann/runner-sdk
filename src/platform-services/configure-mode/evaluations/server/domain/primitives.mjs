import { createHash } from "node:crypto";

export const EVALUATION_RUN_TTL_MS = 1000 * 60 * 60 * 6;
export const EVALUATION_CT_PER_DOLLAR = 100;
export const EVALUATION_FINGERPRINT_ALGORITHM = "sha256";
export const EVALUATION_FINGERPRINT_SCHEMA_VERSION = "evaluation_fingerprint_v1";

export function createEvaluationId(prefix = "eval") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeString(value) {
  return String(value || "").trim();
}

export function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeFingerprintValue(value, seen = new WeakSet()) {
  if (value === null) return null;
  if (value === undefined || typeof value === "function" || typeof value === "symbol") return undefined;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (seen.has(value)) {
    throw new TypeError("Evaluation fingerprints cannot be created from cyclic values.");
  }
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) => {
        const normalized = normalizeFingerprintValue(item, seen);
        return normalized === undefined ? null : normalized;
      });
    }
    return Object.keys(value)
      .sort()
      .reduce((record, key) => {
        const normalized = normalizeFingerprintValue(value[key], seen);
        if (normalized !== undefined) record[key] = normalized;
        return record;
      }, {});
  } finally {
    seen.delete(value);
  }
}

export function stableSerializeEvaluationValue(value) {
  return JSON.stringify(normalizeFingerprintValue(value));
}

export function createEvaluationFingerprint(namespace, value) {
  const normalizedNamespace = normalizeString(namespace) || "evaluation";
  const digest = createHash(EVALUATION_FINGERPRINT_ALGORITHM)
    .update(EVALUATION_FINGERPRINT_SCHEMA_VERSION)
    .update("\n")
    .update(normalizedNamespace)
    .update("\n")
    .update(stableSerializeEvaluationValue(value))
    .digest("hex");
  return `${EVALUATION_FINGERPRINT_ALGORITHM}:${digest}`;
}

export function normalizeEvaluator(rawEvaluator = {}) {
  const source = rawEvaluator && typeof rawEvaluator === "object" && !Array.isArray(rawEvaluator) ? rawEvaluator : {};
  const rawType = normalizeString(source.type || source.evaluatorType).toLowerCase();
  const configuration = source.configuration
    && typeof source.configuration === "object"
    && !Array.isArray(source.configuration)
    ? source.configuration
    : {};
  return {
    type: ["agent", "code", "deterministic", "exact"].includes(rawType) ? rawType : "exact",
    agentId: normalizeString(source.agentId || source.agent_id),
    agentVersionId: normalizeString(
      source.agentVersionId
        || source.agent_version_id
        || source.versionId
        || source.version_id,
    ),
    agentVersionNumber: Math.max(
      0,
      Number(
        source.agentVersionNumber
          || source.agent_version_number
          || source.versionNumber
          || source.version_number
          || source.version
          || 0,
      ) || 0,
    ),
    agentVersionLabel: normalizeString(
      source.agentVersionLabel
        || source.agent_version_label
        || source.versionLabel
        || source.version_label,
    ),
    agentVersionRevisionId: normalizeString(
      source.agentVersionRevisionId
        || source.agent_version_revision_id
        || source.revisionId
        || source.revision_id,
    ),
    code: String(source.code || ""),
    graderId: normalizeString(
      source.graderId
        || source.grader_id
        || source.name,
    ).toLowerCase(),
    configuration,
  };
}

export function normalizePersonIdentity(rawValue = {}) {
  if (typeof rawValue === "string") {
    const value = normalizeString(rawValue);
    return {
      id: value,
      userId: "",
      name: value.includes("@") ? "" : value,
      email: value.includes("@") ? value : "",
      avatarUrl: "",
    };
  }
  const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
  return {
    id: normalizeString(source.id || source.userId || source.user_id || source.uid || source.email),
    userId: normalizeString(source.userId || source.user_id || source.uid),
    name: normalizeString(source.name || source.displayName || source.display_name || source.label || source.title),
    email: normalizeString(source.email || source.mail),
    avatarUrl: normalizeString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
  };
}

export function getCreatorIdentity(source = {}) {
  const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
  const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const nested = record.creator || record.createdBy || record.created_by || metadata.creator || metadata.createdBy || metadata.created_by || record.owner || metadata.owner || null;
  const direct = normalizePersonIdentity({
    id: record.creatorId || record.creator_id || record.createdById || record.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
    userId: record.creatorUserId || record.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || record.userId || record.user_id,
    name: record.creatorName || record.creator_name || record.createdByName || record.created_by_name || metadata.creatorName || metadata.creator_name || metadata.createdByName || metadata.created_by_name,
    email: record.creatorEmail || record.creator_email || record.createdByEmail || record.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email,
    avatarUrl: record.creatorAvatarUrl || record.creator_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.creatorAvatarUrl || metadata.creator_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
  });
  const nestedIdentity = normalizePersonIdentity(nested || {});
  return {
    id: nestedIdentity.id || direct.id,
    userId: nestedIdentity.userId || direct.userId,
    name: nestedIdentity.name || direct.name,
    email: nestedIdentity.email || direct.email,
    avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
  };
}

export function normalizePassThreshold(value, fallback = 0.8) {
  const fallbackScore = Math.max(0, Math.min(1, Number(fallback) || 0.8));
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallbackScore;
  const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;
  return Math.max(0, Math.min(1, normalizedValue));
}

export function normalizeTokenCount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
}

export function normalizeUsdCost(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
}

export function normalizeRunCount(value, fallback = 1) {
  const fallbackCount = Math.max(1, Math.min(50, Math.round(Number(fallback) || 1)));
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallbackCount;
  return Math.max(1, Math.min(50, Math.round(numericValue)));
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
  const tokenCount = readComputeTokenValue(source);
  return tokenCount > 0 ? tokenCount / EVALUATION_CT_PER_DOLLAR : 0;
}
