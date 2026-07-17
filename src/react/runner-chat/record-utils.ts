export function getRecordString(
  record: Record<string, unknown> | null | undefined,
  keys: string[],
): string {
  if (!record) {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

export function getRecordNumber(
  record: Record<string, unknown> | null | undefined,
  keys: string[],
): number | null {
  if (!record) {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

export function normalizeRecordObject(
  value: unknown,
): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function getRecordObject(
  record: Record<string, unknown> | null | undefined,
  keys: string[],
): Record<string, unknown> | null {
  if (!record) {
    return null;
  }
  for (const key of keys) {
    const value = normalizeRecordObject(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

export function getRecordArray(
  record: Record<string, unknown> | null | undefined,
  keys: string[],
): unknown[] {
  if (!record) {
    return [];
  }
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Ignore malformed metadata arrays.
      }
    }
  }
  return [];
}
