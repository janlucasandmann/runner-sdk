export type PlatformResourceUpdatedAt = Date | number | string | null | undefined;

export interface FormatPlatformResourceUpdatedAtOptions {
  /** Injectable clock for deterministic consumers and tests. */
  now?: Date | number;
  locale?: Intl.LocalesArgument;
}

export function getPlatformResourceUpdatedTimestamp(
  value: PlatformResourceUpdatedAt,
): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return Date.parse(String(value || ""));
}

function isSameLocalDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

/**
 * Canonical user-facing timestamp for a resource's latest update.
 *
 * Today is represented by its time, yesterday retains both the relative day
 * and time, and older values use the locale's medium date. Calendar-day
 * comparisons intentionally use local time so labels match the user's day.
 */
export function formatPlatformResourceUpdatedAt(
  value: PlatformResourceUpdatedAt,
  options: FormatPlatformResourceUpdatedAtOptions = {},
): string {
  const timestamp = getPlatformResourceUpdatedTimestamp(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "—";

  const updatedAt = new Date(timestamp);
  const now = options.now instanceof Date
    ? new Date(options.now.getTime())
    : new Date(options.now ?? Date.now());
  const time = new Intl.DateTimeFormat(options.locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(updatedAt);

  if (isSameLocalDay(updatedAt, now)) return time;

  const yesterday = new Date(now.getTime());
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameLocalDay(updatedAt, yesterday)) return `Yesterday, ${time}`;

  return new Intl.DateTimeFormat(options.locale, { dateStyle: "medium" }).format(updatedAt);
}
