import { stripRunnerSystemTags } from "../runner-markdown.js";
import {
  getRunnerMissionControlAgentName,
  type RunnerMissionControlPreview,
  type RunnerTaskPreview,
} from "./task-preview.js";
import type { RunnerTurn } from "./turn-types.js";

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
  role: RunnerThreadHistoryRole,
): string {
  return `${turnId}:${role}`;
}

export function buildRunnerThreadHistoryPreviewText(content: string): string {
  const normalized = stripRunnerSystemTags(String(content || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= RUNNER_THREAD_HISTORY_PREVIEW_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, RUNNER_THREAD_HISTORY_PREVIEW_LENGTH).trimEnd()}…`;
}

export function getRunnerThreadHistoryLineWidth(index: number, activeIndex: number): number {
  if (index === activeIndex || index === 0) {
    return RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH;
  }
  return index % 2 === 1
    ? RUNNER_THREAD_HISTORY_MEDIUM_LINE_WIDTH
    : RUNNER_THREAD_HISTORY_SMALL_LINE_WIDTH;
}

interface BuildRunnerThreadHistoryItemsOptions {
  displayedAgentLabel: string;
  missionControlPreview: RunnerMissionControlPreview | null;
  taskPreview: RunnerTaskPreview | null;
  turns: readonly RunnerTurn[];
}

export function buildRunnerThreadHistoryItems({
  displayedAgentLabel,
  missionControlPreview,
  taskPreview,
  turns,
}: BuildRunnerThreadHistoryItemsOptions): RunnerThreadHistoryItem[] {
  return turns.flatMap((turn, turnIndex) => {
    const items: RunnerThreadHistoryItem[] = [];
    const normalizedPrompt = turn.prompt.trim();
    const isBtwTurn =
      turn.presentation === "btw" || normalizedPrompt.toLowerCase().startsWith("/btw");
    const taskPreviewForTurn =
      taskPreview &&
      !isBtwTurn &&
      turn.presentation !== "context-action-notice" &&
      (turn.isInitialTurn || turnIndex === 0)
        ? taskPreview
        : null;
    const missionControlPreviewForTurn =
      !taskPreviewForTurn &&
      missionControlPreview &&
      !isBtwTurn &&
      turn.presentation !== "context-action-notice" &&
      (turn.isInitialTurn || turnIndex === 0)
        ? missionControlPreview
        : null;
    const isMissionControlThreadTurn =
      Boolean(missionControlPreview) && !isBtwTurn && turn.presentation !== "context-action-notice";
    const hasSpecialPromptPreview = Boolean(taskPreviewForTurn || missionControlPreviewForTurn);
    const shouldUseTaskPromptPreview = Boolean(
      (taskPreviewForTurn?.reviewRequest === true ||
        taskPreviewForTurn?.showPromptPreview === true) &&
        normalizedPrompt,
    );
    const specialPromptPreviewText = taskPreviewForTurn
      ? `${taskPreviewForTurn.ticketNumber} ${taskPreviewForTurn.title}`
      : missionControlPreviewForTurn?.prompt || "Run mission control.";
    const promptPreview = buildRunnerThreadHistoryPreviewText(
      shouldUseTaskPromptPreview
        ? normalizedPrompt
        : hasSpecialPromptPreview
          ? specialPromptPreviewText
          : normalizedPrompt,
    );
    const turnAgentLabel = isMissionControlThreadTurn
      ? getRunnerMissionControlAgentName(missionControlPreview)
      : turn.agentName || displayedAgentLabel || "Agent";

    if (promptPreview) {
      items.push({
        id: buildRunnerThreadHistoryItemId(turn.id, "user"),
        turnId: turn.id,
        role: "user",
        label: "Me",
        preview: promptPreview,
      });
    }

    if (turn.presentation === "context-action-notice") {
      const actionSummaryLog =
        turn.logs.find(
          (log) =>
            log.eventType === "action_summary" &&
            typeof log.message === "string" &&
            log.message.trim(),
        ) || null;
      if (actionSummaryLog?.message) {
        items.push({
          id: buildRunnerThreadHistoryItemId(turn.id, "assistant"),
          turnId: turn.id,
          role: "assistant",
          label: turnAgentLabel,
          preview: buildRunnerThreadHistoryPreviewText(actionSummaryLog.message),
        });
      }
      return items;
    }

    const agentMessage = [...turn.logs]
      .reverse()
      .find(
        (log) =>
          (log.eventType === "agent_message" || log.eventType === "llm_response") &&
          typeof log.message === "string" &&
          log.message.trim(),
      );

    if (agentMessage?.message) {
      items.push({
        id: buildRunnerThreadHistoryItemId(turn.id, "assistant"),
        turnId: turn.id,
        role: "assistant",
        label: turnAgentLabel,
        preview: buildRunnerThreadHistoryPreviewText(agentMessage.message),
      });
    }

    return items;
  });
}
