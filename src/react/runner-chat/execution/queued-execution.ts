import {
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type {
  StagedAdCreationCommand,
  StagedAgentCreationCommand,
  StagedBacklogCommand,
  StagedParseCreationCommand,
  StagedResearchCreationCommand,
  StagedResourceCreationCommand,
  StagedScrapeCreationCommand,
  StagedSkillCreationCommand,
  StagedSlideCreationCommand,
} from "../composer-commands.js";
import type {
  LocalAttachment,
  RunnerAttachment,
} from "../attachment-types.js";
import type { RunnerQuotedSelection } from "../turn-types.js";

export interface RunnerPendingMessage {
  id: string;
  turnId: string;
  prompt: string;
  displayPrompt?: string | null;
  reasoningEffort?: string | null;
  attachments: LocalAttachment[];
  extraResolvedAttachments?: RunnerAttachment[] | null;
  quotedSelection?: RunnerQuotedSelection | null;
  backlogCommand?: StagedBacklogCommand | null;
  resourceCreationCommand?: StagedResourceCreationCommand | null;
  agentCreationCommand?: StagedAgentCreationCommand | null;
  skillCreationCommand?: StagedSkillCreationCommand | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
  connectors?: Record<string, unknown> | null;
}

export interface RunnerQueuedExecutionOptions {
  currentThreadId: string | null | undefined;
  execute: (message: RunnerPendingMessage) => Promise<void>;
  hasActiveRun: boolean;
  isDrainingRef: MutableRefObject<boolean>;
  isPreparingRun: boolean;
  messages: RunnerPendingMessage[];
  onError: (error: Error, threadId: string | null) => void;
  setIsPreparingRun: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<RunnerPendingMessage[]>>;
  wasIntentionalStop: (
    error: Error,
    threadId: string | null,
  ) => boolean;
}

export function getNextRunnerQueuedMessage(options: {
  hasActiveRun: boolean;
  isDraining: boolean;
  isPreparingRun: boolean;
  messages: RunnerPendingMessage[];
}): RunnerPendingMessage | null {
  if (
    options.hasActiveRun
    || options.isDraining
    || options.isPreparingRun
  ) {
    return null;
  }
  return options.messages[0] || null;
}

export function useRunnerQueuedExecution({
  currentThreadId,
  execute,
  hasActiveRun,
  isDrainingRef,
  isPreparingRun,
  messages,
  onError,
  setIsPreparingRun,
  setMessages,
  wasIntentionalStop,
}: RunnerQueuedExecutionOptions): void {
  const callbacksRef = useRef({ execute, onError, wasIntentionalStop });
  callbacksRef.current = { execute, onError, wasIntentionalStop };

  useEffect(() => {
    const nextMessage = getNextRunnerQueuedMessage({
      hasActiveRun,
      isDraining: isDrainingRef.current,
      isPreparingRun,
      messages,
    });
    if (!nextMessage) return;

    isDrainingRef.current = true;
    setMessages((current) =>
      current.filter((item) => item.id !== nextMessage.id),
    );
    void (async () => {
      try {
        setIsPreparingRun(true);
        await callbacksRef.current.execute(nextMessage);
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        const normalizedThreadId = String(currentThreadId || "").trim() || null;
        if (
          callbacksRef.current.wasIntentionalStop(
            normalizedError,
            normalizedThreadId,
          )
        ) {
          return;
        }
        callbacksRef.current.onError(
          normalizedError,
          normalizedThreadId,
        );
      } finally {
        isDrainingRef.current = false;
        setIsPreparingRun(false);
      }
    })();
  }, [
    currentThreadId,
    hasActiveRun,
    isDrainingRef,
    isPreparingRun,
    messages,
    setIsPreparingRun,
    setMessages,
  ]);
}
