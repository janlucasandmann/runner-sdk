import type {
  RunnerQuotedSelection,
  RunnerQuotedSelectionSource,
} from "./turn-types.js";

const MAX_QUOTED_SELECTION_LENGTH = 4_000;
const QUOTED_SELECTION_PREVIEW_LENGTH = 140;

export function sanitizeQuotedSelectionText(text: string): string {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
  if (normalized.length <= MAX_QUOTED_SELECTION_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_QUOTED_SELECTION_LENGTH - 1).trimEnd()}…`;
}

export function previewQuotedSelectionText(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= QUOTED_SELECTION_PREVIEW_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, QUOTED_SELECTION_PREVIEW_LENGTH - 1).trimEnd()}…`;
}

export function normalizeQuotedSelection(value: unknown): RunnerQuotedSelection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as { text?: unknown; sourceType?: unknown };
  if (typeof candidate.text !== "string") {
    return null;
  }
  const text = sanitizeQuotedSelectionText(candidate.text);
  if (!text) {
    return null;
  }
  const sourceType: RunnerQuotedSelectionSource =
    candidate.sourceType === "run_summary" ? "run_summary" : "working_log";
  return { text, sourceType };
}
