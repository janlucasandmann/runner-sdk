export const FINE_TUNING_JOB_TTL_MS = 1000 * 60 * 60 * 8;
export const FINE_TUNING_CT_PER_DOLLAR = 100;

export function normalizeString(value) {
  return String(value || "").trim();
}

export function normalizePersonIdentity(rawValue = {}) {
  const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
  return {
    id: normalizeString(source.id || source.userId || source.user_id || source.uid || source.email),
    userId: normalizeString(source.userId || source.user_id || source.uid),
    name: normalizeString(source.name || source.displayName || source.display_name || source.label || source.title),
    email: normalizeString(source.email || source.mail),
    avatarUrl: normalizeString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
  };
}

export function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function createFineTuningId(prefix = "fine_tune_job") {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

export function clampScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

export function normalizeTokenCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
}

export function normalizeUsdCost(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

export function isFineTuningRuntimeActiveStatus(status) {
  return new Set([
    "active",
    "analysis",
    "analyzing",
    "creating_agent_version",
    "creating-version",
    "creating_version",
    "evaluating",
    "fine-tuning",
    "fine_tuning",
    "in-progress",
    "in_progress",
    "pending",
    "processing",
    "publishing",
    "publishing_version",
    "queued",
    "running",
    "running_case",
    "running_evaluator",
    "scoring",
    "started",
    "verification",
    "verifying",
    "verifying_evaluation",
    "waiting_for_case_summary",
  ]).has(
    normalizeString(status).toLowerCase()
  );
}

export function computeTokensToUsd(value) {
  return normalizeTokenCount(value) / FINE_TUNING_CT_PER_DOLLAR;
}

export function normalizeResponseArray(data, keys = []) {
  const source = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
    if (Array.isArray(source.data?.[key])) return source.data[key];
  }
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.data)) return source.data;
  if (Array.isArray(source.records)) return source.records;
  return [];
}

export function readPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function hasPlainObjectContent(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

export function readFirstPlainObject(...values) {
  for (const value of values) {
    if (hasPlainObjectContent(value)) return value;
  }
  return {};
}

export function sanitizeReferenceText(value, maxLength = 2400) {
  const text = String(value || "");
  if (!maxLength || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\n\n...";
}

export function compactFineTuningReferenceMetadata(metadata) {
  const source = readPlainObject(metadata);
  const blockedKeys = new Set([
    "beforeAgentSnapshot",
    "before_agent_snapshot",
    "afterAgentSnapshot",
    "after_agent_snapshot",
    "beforeSnapshot",
    "before_snapshot",
    "afterSnapshot",
    "after_snapshot",
    "baseAgentSnapshot",
    "base_agent_snapshot",
    "snapshot",
    "diffFiles",
    "diff_files",
    "diffs",
    "files",
  ]);
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !blockedKeys.has(key))
  );
}


