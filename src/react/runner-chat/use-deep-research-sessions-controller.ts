import { useEffect, useMemo, useRef, useState } from "react";

import type { RunnerDeepResearchSession } from "../../types.js";
import { isDeepResearchSessionActive } from "./deep-research-session.js";
import { fetchThreadResearchSessions } from "./hydration/api.js";
import { parseIsoTimestampMs } from "./time-utils.js";

interface RunnerDeepResearchSessionServices {
  fetchSessions: typeof fetchThreadResearchSessions;
  pollIntervalMs: number;
}

export interface UseRunnerDeepResearchSessionsControllerOptions {
  apiKey: string;
  backendUrl: string;
  poll: boolean;
  refresh: boolean;
  requestHeaders?: HeadersInit;
  services?: Partial<RunnerDeepResearchSessionServices>;
  threadId?: string | null;
}

export function useRunnerDeepResearchSessionsController({
  apiKey,
  backendUrl,
  poll,
  refresh,
  requestHeaders,
  services,
  threadId,
}: UseRunnerDeepResearchSessionsControllerOptions) {
  const [sessions, setSessions] = useState<RunnerDeepResearchSession[]>([]);
  const sessionsRef = useRef<RunnerDeepResearchSession[]>([]);
  const fetchSessions = services?.fetchSessions || fetchThreadResearchSessions;
  const pollIntervalMs = services?.pollIntervalMs ?? 3_000;

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;
    const resolvedThreadId = String(threadId || "").trim();

    if (!resolvedThreadId || !apiKey.trim() || !backendUrl || !refresh) {
      sessionsRef.current = [];
      setSessions((current) => (current.length > 0 ? [] : current));
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      try {
        const nextSessions = await fetchSessions({
          backendUrl,
          apiKey: apiKey.trim(),
          threadId: resolvedThreadId,
          requestHeaders,
        });
        if (!cancelled) {
          sessionsRef.current = nextSessions;
          setSessions(nextSessions);
        }
      } catch {
        // Preserve the last known sessions across transient failures.
      } finally {
        const hasActiveSession = sessionsRef.current.some((session) =>
          isDeepResearchSessionActive(session),
        );
        if (!cancelled && (poll || hasActiveSession)) {
          pollTimer = window.setTimeout(load, pollIntervalMs);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (pollTimer !== null) window.clearTimeout(pollTimer);
    };
  }, [apiKey, backendUrl, fetchSessions, poll, pollIntervalMs, refresh, requestHeaders, threadId]);

  const activeSession = useMemo(() => {
    const activeSessions = sessions.filter((session) => isDeepResearchSessionActive(session));
    if (activeSessions.length === 0) return null;
    return (
      activeSessions.slice().sort((left, right) => {
        const leftMs =
          parseIsoTimestampMs(left.startedAt) ?? parseIsoTimestampMs(left.createdAt) ?? 0;
        const rightMs =
          parseIsoTimestampMs(right.startedAt) ?? parseIsoTimestampMs(right.createdAt) ?? 0;
        return rightMs - leftMs;
      })[0] || null
    );
  }, [sessions]);

  return {
    activeSession,
    hasActiveSession: Boolean(activeSession),
    sessions,
  };
}
