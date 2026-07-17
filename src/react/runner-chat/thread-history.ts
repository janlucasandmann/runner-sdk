import { stripRunnerSystemTags } from "../runner-markdown.js";

export type RunnerThreadHistoryRole = "user" | "assistant";

export interface RunnerThreadHistoryItem {
  id: string;
  turnId: string;
  role: RunnerThreadHistoryRole;
  label: string;
  preview: string;
}

const RUNNER_THREAD_HISTORY_PREVIEW_LENGTH = 50;
export const RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH = 15;
const RUNNER_THREAD_HISTORY_MEDIUM_LINE_WIDTH = 10;
const RUNNER_THREAD_HISTORY_SMALL_LINE_WIDTH = 5;

export function buildRunnerThreadHistoryItemId(
  turnId: string,
  role: RunnerThreadHistoryRole
): string {
  return `${turnId}:${role}`;
}

export function buildRunnerThreadHistoryPreviewText(
  content: string
): string {
  const normalized = stripRunnerSystemTags(String(content || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= RUNNER_THREAD_HISTORY_PREVIEW_LENGTH) {
    return normalized;
  }
  return `${normalized
    .slice(0, RUNNER_THREAD_HISTORY_PREVIEW_LENGTH)
    .trimEnd()}…`;
}

export function getRunnerThreadHistoryLineWidth(
  index: number,
  activeIndex: number
): number {
  if (index === activeIndex || index === 0) {
    return RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH;
  }
  return index % 2 === 1
    ? RUNNER_THREAD_HISTORY_MEDIUM_LINE_WIDTH
    : RUNNER_THREAD_HISTORY_SMALL_LINE_WIDTH;
}
