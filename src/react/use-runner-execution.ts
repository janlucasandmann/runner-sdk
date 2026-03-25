import { useCallback, useMemo, useRef, useState } from "react";
import { RunnerClient } from "../client.js";
import { RunnerExecuteOptions, RunnerExecuteResult, RunnerLog } from "../types.js";

export interface UseRunnerExecutionState {
  status: "idle" | "running" | "success" | "failed" | "cancelled";
  logs: RunnerLog[];
  result: RunnerExecuteResult | null;
  error: Error | null;
}

export interface UseRunnerExecutionApi extends UseRunnerExecutionState {
  clear: () => void;
  execute: (options: RunnerExecuteOptions) => Promise<RunnerExecuteResult>;
  cancel: () => void;
}

export interface UseRunnerExecutionOptions {
  client?: RunnerClient;
  clearLogsOnExecute?: boolean;
}

export function useRunnerExecution(options: UseRunnerExecutionOptions = {}): UseRunnerExecutionApi {
  const client = useMemo(() => options.client ?? new RunnerClient(), [options.client]);
  const [status, setStatus] = useState<UseRunnerExecutionState["status"]>("idle");
  const [logs, setLogs] = useState<RunnerLog[]>([]);
  const [result, setResult] = useState<RunnerExecuteResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    setStatus("idle");
    setLogs([]);
    setResult(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const execute = useCallback(
    async (executeOptions: RunnerExecuteOptions) => {
      if (status === "running") {
        throw new Error("Execution already in progress");
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStatus("running");
      setError(null);
      setResult(null);
      if (options.clearLogsOnExecute ?? true) {
        setLogs([]);
      }

      try {
        const runResult = await client.execute({
          ...executeOptions,
          signal: executeOptions.signal ?? controller.signal,
          onLog: (log) => {
            setLogs((previous) => [...previous, log]);
            executeOptions.onLog?.(log);
          },
        });

        setResult(runResult);
        setStatus(runResult.cancelled ? "cancelled" : "success");
        return runResult;
      } catch (executionError) {
        const normalizedError =
          executionError instanceof Error ? executionError : new Error(typeof executionError === "string" ? executionError : "Execution failed");
        setError(normalizedError);
        setStatus(normalizedError.name === "AbortError" ? "cancelled" : "failed");
        throw normalizedError;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [client, options.clearLogsOnExecute, status]
  );

  return {
    status,
    logs,
    result,
    error,
    clear,
    execute,
    cancel,
  };
}

