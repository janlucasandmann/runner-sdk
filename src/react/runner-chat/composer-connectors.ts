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

export const RUNNER_CONNECTOR_IDS_METADATA_KEY = "runnerConnectorIds";

const RUNNER_CHAT_TAG_CONNECTOR_IDS = new Set(["discord", "email", "telegram"]);

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

export function getRunnerConnectorIdsFromPayload(
  payload: Record<string, unknown> | null | undefined,
): string[] {
  if (!payload) return [];
  return normalizeRunnerSelectedConnectorIds(
    Object.entries(payload).flatMap(([id, value]) => {
      if (
        value
        && typeof value === "object"
        && !Array.isArray(value)
        && (value as Record<string, unknown>).enabled === false
      ) {
        return [];
      }
      return [id];
    }),
  );
}

export function getRunnerConnectorIdsFromMessageMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  if (!metadata) return [];

  const value = metadata[RUNNER_CONNECTOR_IDS_METADATA_KEY]
    ?? metadata.runner_connector_ids
    ?? metadata.connectorIds
    ?? metadata.connector_ids;
  const directIds = normalizeRunnerSelectedConnectorIds(
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [],
  );
  if (directIds.length > 0) {
    return directIds;
  }

  const connectorPayload = metadata.connectors;
  return connectorPayload
    && typeof connectorPayload === "object"
    && !Array.isArray(connectorPayload)
    ? getRunnerConnectorIdsFromPayload(connectorPayload as Record<string, unknown>)
    : [];
}

const RUNNER_CONNECTOR_DISPLAY_NAMES: Record<string, string> = {
  atlassian: "Atlassian",
  github: "GitHub",
  gitlab: "GitLab",
  "google-drive": "Google Drive",
  googledrive: "Google Drive",
  jira: "Jira",
  "one-drive": "OneDrive",
  onedrive: "OneDrive",
};

const RUNNER_CONNECTOR_ALIASES: Record<string, readonly string[]> = {
  atlassian: ["jira"],
  jira: ["atlassian"],
  googledrive: ["gdrive"],
  gdrive: ["googledrive"],
  onedrive: ["microsoftonedrive"],
  microsoftonedrive: ["onedrive"],
};

function normalizeRunnerConnectorLookupKey(value: unknown): string {
  return normalizeRunnerConnectorId(value)
    .replace(/^(?:connector|integration)[_:-]+/, "")
    .replace(/[^a-z0-9]+/g, "");
}

function getRunnerConnectorLookupKeys(value: unknown): Set<string> {
  const key = normalizeRunnerConnectorLookupKey(value);
  const keys = new Set<string>();
  if (!key) return keys;
  keys.add(key);
  for (const alias of RUNNER_CONNECTOR_ALIASES[key] || []) {
    keys.add(alias);
  }
  return keys;
}

function humanizeRunnerConnectorId(value: string): string {
  const normalizedId = normalizeRunnerConnectorId(value)
    .replace(/^(?:connector|integration)[_:-]+/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  const lookupKey = normalizeRunnerConnectorLookupKey(normalizedId);
  const knownName = RUNNER_CONNECTOR_DISPLAY_NAMES[lookupKey];
  if (knownName) return knownName;
  return normalizedId
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Connector";
}

/**
 * Resolves durable connector IDs against the current catalog. Persisted
 * messages must remain presentable while the catalog is still loading and
 * across legacy ID aliases, so unresolved IDs receive a stable fallback chip.
 */
export function resolveRunnerMessageConnectorOptions(
  metadata: Record<string, unknown> | null | undefined,
  options: readonly RunnerChatConnectorOption[] | null | undefined,
): RunnerChatConnectorOption[] {
  const connectorIds = getRunnerConnectorIdsFromMessageMetadata(metadata);
  if (connectorIds.length === 0) return [];

  const normalizedOptions = normalizeRunnerConnectorOptions(options);
  const optionLookupKeys = normalizedOptions.map((option) => {
    const keys = new Set<string>([
      ...getRunnerConnectorLookupKeys(option.id),
      ...getRunnerConnectorLookupKeys(option.name),
    ]);
    for (const keyword of option.keywords || []) {
      for (const key of getRunnerConnectorLookupKeys(keyword)) keys.add(key);
    }
    return { option, keys };
  });

  return connectorIds.map((connectorId) => {
    const exact = normalizedOptions.find((option) => option.id === connectorId);
    if (exact) return exact;

    const connectorKeys = getRunnerConnectorLookupKeys(connectorId);
    const matched = optionLookupKeys.find(({ keys }) =>
      [...connectorKeys].some((key) => keys.has(key)),
    )?.option;
    if (matched) return matched;

    const fallbackId = normalizeRunnerConnectorId(connectorId)
      .replace(/^(?:connector|integration)[_:-]+/, "");
    return {
      id: fallbackId || connectorId,
      name: humanizeRunnerConnectorId(connectorId),
      description: "",
      kind: RUNNER_CHAT_TAG_CONNECTOR_IDS.has(fallbackId) ? "tag" : "plugin",
    };
  });
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
