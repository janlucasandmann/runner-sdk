import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";
import type {
  RunnerExecuteOptions,
  RunnerExecuteResult,
  RunnerLog,
} from "../../../types.js";
import type { RunnerChatOption } from "../agent-options.js";
import {
  normalizeRunnerReasoningEffort,
} from "../agent-options.js";
import type {
  LocalAttachment,
  RunnerAttachment,
} from "../attachment-types.js";
import {
  buildSelectedGithubRepoReference,
} from "../attachment-utils.js";
import {
  buildRunnerAdEnabledSkillsPayload,
  buildRunnerParseEnabledSkillsPayload,
  buildRunnerScrapeEnabledSkillsPayload,
  type StagedAdCreationCommand,
  type StagedAgentCreationCommand,
  type StagedBacklogCommand,
  type StagedParseCreationCommand,
  type StagedResearchCreationCommand,
  type StagedResourceCreationCommand,
  type StagedScrapeCreationCommand,
  type StagedSkillCreationCommand,
  type StagedSlideCreationCommand,
} from "../composer-commands.js";
import {
  isComputeTokenBudgetErrorMessage,
  sanitizeRunnerMessage,
} from "../conversation-messages.js";
import {
  isEnvironmentStartTimeoutError,
  reportRunnerLifecycleCallbackError,
  startEnvironment,
} from "../environment-api.js";
import {
  buildRunnerExecutionPrompt,
  buildRunnerThreadMessageRequestBody,
} from "../execution-request.js";
import { normalizeHydratedLog } from "../hydration/log-normalization.js";
import { generateRunnerClientId } from "../id-utils.js";
import {
  buildRunnerMetronomeWorkflowRunPayload,
  type RunnerChatMetronomeWorkflowRunPayload,
} from "../metronome-workflow.js";
import {
  generateThreadTitle,
  isDefaultThreadTitle,
} from "../thread-api.js";
import {
  buildTurnAttachmentsForExecution,
  buildTurnAttachmentsFromLocalAttachments,
  buildTurnAttachmentsFromRunnerAttachments,
  mergeRunnerAttachments,
  mergeRunnerTurnAttachments,
  pickTurnAttachments,
} from "../turn-attachments.js";
import type {
  RunnerQuotedSelection,
  RunnerTurn,
  RunnerTurnStatus,
} from "../turn-types.js";
import type { RunnerChatSkill } from "../skill-configuration.js";

export interface RunnerGithubRunReference {
  repoFullName: string;
  repoName: string;
  branch: string;
}

export interface RunnerThreadRunOptions {
  turnId?: string;
  threadIdOverride?: string;
  truncateAtMessageIndex?: number;
  persistFileChanges?: boolean;
  quotedSelection?: RunnerQuotedSelection | null;
  environmentIdOverride?: string | null;
  agentIdOverride?: string | null;
  agentNameOverride?: string | null;
  reasoningEffortOverride?: string | null;
  backlogCommand?: StagedBacklogCommand | null;
  resourceCreationCommand?: StagedResourceCreationCommand | null;
  agentCreationCommand?: StagedAgentCreationCommand | null;
  skillCreationCommand?: StagedSkillCreationCommand | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
  resolvedAttachmentsOverride?: RunnerAttachment[] | null;
  extraResolvedAttachments?: RunnerAttachment[] | null;
  githubRepoOverride?: RunnerGithubRunReference | null;
  enabledSkillsOverride?: Record<string, unknown> | null;
  displayPromptOverride?: string | null;
  connectorsOverride?: Record<string, unknown> | null;
}

export interface RunnerEnsuredThread {
  threadId: string;
  didCreateThread: boolean;
  initialTitle: string | null;
  environmentId: string | null;
}

export interface RunnerExternalRunHandoff {
  token: string | number;
  threadId: string;
  prompt: string;
  displayPrompt?: string | null;
  reasoningEffort?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  attachments?: RunnerAttachment[] | null;
  githubRepo?: RunnerGithubRunReference | null;
  enabledSkills?: Record<string, unknown> | null;
  connectors?: Record<string, unknown> | null;
  environmentId?: string | null;
  projectId?: string | null;
  quotedSelection?: RunnerQuotedSelection | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
}

export interface RunnerThreadRunResult {
  threadId: string;
  executionResult: RunnerExecuteResult | null;
  turnId: string | null;
}

export interface RunnerThreadRunExecutorDependencies {
  activeThreadEnvironmentId: string | null;
  agentCreationCommandHiddenPrompt?: (
    commandType: StagedAgentCreationCommand["action"],
  ) => string;
  apiKey: string;
  appendTurnLog: (turnId: string, log: RunnerLog) => void;
  backlogTaskConnectors?: Record<string, unknown> | null;
  currentThreadId: string | null | undefined;
  displayedAgentLabel: string;
  displayedEnvironmentLabel: string;
  effectiveAgentId: string | null | undefined;
  effectiveEnvironmentId: string | null | undefined;
  effectiveProjectId: string | null | undefined;
  effectiveReasoningEffort: string | null | undefined;
  enabledSkillsPayload: Record<string, unknown> | null;
  ensureThread: (
    taskText: string,
    options?: { reserveLocalExecution?: boolean },
  ) => Promise<RunnerEnsuredThread>;
  environmentId: string | null | undefined;
  execute: (options: RunnerExecuteOptions) => Promise<RunnerExecuteResult>;
  fetchCustomSkills?: () => Promise<RunnerChatSkill[]>;
  getTurnDurationSeconds: (turn: RunnerTurn) => number;
  githubContexts: RunnerChatOption[];
  githubRepositories: RunnerChatOption[];
  hiddenSystemPrompt: string;
  initializedThreadHistoryIdRef: MutableRefObject<string | null>;
  locallyOwnedExecutionThreadIdRef: MutableRefObject<string | null>;
  normalizedBackendUrl: string;
  normalizeIntentionalStopError: (
    error: Error,
    threadId: string,
  ) => Error;
  notifyTaskListChange: (threadId: string, log: RunnerLog) => void;
  onCustomSkillsLoaded: (
    skills: RunnerChatSkill[] | null,
    succeeded: boolean,
  ) => void;
  onExternalRunRequestCreate?: (
    request: RunnerExternalRunHandoff,
    // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the public compatibility callback contract.
  ) => boolean | void;
  onMetronomeWorkflowRun?: (
    payload: RunnerChatMetronomeWorkflowRunPayload,
  ) => void;
  onRunFinish?: (
    result: RunnerExecuteResult,
    threadId: string,
  ) => void;
  onRunStart?: (threadId: string) => void;
  onThreadStatusChange?: (
    threadId: string,
    status: RunnerTurnStatus,
  ) => void;
  onThreadTitleChange?: (threadId: string, title: string) => void;
  prepareGithubRepoForThreadRun: (
    repository: { repoFullName: string; branch: string },
    environmentId: string,
  ) => Promise<void>;
  refreshThreadContextDetails: (threadId: string) => void;
  requestHeaders?: HeadersInit;
  resolveAttachmentPayload: (
    files: LocalAttachment[],
    environmentIdOverride?: string | null,
  ) => Promise<RunnerAttachment[] | undefined>;
  resourceCreationCommandHiddenPrompt?: (
    commandType: StagedResourceCreationCommand["action"],
  ) => string;
  selectedAgent: RunnerChatOption | null | undefined;
  selectedContextId: string;
  selectedEnvironment: RunnerChatOption | null | undefined;
  selectedRepositoryId: string;
  setExpandedTurns: Dispatch<SetStateAction<Record<string, boolean>>>;
  setIsPreparingRun: Dispatch<SetStateAction<boolean>>;
  setTurns: Dispatch<SetStateAction<RunnerTurn[]>>;
  skillCreationCommandHiddenPrompt?: (
    commandType: StagedSkillCreationCommand["action"],
  ) => string;
  title?: string;
  updateTurn: (
    turnId: string,
    updater: (turn: RunnerTurn) => RunnerTurn,
  ) => void;
}

export function createRunnerThreadRunExecutor(
  dependencies: RunnerThreadRunExecutorDependencies,
): (
  taskText: string,
  attachmentEntries: LocalAttachment[],
  options?: RunnerThreadRunOptions,
) => Promise<RunnerThreadRunResult> {
  return async (
    taskText,
    attachmentEntries,
    options = {},
  ): Promise<RunnerThreadRunResult> => {
    const {
      executionTaskText,
      agentGuardrailsHiddenPromptText,
    } = buildRunnerExecutionPrompt({
      taskText,
      selectedAgent: dependencies.selectedAgent,
      hiddenSystemPrompt: dependencies.hiddenSystemPrompt,
      resourceCreationCommand: options.resourceCreationCommand,
      agentCreationCommand: options.agentCreationCommand,
      skillCreationCommand: options.skillCreationCommand,
      slideCreationCommand: options.slideCreationCommand,
      researchCreationCommand: options.researchCreationCommand,
      scrapeCreationCommand: options.scrapeCreationCommand,
      parseCreationCommand: options.parseCreationCommand,
      adCreationCommand: options.adCreationCommand,
      resourceCreationHiddenPrompt:
        dependencies.resourceCreationCommandHiddenPrompt,
      agentCreationHiddenPrompt:
        dependencies.agentCreationCommandHiddenPrompt,
      skillCreationHiddenPrompt:
        dependencies.skillCreationCommandHiddenPrompt,
    });
    const visibleTaskText = options.displayPromptOverride !== undefined
      ? String(options.displayPromptOverride || "")
      : taskText;
    const hasResolvedThread = Boolean(
      options.threadIdOverride || dependencies.currentThreadId,
    );
    let runEnvironmentId =
      options.environmentIdOverride !== undefined
        ? options.environmentIdOverride
        : hasResolvedThread
          ? dependencies.activeThreadEnvironmentId
            || dependencies.selectedEnvironment?.id
            || dependencies.environmentId
            || null
          : dependencies.effectiveEnvironmentId
            || dependencies.selectedEnvironment?.id
            || dependencies.environmentId
            || null;
    const ensuredThread = options.threadIdOverride
      ? {
          threadId: options.threadIdOverride,
          didCreateThread: false,
          initialTitle: null,
          environmentId: runEnvironmentId,
        }
      : await dependencies.ensureThread(taskText, {
          reserveLocalExecution: true,
        });
    const threadId = ensuredThread.threadId;
    if (!runEnvironmentId && ensuredThread.environmentId) {
      runEnvironmentId = ensuredThread.environmentId;
    }

    const runAgentId = options.agentIdOverride !== undefined
      ? String(options.agentIdOverride || "").trim()
      : String(dependencies.effectiveAgentId || "").trim();
    const runAgentName =
      String(options.agentNameOverride || "").trim()
      || dependencies.selectedAgent?.name
      || dependencies.displayedAgentLabel;
    const runReasoningEffort = normalizeRunnerReasoningEffort(
      options.reasoningEffortOverride !== undefined
        ? options.reasoningEffortOverride
        : dependencies.effectiveReasoningEffort,
    );
    const baseEnabledSkillsPayload =
      options.enabledSkillsOverride !== undefined
        ? options.enabledSkillsOverride || null
        : dependencies.enabledSkillsPayload;
    const executionEnabledSkillsPayload =
      buildRunnerParseEnabledSkillsPayload(
        options.parseCreationCommand || null,
        buildRunnerScrapeEnabledSkillsPayload(
          options.scrapeCreationCommand || null,
          buildRunnerAdEnabledSkillsPayload(
            options.adCreationCommand || null,
            baseEnabledSkillsPayload,
          ),
        ),
      );

    dependencies.initializedThreadHistoryIdRef.current = threadId;
    const githubRepo = options.githubRepoOverride !== undefined
      ? options.githubRepoOverride
      : buildSelectedGithubRepoReference(attachmentEntries, {
          repositories: dependencies.githubRepositories,
          contexts: dependencies.githubContexts,
          selectedRepositoryId: dependencies.selectedRepositoryId,
          selectedContextId: dependencies.selectedContextId,
        });
    const shouldHandoffExternalRun = Boolean(
      dependencies.onExternalRunRequestCreate
      && ensuredThread.didCreateThread
      && !options.threadIdOverride
      && !options.turnId
      && !dependencies.currentThreadId,
    );

    if (shouldHandoffExternalRun) {
      const baseResolvedAttachments =
        options.resolvedAttachmentsOverride !== undefined
          ? options.resolvedAttachmentsOverride || undefined
          : await dependencies.resolveAttachmentPayload(
              attachmentEntries,
              runEnvironmentId,
            );
      const resolvedAttachments = mergeRunnerAttachments(
        baseResolvedAttachments,
        options.extraResolvedAttachments,
      );
      const didHandle = dependencies.onExternalRunRequestCreate?.({
        token: generateRunnerClientId("runreq"),
        threadId,
        prompt: executionTaskText,
        displayPrompt: visibleTaskText || taskText,
        reasoningEffort: runReasoningEffort,
        agentId: runAgentId || null,
        agentName: runAgentName || null,
        attachments: resolvedAttachments || [],
        githubRepo: githubRepo || null,
        enabledSkills: executionEnabledSkillsPayload || null,
        connectors:
          options.connectorsOverride === undefined
            ? dependencies.backlogTaskConnectors
            : options.connectorsOverride,
        environmentId:
          typeof runEnvironmentId === "string" ? runEnvironmentId : "",
        projectId: dependencies.effectiveProjectId || null,
        quotedSelection: options.quotedSelection || null,
        slideCreationCommand: options.slideCreationCommand || null,
        researchCreationCommand: options.researchCreationCommand || null,
        scrapeCreationCommand: options.scrapeCreationCommand || null,
        parseCreationCommand: options.parseCreationCommand || null,
        adCreationCommand: options.adCreationCommand || null,
      });
      if (didHandle !== false) {
        if (
          dependencies.locallyOwnedExecutionThreadIdRef.current
          === threadId
        ) {
          dependencies.locallyOwnedExecutionThreadIdRef.current = null;
        }
        return {
          threadId,
          executionResult: null,
          turnId: null,
        };
      }
    }

    dependencies.locallyOwnedExecutionThreadIdRef.current = threadId;
    const initialTurnAttachments = mergeRunnerTurnAttachments(
      buildTurnAttachmentsFromLocalAttachments(attachmentEntries),
      buildTurnAttachmentsFromRunnerAttachments(
        options.extraResolvedAttachments || undefined,
        dependencies.normalizedBackendUrl,
      ),
    );
    const turnId = options.turnId || generateRunnerClientId("turn");
    const slideCreationCommand = options.slideCreationCommand || null;
    const researchCreationCommand =
      options.researchCreationCommand || null;
    const scrapeCreationCommand = options.scrapeCreationCommand || null;
    const parseCreationCommand = options.parseCreationCommand || null;
    const adCreationCommand = options.adCreationCommand || null;
    const startedAtMs = Date.now();
    let releasedPreparationState = false;
    const releasePreparationState = () => {
      if (releasedPreparationState) return;
      releasedPreparationState = true;
      dependencies.setIsPreparingRun(false);
    };

    if (options.turnId) {
      dependencies.updateTurn(turnId, (turn) => ({
        ...turn,
        logs: [],
        startedAtMs,
        completedAtMs: undefined,
        durationSeconds: null,
        status: "running",
        quotedSelection: options.quotedSelection === undefined
          ? turn.quotedSelection
          : options.quotedSelection,
        attachments: pickTurnAttachments(
          initialTurnAttachments,
          turn.attachments,
        ),
        agentName: runAgentName || turn.agentName || null,
        slideCreationCommand:
          slideCreationCommand || turn.slideCreationCommand || null,
        researchCreationCommand:
          researchCreationCommand || turn.researchCreationCommand || null,
        scrapeCreationCommand:
          scrapeCreationCommand || turn.scrapeCreationCommand || null,
        parseCreationCommand:
          parseCreationCommand || turn.parseCreationCommand || null,
        adCreationCommand:
          adCreationCommand || turn.adCreationCommand || null,
      }));
    } else {
      dependencies.setTurns((currentTurns) => [
        ...currentTurns,
        {
          id: turnId,
          prompt: visibleTaskText,
          logs: [],
          startedAtMs,
          status: "running",
          animateOnRender: true,
          isInitialTurn: currentTurns.length === 0,
          agentName: runAgentName,
          environmentName:
            dependencies.selectedEnvironment?.name
            || dependencies.displayedEnvironmentLabel,
          quotedSelection: options.quotedSelection || null,
          attachments: initialTurnAttachments,
          slideCreationCommand,
          researchCreationCommand,
          scrapeCreationCommand,
          parseCreationCommand,
          adCreationCommand,
        },
      ]);
      dependencies.setExpandedTurns((current) => ({
        ...current,
        [turnId]: true,
      }));
    }

    try {
      dependencies.onRunStart?.(threadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onRunStart", error);
    }

    try {
      if (
        runEnvironmentId
        && dependencies.normalizedBackendUrl
        && dependencies.apiKey.trim()
      ) {
        let didEnvironmentWarmupTimeout = false;
        try {
          await startEnvironment({
            backendUrl: dependencies.normalizedBackendUrl,
            apiKey: dependencies.apiKey.trim(),
            requestHeaders: dependencies.requestHeaders,
            environmentId: runEnvironmentId,
            ...(runAgentId ? { agentId: runAgentId } : {}),
            ...(options.enabledSkillsOverride !== undefined
              ? {
                  enabledSkills:
                    executionEnabledSkillsPayload
                    || options.enabledSkillsOverride,
                }
              : executionEnabledSkillsPayload
                ? { enabledSkills: executionEnabledSkillsPayload }
                : {}),
          });
        } catch (error) {
          if (!isEnvironmentStartTimeoutError(error)) throw error;
          didEnvironmentWarmupTimeout = true;
          console.warn(
            "[RunnerChat] Environment warm-up timed out; continuing with thread execution.",
            error,
          );
        }
        if (
          githubRepo?.repoFullName
          && githubRepo?.branch
          && !didEnvironmentWarmupTimeout
        ) {
          await dependencies.prepareGithubRepoForThreadRun(
            {
              repoFullName: githubRepo.repoFullName,
              branch: githubRepo.branch,
            },
            runEnvironmentId,
          );
        } else if (
          githubRepo?.repoFullName
          && githubRepo?.branch
          && didEnvironmentWarmupTimeout
        ) {
          console.warn(
            "[RunnerChat] Skipping GitHub preflight because environment warm-up timed out.",
          );
        }
      }

      const baseResolvedAttachments =
        options.resolvedAttachmentsOverride !== undefined
          ? options.resolvedAttachmentsOverride || undefined
          : await dependencies.resolveAttachmentPayload(
              attachmentEntries,
              runEnvironmentId,
            );
      const resolvedAttachments = mergeRunnerAttachments(
        baseResolvedAttachments,
        options.extraResolvedAttachments,
      );
      const turnAttachments = buildTurnAttachmentsForExecution(
        attachmentEntries,
        resolvedAttachments,
        dependencies.normalizedBackendUrl,
      );
      if (turnAttachments) {
        dependencies.updateTurn(turnId, (turn) => ({
          ...turn,
          attachments: pickTurnAttachments(
            turnAttachments,
            turn.attachments,
          ),
        }));
      }

      if (
        ensuredThread.didCreateThread
        && !dependencies.title?.trim()
        && taskText.trim()
        && isDefaultThreadTitle(ensuredThread.initialTitle)
      ) {
        void generateThreadTitle({
          backendUrl: dependencies.normalizedBackendUrl,
          apiKey: dependencies.apiKey,
          requestHeaders: dependencies.requestHeaders,
          threadId,
          message: visibleTaskText || taskText,
        })
          .then((nextTitle) => {
            dependencies.onThreadTitleChange?.(threadId, nextTitle);
          })
          .catch((error) => {
            console.warn(
              "[RunnerChat] Failed to generate thread title",
              error,
            );
          });
      }

      const executionResult = await dependencies.execute({
        run: {
          url:
            `${dependencies.normalizedBackendUrl}/threads/`
            + `${encodeURIComponent(threadId)}/messages`,
          headers: (() => {
            const headers = new Headers(
              dependencies.requestHeaders || {},
            );
            headers.set("Content-Type", "application/json");
            headers.set("X-API-Key", dependencies.apiKey);
            return headers;
          })(),
          body: buildRunnerThreadMessageRequestBody({
            taskText,
            visibleTaskText,
            executionTaskText,
            agentGuardrailsHiddenPromptText,
            reasoningEffort: runReasoningEffort,
            attachments: resolvedAttachments,
            githubRepo,
            truncateAtMessageIndex: options.truncateAtMessageIndex,
            persistFileChanges: options.persistFileChanges,
            quotedSelection: options.quotedSelection,
            enabledSkills: executionEnabledSkillsPayload,
            connectors:
              options.connectorsOverride === undefined
                ? dependencies.backlogTaskConnectors
                : options.connectorsOverride,
            backlogCommand: options.backlogCommand,
            slideCreationCommand: options.slideCreationCommand,
            researchCreationCommand: options.researchCreationCommand,
            scrapeCreationCommand: options.scrapeCreationCommand,
            parseCreationCommand: options.parseCreationCommand,
            adCreationCommand: options.adCreationCommand,
          }),
        },
        onLog: (log) => {
          releasePreparationState();
          if (log.eventType === "permission_request") {
            const permissionStatus = String(
              log.metadata?.status || log.metadata?.decision || "",
            ).trim().toLowerCase();
            const nextTurnStatus: RunnerTurnStatus =
              !permissionStatus || permissionStatus === "pending"
                ? "permission_asked"
                : "running";
            dependencies.updateTurn(turnId, (turn) => ({
              ...turn,
              status: nextTurnStatus,
              completedAtMs: undefined,
            }));
            try {
              dependencies.onThreadStatusChange?.(
                threadId,
                nextTurnStatus,
              );
            } catch (error) {
              reportRunnerLifecycleCallbackError(
                "onThreadStatusChange",
                error,
              );
            }
          }
          dependencies.appendTurnLog(turnId, log);
          dependencies.notifyTaskListChange(
            threadId,
            normalizeHydratedLog(log),
          );
          const workflowRun =
            buildRunnerMetronomeWorkflowRunPayload(log, threadId, {
              userMessage: visibleTaskText || taskText,
              attachments: resolvedAttachments || null,
            });
          if (workflowRun) {
            try {
              dependencies.onMetronomeWorkflowRun?.(workflowRun);
            } catch (error) {
              reportRunnerLifecycleCallbackError(
                "onMetronomeWorkflowRun",
                error,
              );
            }
          }
        },
      });

      releasePreparationState();
      dependencies.updateTurn(turnId, (turn) => ({
        ...turn,
        status: executionResult.cancelled ? "cancelled" : "completed",
        completedAtMs: Date.now(),
        durationSeconds: executionResult.durationSeconds,
      }));
      dependencies.refreshThreadContextDetails(threadId);

      if (
        options.skillCreationCommand
        && dependencies.fetchCustomSkills
      ) {
        void dependencies.fetchCustomSkills()
          .then((skills) => {
            dependencies.onCustomSkillsLoaded(
              (skills || []).filter((skill) => skill.isCustom),
              true,
            );
          })
          .catch(() => {
            dependencies.onCustomSkillsLoaded(null, false);
          });
      }
      try {
        dependencies.onRunFinish?.(executionResult, threadId);
      } catch (error) {
        reportRunnerLifecycleCallbackError("onRunFinish", error);
      }
      return { threadId, executionResult, turnId };
    } catch (error) {
      releasePreparationState();
      const normalizedError = dependencies.normalizeIntentionalStopError(
        error instanceof Error ? error : new Error(String(error)),
        threadId,
      );
      const isAbort = normalizedError.name === "AbortError";
      const errorMessage = sanitizeRunnerMessage(
        normalizedError.message || "Execution failed.",
      );
      const isComputeTokenError =
        isComputeTokenBudgetErrorMessage(errorMessage);
      dependencies.updateTurn(turnId, (turn) => ({
        ...turn,
        status: isAbort ? "cancelled" : "failed",
        completedAtMs: Date.now(),
        durationSeconds: dependencies.getTurnDurationSeconds(turn),
        logs: isAbort
          ? turn.logs
          : [
              ...turn.logs,
              {
                time: new Date().toISOString(),
                message: errorMessage,
                type: "error",
                eventType: "agent_message",
                metadata: {
                  status: "failed",
                  error: {
                    source: "runner_stream",
                    ...(isComputeTokenError
                      ? {
                          code: "compute_tokens_exhausted",
                          action: "open_plans_budget",
                        }
                      : {}),
                  },
                },
              },
            ],
      }));
      throw normalizedError;
    } finally {
      if (
        dependencies.locallyOwnedExecutionThreadIdRef.current
        === threadId
      ) {
        dependencies.locallyOwnedExecutionThreadIdRef.current = null;
      }
      releasePreparationState();
    }
  };
}
