import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RunnerClient } from "../../client.js";
import {
  createInitialRunnerThreadProjection,
  projectRunnerThreadTimelinePage,
  reduceRunnerThreadEvent,
} from "../../thread/projection.js";
import type {
  RunnerThreadControlInput,
  RunnerThreadProjection,
  RunnerThreadRoutedMessageInput,
  RunnerThreadRoutedMessageResult,
  RunnerThreadRunCommandResult,
  RunnerThreadSteeringInput,
} from "../../thread/types.js";
import {
  createRunnerThreadDetailRequestRegistry,
  compactRunnerThreadLiveProjection,
  fetchRunnerThreadActivityGroupActionBatch,
  fetchRunnerThreadRunDetailBatch,
  mergeRunnerThreadDetailItems,
  type RunnerThreadDetailLoadState,
} from "./run-detail-hydration.js";

export interface UseRunnerThreadProjectionOptions {
  threadId: string;
  backendUrl: string;
  client?: RunnerClient;
  headers?: HeadersInit;
  organizationId?: string;
  credentials?: RequestCredentials;
  enabled?: boolean;
  initialLimit?: number;
  includeLegacy?: boolean;
  reconnect?: boolean;
  reconnectMinDelayMs?: number;
  reconnectMaxDelayMs?: number;
}

export interface UseRunnerThreadProjectionResult {
  projection: RunnerThreadProjection;
  loading: boolean;
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  runDetailStates: Record<string, RunnerThreadDetailLoadState>;
  activityGroupActionStates: Record<string, RunnerThreadDetailLoadState>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<boolean>;
  loadRunDetails: (runId: string) => Promise<void>;
  loadActivityGroupActions: (groupId: string, runId: string) => Promise<void>;
  postMessage: (message: RunnerThreadRoutedMessageInput) => Promise<RunnerThreadRoutedMessageResult>;
  steerRun: (runId: string, steering: RunnerThreadSteeringInput) => Promise<RunnerThreadRunCommandResult>;
  controlRun: (runId: string, control: RunnerThreadControlInput) => Promise<RunnerThreadRunCommandResult>;
}

export function isRunnerThreadProjectionRequestCurrent(
  requestedThreadId: string,
  requestedGeneration: number,
  currentThreadId: string,
  currentGeneration: number,
): boolean {
  return requestedThreadId === currentThreadId && requestedGeneration === currentGeneration;
}

function abortableDelay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = window.setTimeout(resolve, milliseconds);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

export function useRunnerThreadProjection({
  threadId,
  backendUrl,
  client: providedClient,
  headers,
  organizationId,
  credentials,
  enabled = true,
  initialLimit = 100,
  includeLegacy = true,
  reconnect = true,
  reconnectMinDelayMs = 750,
  reconnectMaxDelayMs = 15_000,
}: UseRunnerThreadProjectionOptions): UseRunnerThreadProjectionResult {
  const client = useMemo(() => providedClient || new RunnerClient(), [providedClient]);
  const [projection, setProjection] = useState(() => createInitialRunnerThreadProjection(threadId));
  const projectionRef = useRef(projection);
  const [loading, setLoading] = useState(enabled);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runDetailStates, setRunDetailStates] = useState<Record<string, RunnerThreadDetailLoadState>>({});
  const [activityGroupActionStates, setActivityGroupActionStates] = useState<Record<string, RunnerThreadDetailLoadState>>({});
  const [connectionRestartToken, setConnectionRestartToken] = useState(0);
  const runDetailRequestsRef = useRef<ReturnType<typeof createRunnerThreadDetailRequestRegistry> | null>(null);
  const groupActionRequestsRef = useRef<ReturnType<typeof createRunnerThreadDetailRequestRegistry> | null>(null);
  const detailGenerationRef = useRef(0);
  const connectionGenerationRef = useRef(0);
  const activeThreadIdRef = useRef(threadId);
  activeThreadIdRef.current = threadId;
  if (!runDetailRequestsRef.current) runDetailRequestsRef.current = createRunnerThreadDetailRequestRegistry();
  if (!groupActionRequestsRef.current) groupActionRequestsRef.current = createRunnerThreadDetailRequestRegistry();

  useEffect(() => {
    projectionRef.current = projection;
  }, [projection]);

  const applyProjection = useCallback((updater: (current: RunnerThreadProjection) => RunnerThreadProjection) => {
    setProjection((current) => {
      const next = updater(current);
      projectionRef.current = next;
      return next;
    });
  }, []);

  const requestOptions = useCallback(() => ({
    backendUrl,
    threadId,
    headers,
    organizationId,
    credentials,
  }), [backendUrl, credentials, headers, organizationId, threadId]);

  const resetDetailHydration = useCallback(() => {
    detailGenerationRef.current += 1;
    runDetailRequestsRef.current?.reset();
    groupActionRequestsRef.current?.reset();
    setRunDetailStates({});
    setActivityGroupActionStates({});
  }, []);

  const loadRunDetails = useCallback((rawRunId: string): Promise<void> => {
    const runId = rawRunId.trim();
    if (!enabled || !threadId || !backendUrl || !runId) return Promise.resolve();
    const registry = runDetailRequestsRef.current!;
    if (registry.isLoaded(runId)) return Promise.resolve();
    const generation = detailGenerationRef.current;
    setRunDetailStates((current) => ({
      ...current,
      [runId]: { status: "loading", error: null },
    }));
    return registry.run(runId, async () => {
      const batch = await fetchRunnerThreadRunDetailBatch(client, requestOptions(), runId);
      if (generation !== detailGenerationRef.current || activeThreadIdRef.current !== threadId) return;
      applyProjection((current) => current.threadId && current.threadId !== threadId
        ? current
        : mergeRunnerThreadDetailItems(current, batch.items));
      setRunDetailStates((current) => ({
        ...current,
        [runId]: {
          status: "loaded",
          error: null,
          loadedCount: batch.groupCount + batch.actionCount,
          truncated: batch.groupsTruncated || batch.actionsTruncated,
        },
      }));
    }).catch((nextError) => {
      if (generation === detailGenerationRef.current && activeThreadIdRef.current === threadId) {
        setRunDetailStates((current) => ({
          ...current,
          [runId]: {
            status: "error",
            error: nextError instanceof Error ? nextError.message : String(nextError),
          },
        }));
      }
      throw nextError;
    });
  }, [applyProjection, backendUrl, client, enabled, requestOptions, threadId]);

  const loadActivityGroupActions = useCallback((rawGroupId: string, rawRunId: string): Promise<void> => {
    const groupId = rawGroupId.trim();
    const runId = rawRunId.trim();
    if (!enabled || !threadId || !backendUrl || !groupId || !runId) return Promise.resolve();
    const registry = groupActionRequestsRef.current!;
    if (registry.isLoaded(groupId)) return Promise.resolve();
    const generation = detailGenerationRef.current;
    setActivityGroupActionStates((current) => ({
      ...current,
      [groupId]: { status: "loading", error: null },
    }));
    return registry.run(groupId, async () => {
      const batch = await fetchRunnerThreadActivityGroupActionBatch(client, requestOptions(), groupId, runId);
      if (generation !== detailGenerationRef.current || activeThreadIdRef.current !== threadId) return;
      applyProjection((current) => current.threadId && current.threadId !== threadId
        ? current
        : mergeRunnerThreadDetailItems(current, batch.actions));
      setActivityGroupActionStates((current) => ({
        ...current,
        [groupId]: {
          status: "loaded",
          error: null,
          loadedCount: batch.actions.length,
          truncated: batch.truncated,
        },
      }));
    }).catch((nextError) => {
      if (generation === detailGenerationRef.current && activeThreadIdRef.current === threadId) {
        setActivityGroupActionStates((current) => ({
          ...current,
          [groupId]: {
            status: "error",
            error: nextError instanceof Error ? nextError.message : String(nextError),
          },
        }));
      }
      throw nextError;
    });
  }, [applyProjection, backendUrl, client, enabled, requestOptions, threadId]);

  const refresh = useCallback((): Promise<void> => {
    if (!enabled || !threadId || !backendUrl) return Promise.resolve();
    resetDetailHydration();
    setLoading(true);
    setError(null);
    connectionGenerationRef.current += 1;
    setConnectionRestartToken((current) => current + 1);
    return Promise.resolve();
  }, [backendUrl, enabled, resetDetailHydration, threadId]);

  const loadMore = useCallback(async () => {
    const cursor = projectionRef.current.olderCursor;
    if (!enabled || !cursor || !projectionRef.current.hasOlder) return false;
    const requestedGeneration = connectionGenerationRef.current;
    const requestedThreadId = threadId;
    const numericCursor = Number(cursor);
    const page = await client.listThreadTimeline({
      ...requestOptions(),
      ...(Number.isSafeInteger(numericCursor) && numericCursor >= 0
        ? { before: numericCursor }
        : { cursor }),
      limit: initialLimit,
      includeLegacy,
    });
    if (!isRunnerThreadProjectionRequestCurrent(
      requestedThreadId,
      requestedGeneration,
      activeThreadIdRef.current,
      connectionGenerationRef.current,
    )) return false;
    applyProjection((current) => current.threadId !== requestedThreadId
      ? current
      : compactRunnerThreadLiveProjection(projectRunnerThreadTimelinePage(current, page)));
    return true;
  }, [applyProjection, client, enabled, includeLegacy, initialLimit, requestOptions, threadId]);

  useEffect(() => {
    const controller = new AbortController();
    const requestedGeneration = connectionGenerationRef.current;
    const requestedThreadId = threadId;
    const isCurrent = () => !controller.signal.aborted && isRunnerThreadProjectionRequestCurrent(
      requestedThreadId,
      requestedGeneration,
      activeThreadIdRef.current,
      connectionGenerationRef.current,
    );
    resetDetailHydration();
    if (projectionRef.current.threadId !== threadId) {
      projectionRef.current = createInitialRunnerThreadProjection(threadId);
      setProjection(projectionRef.current);
    }
    setConnected(false);
    setReconnecting(false);
    setError(null);

    if (!enabled || !threadId || !backendUrl) {
      setLoading(false);
      return () => {
        controller.abort();
        if (connectionGenerationRef.current === requestedGeneration) connectionGenerationRef.current += 1;
        detailGenerationRef.current += 1;
        runDetailRequestsRef.current?.reset();
        groupActionRequestsRef.current?.reset();
      };
    }

    const run = async () => {
      setLoading(true);
      try {
        const page = await client.listThreadTimeline({
          ...requestOptions(),
          limit: initialLimit,
          includeLegacy,
          signal: controller.signal,
        });
        if (!isCurrent()) return;
        const projectionBase = projectionRef.current.threadId === threadId
          ? projectionRef.current
          : createInitialRunnerThreadProjection(threadId);
        const initialProjection = compactRunnerThreadLiveProjection(
          projectRunnerThreadTimelinePage(projectionBase, page),
        );
        projectionRef.current = initialProjection;
        setProjection(initialProjection);
        setLoading(false);

        let retryDelay = reconnectMinDelayMs;
        while (!controller.signal.aborted) {
          try {
            setReconnecting(retryDelay > reconnectMinDelayMs);
            for await (const event of client.streamThreadEvents({
              ...requestOptions(),
              after: projectionRef.current.latestSequence,
              signal: controller.signal,
              onOpen: () => {
                if (!isCurrent()) return;
                setConnected(true);
                setReconnecting(false);
                setError(null);
              },
            })) {
              if (!isCurrent()) break;
              setConnected(true);
              setReconnecting(false);
              setError(null);
              retryDelay = reconnectMinDelayMs;
              applyProjection((current) => current.threadId !== requestedThreadId
                ? current
                : compactRunnerThreadLiveProjection(reduceRunnerThreadEvent(current, event)));
            }
            if (!isCurrent()) break;
            setConnected(false);
            if (!reconnect) break;
            setReconnecting(true);
          } catch (streamError) {
            if (!isCurrent()) break;
            setConnected(false);
            setReconnecting(true);
            setError(streamError instanceof Error ? streamError.message : String(streamError));
            if (!reconnect) break;
          }
          await abortableDelay(retryDelay, controller.signal);
          retryDelay = Math.min(reconnectMaxDelayMs, Math.max(reconnectMinDelayMs, retryDelay * 2));
        }
      } catch (initialError) {
        if (isCurrent()) {
          setError(initialError instanceof Error ? initialError.message : String(initialError));
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      controller.abort();
      if (connectionGenerationRef.current === requestedGeneration) connectionGenerationRef.current += 1;
      detailGenerationRef.current += 1;
      runDetailRequestsRef.current?.reset();
      groupActionRequestsRef.current?.reset();
    };
  }, [
    applyProjection,
    backendUrl,
    client,
    connectionRestartToken,
    enabled,
    initialLimit,
    includeLegacy,
    reconnect,
    reconnectMaxDelayMs,
    reconnectMinDelayMs,
    requestOptions,
    resetDetailHydration,
    threadId,
  ]);

  const postMessage = useCallback(async (message: RunnerThreadRoutedMessageInput) => {
    const requestedGeneration = connectionGenerationRef.current;
    const requestedThreadId = threadId;
    const result = await client.postThreadRoutedMessage({ ...requestOptions(), message });
    if (!isRunnerThreadProjectionRequestCurrent(
      requestedThreadId,
      requestedGeneration,
      activeThreadIdRef.current,
      connectionGenerationRef.current,
    )) return result;
    applyProjection((current) => {
      if (current.threadId !== requestedThreadId) return current;
      let next = reduceRunnerThreadEvent(current, result.message);
      if (result.routingReceipt) next = reduceRunnerThreadEvent(next, result.routingReceipt);
      if (result.run) next = reduceRunnerThreadEvent(next, result.run);
      if (result.communicator?.message) next = reduceRunnerThreadEvent(next, result.communicator.message);
      for (const event of result.events || []) next = reduceRunnerThreadEvent(next, event);
      return compactRunnerThreadLiveProjection(next);
    });
    return result;
  }, [applyProjection, client, requestOptions, threadId]);

  const steerRun = useCallback(async (runId: string, steering: RunnerThreadSteeringInput) => {
    const requestedGeneration = connectionGenerationRef.current;
    const requestedThreadId = threadId;
    const result = await client.steerThreadRun({ ...requestOptions(), runId, steering });
    if (!isRunnerThreadProjectionRequestCurrent(
      requestedThreadId,
      requestedGeneration,
      activeThreadIdRef.current,
      connectionGenerationRef.current,
    )) return result;
    applyProjection((current) => {
      if (current.threadId !== requestedThreadId) return current;
      let next = current;
      if (result.run) next = reduceRunnerThreadEvent(next, result.run);
      if (result.event) next = reduceRunnerThreadEvent(next, result.event);
      if (result.routingReceipt) next = reduceRunnerThreadEvent(next, result.routingReceipt);
      return compactRunnerThreadLiveProjection(next);
    });
    return result;
  }, [applyProjection, client, requestOptions, threadId]);

  const controlRun = useCallback(async (runId: string, control: RunnerThreadControlInput) => {
    const requestedGeneration = connectionGenerationRef.current;
    const requestedThreadId = threadId;
    const result = await client.controlThreadRun({ ...requestOptions(), runId, control });
    if (!isRunnerThreadProjectionRequestCurrent(
      requestedThreadId,
      requestedGeneration,
      activeThreadIdRef.current,
      connectionGenerationRef.current,
    )) return result;
    applyProjection((current) => {
      if (current.threadId !== requestedThreadId) return current;
      let next = current;
      if (result.run) next = reduceRunnerThreadEvent(next, result.run);
      if (result.event) next = reduceRunnerThreadEvent(next, result.event);
      return compactRunnerThreadLiveProjection(next);
    });
    return result;
  }, [applyProjection, client, requestOptions, threadId]);

  return {
    projection,
    loading,
    connected,
    reconnecting,
    error,
    runDetailStates,
    activityGroupActionStates,
    refresh,
    loadMore,
    loadRunDetails,
    loadActivityGroupActions,
    postMessage,
    steerRun,
    controlRun,
  };
}
