import type { RunnerChatConnectorOption } from "./public-types.js";

export interface RunnerConnectorMentionInputState {
  end: number;
  query: string;
  start: number;
}

export interface RunnerConnectorMentionReplacement {
  selectionStart: number;
  value: string;
}

export function normalizeRunnerConnectorId(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function normalizeRunnerConnectorOptions(
  options: readonly RunnerChatConnectorOption[] | null | undefined,
): RunnerChatConnectorOption[] {
  const normalized: RunnerChatConnectorOption[] = [];
  const seen = new Set<string>();

  for (const option of options || []) {
    const id = normalizeRunnerConnectorId(option?.id);
    const name = String(option?.name || "").trim();
    if (!id || !name || seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push({
      ...option,
      id,
      name,
      description: String(option.description || "").trim(),
      logoUrl: String(option.logoUrl || "").trim() || undefined,
    });
  }

  return normalized;
}

export function normalizeRunnerSelectedConnectorIds(
  values: readonly string[] | null | undefined,
  availableOptions?: readonly RunnerChatConnectorOption[],
): string[] {
  const availableIds = availableOptions?.length
    ? new Set(availableOptions.map((option) => normalizeRunnerConnectorId(option.id)))
    : null;
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values || []) {
    const id = normalizeRunnerConnectorId(value);
    if (!id || seen.has(id) || (availableIds && !availableIds.has(id))) {
      continue;
    }
    seen.add(id);
    normalized.push(id);
  }

  return normalized;
}

export function resolveRunnerConnectorMentionInputState(
  value: string,
  selectionStart: number,
): RunnerConnectorMentionInputState | null {
  const cursor = Math.max(0, Math.min(value.length, selectionStart));
  const beforeCursor = value.slice(0, cursor);
  const match = /(^|[\s([{])@([^@\n]*)$/.exec(beforeCursor);
  if (!match) {
    return null;
  }

  const query = String(match[2] || "");
  if (query.length > 80) {
    return null;
  }

  const start = (match.index || 0) + String(match[1] || "").length;
  return {
    start,
    end: cursor,
    query: query.trim().toLowerCase(),
  };
}

export function replaceRunnerConnectorMention(
  value: string,
  mention: RunnerConnectorMentionInputState,
): RunnerConnectorMentionReplacement {
  const prefix = value.slice(0, mention.start);
  const rawSuffix = value.slice(mention.end);
  const suffix =
    !prefix || /\s$/.test(prefix)
      ? rawSuffix.replace(/^\s+/, "")
      : rawSuffix;
  const shouldInsertSpace =
    Boolean(prefix)
    && !/\s$/.test(prefix)
    && Boolean(suffix)
    && !/^\s/.test(suffix);
  const insertion = shouldInsertSpace ? " " : "";

  return {
    value: `${prefix}${insertion}${suffix}`,
    selectionStart: prefix.length + insertion.length,
  };
}

export function filterRunnerConnectorOptions(
  options: readonly RunnerChatConnectorOption[],
  query: string,
): RunnerChatConnectorOption[] {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [...options];
  }

  return options.filter((option) => {
    const searchValue = [
      option.id,
      option.name,
      option.description,
      ...(option.keywords || []),
    ]
      .join(" ")
      .toLowerCase();
    return searchValue.includes(normalizedQuery);
  });
}

export function buildRunnerConnectorPayload(
  connectorIds: readonly string[] | null | undefined,
): Record<string, unknown> | null {
  const normalizedIds = normalizeRunnerSelectedConnectorIds(connectorIds);
  if (!normalizedIds.length) {
    return null;
  }

  return Object.fromEntries(
    normalizedIds.map((id) => [id, { enabled: true }]),
  );
}

export function mergeRunnerConnectorPayloads(
  ...payloads: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> | null {
  const merged: Record<string, unknown> = {};

  for (const payload of payloads) {
    if (!payload) {
      continue;
    }
    for (const [id, value] of Object.entries(payload)) {
      const current = merged[id];
      merged[id] =
        current
        && value
        && typeof current === "object"
        && typeof value === "object"
        && !Array.isArray(current)
        && !Array.isArray(value)
          ? {
              ...(current as Record<string, unknown>),
              ...(value as Record<string, unknown>),
            }
          : value;
    }
  }

  return Object.keys(merged).length ? merged : null;
}
