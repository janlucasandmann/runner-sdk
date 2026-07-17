import type { RunnerDeepResearchSession, RunnerLog } from "../../types.js";
import { parseIsoTimestampMs } from "./time-utils.js";
import type { RunnerTurn } from "./turn-types.js";

export function extractDeepResearchSessionIdFromLogs(
  logs: RunnerLog[],
  runningCommandLog?: RunnerLog,
): string | null {
  const sessionIdFromLogs = logs.find(
    (log) =>
      typeof log.metadata?.deepResearch?.sessionId === "string"
      && log.metadata.deepResearch.sessionId.trim(),
  )?.metadata?.deepResearch?.sessionId;
  if (typeof sessionIdFromLogs === "string" && sessionIdFromLogs.trim()) {
    return sessionIdFromLogs.trim();
  }
  const commandSessionId = runningCommandLog?.metadata?.deepResearch?.sessionId;
  return typeof commandSessionId === "string" && commandSessionId.trim()
    ? commandSessionId.trim()
    : null;
}

export function extractDeepResearchTopicFromGroup(
  logs: RunnerLog[],
  runningCommandLog?: RunnerLog,
): string {
  const topicFromLogs = logs.find(
    (log) =>
      typeof log.metadata?.deepResearch?.topic === "string"
      && log.metadata.deepResearch.topic.trim(),
  )?.metadata?.deepResearch?.topic;
  if (typeof topicFromLogs === "string" && topicFromLogs.trim()) {
    return topicFromLogs.trim();
  }
  const command =
    typeof runningCommandLog?.metadata?.command === "string"
      ? runningCommandLog.metadata.command
      : "";
  const match = command.match(/deep-research\.py\s+["']([^"']+)["']/i);
  return match?.[1]?.trim() || "";
}

export function resolveDeepResearchSessionForGroup(params: {
  logs: RunnerLog[];
  runningCommandLog?: RunnerLog;
  turn: RunnerTurn;
  sessions: RunnerDeepResearchSession[];
}): RunnerDeepResearchSession | null {
  const sessionId = extractDeepResearchSessionIdFromLogs(
    params.logs,
    params.runningCommandLog,
  );
  if (sessionId) {
    return params.sessions.find((session) => session.id === sessionId) || null;
  }

  const topic = extractDeepResearchTopicFromGroup(
    params.logs,
    params.runningCommandLog,
  ).toLowerCase();
  const turnStartedAt = params.turn.startedAtMs;
  const candidateSessions = params.sessions.filter((session) => {
    if (topic && session.topic.trim().toLowerCase() === topic) {
      return true;
    }
    const createdAtMs =
      parseIsoTimestampMs(session.startedAt)
      ?? parseIsoTimestampMs(session.createdAt);
    return createdAtMs !== null
      && Math.abs(createdAtMs - turnStartedAt) <= 15 * 60 * 1000;
  });

  if (candidateSessions.length <= 1) {
    return candidateSessions[0] || null;
  }

  return candidateSessions
    .slice()
    .sort((left, right) => {
      const leftMs =
        parseIsoTimestampMs(left.startedAt)
        ?? parseIsoTimestampMs(left.createdAt)
        ?? 0;
      const rightMs =
        parseIsoTimestampMs(right.startedAt)
        ?? parseIsoTimestampMs(right.createdAt)
        ?? 0;
      return Math.abs(leftMs - turnStartedAt) - Math.abs(rightMs - turnStartedAt);
    })[0] || null;
}

export function isDeepResearchSessionActive(
  session: RunnerDeepResearchSession | null | undefined,
): boolean {
  if (!session) {
    return false;
  }
  const normalizedStatus =
    typeof session.status === "string"
      ? session.status.trim().toLowerCase()
      : "";
  return Boolean(normalizedStatus)
    && normalizedStatus !== "completed"
    && normalizedStatus !== "failed"
    && normalizedStatus !== "timeout"
    && normalizedStatus !== "cancelled";
}
