import type {
  ConfigureHomeNotificationRow,
  ConfigureHomeNotificationSort,
} from "../page/notifications-overview-page.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stripHtml(value: unknown): string {
  return asString(value)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function normalizeNotificationKind(record: UnknownRecord): string {
  const metadata = asRecord(record.metadata);
  const value = asString(
    record.kind
      || record.type
      || record.category
      || metadata.kind
      || metadata.type,
  ).toLowerCase().replace(/[\s-]+/g, "_");
  if (value.includes("permission")) return "permission";
  if (value.includes("human") && value.includes("task")) return "human_task";
  if (value.includes("organization") && value.includes("invitation")) {
    return "organization_invitation";
  }
  if (value.includes("team") && value.includes("invitation")) {
    return "team_invitation";
  }
  if (value.includes("email") && value.includes("verification")) {
    return "email_verification";
  }
  return value || "product";
}

function getKindLabel(kind: string): string {
  if (kind === "permission") return "Permission request";
  if (kind === "human_task") return "Task";
  if (kind === "team_invitation") return "Team invitation";
  if (kind === "organization_invitation") return "Organization invitation";
  if (kind === "email_verification") return "Email verification";
  return "Product";
}

export function normalizeConfigureHomeNotificationRows(
  records: readonly unknown[],
): ConfigureHomeNotificationRow[] {
  return records.flatMap((rawRecord, index) => {
    const record = asRecord(rawRecord);
    const metadata = asRecord(record.metadata);
    const id = asString(record.id)
      || asString(record.notificationId)
      || asString(record.notification_id);
    if (!id) return [];
    const kind = normalizeNotificationKind(record);
    const createdAt = asString(record.createdAt)
      || asString(record.created_at);
    const htmlText = stripHtml(record.html);
    const label = asString(record.label)
      || asString(record.title)
      || asString(metadata.title)
      || getKindLabel(kind);
    return [{
      ...record,
      id,
      kind,
      kindLabel: asString(record.kindLabel) || getKindLabel(kind),
      label,
      text: asString(record.text)
        || asString(record.message)
        || asString(record.description)
        || asString(metadata.message)
        || htmlText
        || "Open notification",
      statusLabel: asString(record.statusLabel)
        || (record.unread === true || record.read === false ? "Unread" : "Read"),
      unread: record.unread === true || record.read === false,
      createdAt,
      createdAtTimestamp: parseTimestamp(createdAt) || index,
      createdAtLabel: formatDate(createdAt),
    }];
  });
}

function matchesFilter(
  row: ConfigureHomeNotificationRow,
  filter: string,
): boolean {
  if (filter === "unread") return row.unread === true;
  if (filter === "read") return row.unread !== true;
  if (filter === "permission") return row.kind === "permission";
  if (filter === "tasks") return row.kind === "human_task";
  if (filter === "team") return row.kind === "team_invitation";
  if (filter === "organization") {
    return row.kind === "organization_invitation";
  }
  if (filter === "product") {
    return ![
      "permission",
      "human_task",
      "team_invitation",
      "organization_invitation",
    ].includes(row.kind);
  }
  return true;
}

export function selectConfigureHomeNotifications(
  rows: readonly ConfigureHomeNotificationRow[],
  options: {
    query: string;
    filter: string;
    sort: ConfigureHomeNotificationSort;
  },
): ConfigureHomeNotificationRow[] {
  const query = options.query.trim().toLowerCase();
  return rows
    .filter((row) => matchesFilter(row, options.filter))
    .filter((row) => !query || [
      row.label,
      row.text,
      row.kindLabel,
      row.kind,
    ].some((value) => asString(value).toLowerCase().includes(query)))
    .slice()
    .sort((left, right) => {
      if (options.sort === "type") {
        return asString(left.kindLabel).localeCompare(asString(right.kindLabel));
      }
      const delta = Number(right.createdAtTimestamp || 0)
        - Number(left.createdAtTimestamp || 0);
      return options.sort === "oldest" ? -delta : delta;
    });
}
