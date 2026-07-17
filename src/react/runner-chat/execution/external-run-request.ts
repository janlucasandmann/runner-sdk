import {
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";

export interface RunnerExternalExecutionRequest {
  prompt?: string | null;
  threadId?: string | null;
  token?: string | number | null;
}

export interface RunnerExternalRunEligibility {
  prompt: string;
  shouldExecute: boolean;
  threadId: string;
  token: string | number | null;
}

export function getRunnerExternalRunEligibility(options: {
  currentThreadId: string | null | undefined;
  disabled: boolean;
  enabled: boolean;
  handledToken: string | number | null;
  request?: RunnerExternalExecutionRequest | null;
}): RunnerExternalRunEligibility {
  const threadId = String(options.request?.threadId || "").trim();
  const prompt = String(options.request?.prompt || "").trim();
  const token = options.request?.token ?? null;
  return {
    prompt,
    threadId,
    token,
    shouldExecute: Boolean(
      options.enabled
      && !options.disabled
      && options.request
      && token !== null
      && options.handledToken !== token
      && threadId
      && threadId === String(options.currentThreadId || "").trim()
      && prompt,
    ),
  };
}

export interface RunnerExternalRunRequestOptions<
  Request extends RunnerExternalExecutionRequest,
> {
  currentThreadId: string | null | undefined;
  disabled: boolean;
  enabled: boolean;
  execute: (request: Request, prompt: string, threadId: string) => Promise<void>;
  handledTokenRef: MutableRefObject<string | number | null>;
  onError: (error: Error, threadId: string) => void;
  onHandled?: (token: string | number) => void;
  request?: Request | null;
  setError: Dispatch<SetStateAction<string | null>>;
  setIsPreparingRun: Dispatch<SetStateAction<boolean>>;
  wasIntentionalStop: (error: Error, threadId: string) => boolean;
}

export function useRunnerExternalRunRequest<
  Request extends RunnerExternalExecutionRequest,
>({
  currentThreadId,
  disabled,
  enabled,
  execute,
  handledTokenRef,
  onError,
  onHandled,
  request,
  setError,
  setIsPreparingRun,
  wasIntentionalStop,
}: RunnerExternalRunRequestOptions<Request>): void {
  const callbacksRef = useRef({
    execute,
    onError,
    onHandled,
    wasIntentionalStop,
  });
  callbacksRef.current = {
    execute,
    onError,
    onHandled,
    wasIntentionalStop,
  };

  useEffect(() => {
    const eligibility = getRunnerExternalRunEligibility({
      currentThreadId,
      disabled,
      enabled,
      handledToken: handledTokenRef.current,
      request,
    });
    if (
      !eligibility.shouldExecute
      || eligibility.token === null
      || !request
    ) {
      return;
    }

    handledTokenRef.current = eligibility.token;
    try {
      callbacksRef.current.onHandled?.(eligibility.token);
    } catch (error) {
      console.warn(
        "[RunnerChat] onExternalRunRequestHandled callback failed:",
        error,
      );
    }

    void (async () => {
      try {
        setError(null);
        setIsPreparingRun(true);
        await callbacksRef.current.execute(
          request,
          eligibility.prompt,
          eligibility.threadId,
        );
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        if (
          callbacksRef.current.wasIntentionalStop(
            normalizedError,
            eligibility.threadId,
          )
        ) {
          return;
        }
        setError(normalizedError.message);
        callbacksRef.current.onError(
          normalizedError,
          eligibility.threadId,
        );
      } finally {
        setIsPreparingRun(false);
      }
    })();
  }, [
    currentThreadId,
    disabled,
    enabled,
    handledTokenRef,
    request,
    setError,
    setIsPreparingRun,
  ]);
}
