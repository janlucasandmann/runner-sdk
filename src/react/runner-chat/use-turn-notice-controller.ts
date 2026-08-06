import { type Dispatch, type SetStateAction, useCallback, useMemo } from "react";

import type { RunnerLog } from "../../types.js";
import { generateRunnerClientId } from "./id-utils.js";
import type { RunnerChatThreadContextAction } from "./thread-context-utils.js";
import { getRunnerTurnDurationSeconds } from "./turn-status-presentation.js";
import type { RunnerTurn } from "./turn-types.js";

interface RunnerSyntheticTurnOptions {
  messageMetadata?: Record<string, unknown> | null;
  presentation?: RunnerTurn["presentation"];
}

interface RunnerPendingContextNoticeOptions {
  prompt?: string;
}

interface RunnerContextNoticeUpdateOptions {
  failed?: boolean;
  pending?: boolean;
}

export interface UseRunnerTurnNoticeControllerOptions {
  agentName: string;
  createTurnId?: () => string;
  environmentName: string;
  now?: () => number;
  setExpandedTurns: Dispatch<SetStateAction<Record<string, boolean>>>;
  setTurns: Dispatch<SetStateAction<RunnerTurn[]>>;
}

export interface RunnerTurnNoticeController {
  appendPendingThreadContextActionNotice: (
    action: RunnerChatThreadContextAction,
    message: string,
    options?: RunnerPendingContextNoticeOptions,
  ) => string;
  appendSyntheticActionTurn: (
    promptText: string,
    responseText: string,
    detailLabel: string,
    options?: RunnerSyntheticTurnOptions,
  ) => void;
  appendThreadContextActionNotice: (
    action: RunnerChatThreadContextAction,
    message: string,
  ) => string;
  updateThreadContextActionNotice: (
    turnId: string,
    message: string,
    options?: RunnerContextNoticeUpdateOptions,
  ) => void;
}

function createDefaultTurnId(): string {
  return generateRunnerClientId("turn");
}

function readCurrentTime(): number {
  return Date.now();
}

export function useRunnerTurnNoticeController({
  agentName,
  createTurnId = createDefaultTurnId,
  environmentName,
  now = readCurrentTime,
  setExpandedTurns,
  setTurns,
}: UseRunnerTurnNoticeControllerOptions): RunnerTurnNoticeController {
  const appendSyntheticActionTurn = useCallback(
    (
      promptText: string,
      responseText: string,
      detailLabel: string,
      options?: RunnerSyntheticTurnOptions,
    ) => {
      const turnId = createTurnId();
      const createdAtMs = now();
      const timestamp = new Date(createdAtMs).toISOString();
      setTurns((previousTurns) => [
        ...previousTurns,
        {
          id: turnId,
          prompt: promptText,
          messageMetadata: options?.messageMetadata || null,
          logs: [
            {
              time: timestamp,
              message: detailLabel,
              type: "info",
              eventType: "setup",
            },
            {
              time: timestamp,
              message: responseText,
              type: "success",
              eventType: "agent_message",
            },
          ],
          startedAtMs: createdAtMs,
          completedAtMs: createdAtMs,
          durationSeconds: 0,
          status: "completed",
          animateOnRender: true,
          isInitialTurn: previousTurns.length === 0,
          agentName,
          environmentName,
          presentation: options?.presentation || "default",
        },
      ]);
      setExpandedTurns((previous) => ({ ...previous, [turnId]: false }));
    },
    [agentName, createTurnId, environmentName, now, setExpandedTurns, setTurns],
  );

  const appendThreadContextActionNotice = useCallback(
    (action: RunnerChatThreadContextAction, message: string) => {
      const turnId = createTurnId();
      const createdAtMs = now();
      const timestamp = new Date(createdAtMs).toISOString();
      setTurns((previousTurns) => [
        ...previousTurns,
        {
          id: turnId,
          prompt: "",
          logs: [
            {
              time: timestamp,
              message,
              type: "info",
              eventType: "action_summary",
              metadata: { actionType: action },
            },
          ],
          startedAtMs: createdAtMs,
          completedAtMs: createdAtMs,
          durationSeconds: 0,
          status: "completed",
          animateOnRender: true,
          isInitialTurn: previousTurns.length === 0,
          agentName,
          environmentName,
          presentation: "context-action-notice",
        },
      ]);
      return turnId;
    },
    [agentName, createTurnId, environmentName, now, setTurns],
  );

  const appendPendingThreadContextActionNotice = useCallback(
    (
      action: RunnerChatThreadContextAction,
      message: string,
      options?: RunnerPendingContextNoticeOptions,
    ) => {
      const turnId = createTurnId();
      const createdAtMs = now();
      const timestamp = new Date(createdAtMs).toISOString();
      setTurns((previousTurns) => [
        ...previousTurns,
        {
          id: turnId,
          prompt: options?.prompt || "",
          logs: [
            {
              time: timestamp,
              message,
              type: "info",
              eventType: "action_summary",
              metadata: {
                actionType: action,
                isPending: true,
              },
            },
          ],
          startedAtMs: createdAtMs,
          status: "running",
          animateOnRender: true,
          isInitialTurn: previousTurns.length === 0,
          agentName,
          environmentName,
          presentation: "context-action-notice",
        },
      ]);
      return turnId;
    },
    [agentName, createTurnId, environmentName, now, setTurns],
  );

  const updateThreadContextActionNotice = useCallback(
    (turnId: string, message: string, options?: RunnerContextNoticeUpdateOptions) => {
      const updatedAtMs = now();
      const timestamp = new Date(updatedAtMs).toISOString();
      setTurns((previousTurns) =>
        previousTurns.map((turn) => {
          if (turn.id !== turnId) return turn;
          const logs = turn.logs.map((log, index) =>
            index === 0 && log.eventType === "action_summary"
              ? {
                  ...log,
                  time: timestamp,
                  message,
                  type: (options?.failed ? "error" : "info") as RunnerLog["type"],
                  metadata: {
                    ...log.metadata,
                    isPending: options?.pending ?? false,
                    failed: options?.failed ?? false,
                  },
                }
              : log,
          );
          return {
            ...turn,
            logs,
            status: options?.failed ? "failed" : options?.pending ? "running" : "completed",
            completedAtMs: options?.pending ? undefined : updatedAtMs,
            durationSeconds: options?.pending
              ? undefined
              : getRunnerTurnDurationSeconds(turn, updatedAtMs),
          };
        }),
      );
    },
    [now, setTurns],
  );

  return useMemo(
    () => ({
      appendPendingThreadContextActionNotice,
      appendSyntheticActionTurn,
      appendThreadContextActionNotice,
      updateThreadContextActionNotice,
    }),
    [
      appendPendingThreadContextActionNotice,
      appendSyntheticActionTurn,
      appendThreadContextActionNotice,
      updateThreadContextActionNotice,
    ],
  );
}
