export function parsePlatformOverviewDurationMs(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^(-?\d+(?:\.\d+)?)(ms|s|m|h)$/i);
  if (!match) return null;
  const magnitude = Number(match[1]);
  if (!Number.isFinite(magnitude) || magnitude < 0) return null;
  const unit = String(match[2] || "").toLowerCase();
  if (unit === "ms") return magnitude;
  if (unit === "s") return magnitude * 1_000;
  if (unit === "m") return magnitude * 60_000;
  if (unit === "h") return magnitude * 60 * 60_000;
  return null;
}

export function resolvePlatformOverviewDurationMs(record) {
  const environmentMinutes = Number(record?.environmentMinutes);
  if (Number.isFinite(environmentMinutes) && environmentMinutes >= 0) {
    return environmentMinutes * 60_000;
  }
  const directDurationMs = Number(record?.durationMs);
  if (Number.isFinite(directDurationMs) && directDurationMs >= 0) {
    return directDurationMs;
  }
  const metadata = record?.metadata
    && typeof record.metadata === "object"
    && !Array.isArray(record.metadata)
    ? record.metadata
    : null;
  for (const candidate of [metadata?.duration_ms, metadata?.durationMs]) {
    const duration = Number(candidate);
    if (Number.isFinite(duration) && duration >= 0) return duration;
  }
  const startedAtMs = Date.parse(String(record?.startedAt || ""));
  const completedAtMs = Date.parse(String(record?.completedAt || ""));
  if (
    Number.isFinite(startedAtMs)
    && Number.isFinite(completedAtMs)
    && completedAtMs >= startedAtMs
  ) {
    return completedAtMs - startedAtMs;
  }
  return parsePlatformOverviewDurationMs(record?.duration);
}

export function resolvePlatformOverviewTimestampMs(record) {
  const candidates = [
    record?.timestamp,
    record?.startedAt,
    record?.completedAt,
    record?.lastSignInAt,
    record?.updatedAt,
    record?.createdAt,
  ];
  for (const candidate of candidates) {
    const timestampMs = Date.parse(String(candidate || ""));
    if (Number.isFinite(timestampMs)) return timestampMs;
  }
  return null;
}

export function normalizePlatformOverviewServerKind(kind) {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  if ([
    "function",
    "database",
    "api",
    "auth",
    "agent_runtime",
    "secrets",
  ].includes(normalizedKind)) {
    return normalizedKind;
  }
  if (normalizedKind === "payments" || normalizedKind === "payment") {
    return "payments";
  }
  return "web_app";
}

export function extractPlatformOverviewItems(data, preferredKeys = []) {
  const keys = [
    ...preferredKeys,
    "data",
    "items",
    "servers",
    "databases",
    "users",
    "runs",
  ];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return Array.isArray(data) ? data : [];
}
