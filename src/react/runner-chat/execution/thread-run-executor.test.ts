import { beforeEach, describe, expect, it, vi } from "vitest";

const { startEnvironmentMock } = vi.hoisted(() => ({
  startEnvironmentMock: vi.fn(),
}));

vi.mock("../environment-api.js", async () => {
  const actual = await vi.importActual<typeof import("../environment-api.js")>(
    "../environment-api.js",
  );
  return {
    ...actual,
    startEnvironment: startEnvironmentMock,
  };
});

import {
  createRunnerThreadRunExecutor,
  type RunnerThreadRunExecutorDependencies,
} from "./thread-run-executor.js";

function dependencies(
  overrides: Partial<RunnerThreadRunExecutorDependencies> = {},
): RunnerThreadRunExecutorDependencies {
  return {
    activeThreadEnvironmentId: null,
    apiKey: "secret",
    appendTurnLog: vi.fn(),
    currentThreadId: null,
    displayedAgentLabel: "Agent",
    displayedEnvironmentLabel: "Computer",
    effectiveAgentId: "agent_1",
    effectiveEnvironmentId: null,
    effectiveProjectId: "project_1",
    effectiveReasoningEffort: "medium",
    enabledSkillsPayload: null,
    ensureThread: vi.fn(async () => ({
      threadId: "thread_1",
      didCreateThread: true,
      initialTitle: "New Thread",
      environmentId: null,
    })),
    environmentId: null,
    execute: vi.fn(async () => ({
      cancelled: false,
      durationSeconds: 1,
    })),
    getTurnDurationSeconds: vi.fn(() => 1),
    githubContexts: [],
    githubRepositories: [],
    hiddenSystemPrompt: "",
    initializedThreadHistoryIdRef: { current: null },
    locallyOwnedExecutionThreadIdRef: { current: null },
    normalizedBackendUrl: "https://platform.example.test",
    normalizeIntentionalStopError: (error) => error,
    notifyTaskListChange: vi.fn(),
    onCustomSkillsLoaded: vi.fn(),
    prepareGithubRepoForThreadRun: vi.fn(async () => undefined),
    refreshThreadContextDetails: vi.fn(),
    resolveAttachmentPayload: vi.fn(async () => undefined),
    selectedAgent: {
      id: "agent_1",
      name: "Agent",
    },
    selectedContextId: "",
    selectedEnvironment: null,
    selectedRepositoryId: "",
    setExpandedTurns: vi.fn(),
    setIsPreparingRun: vi.fn(),
    setTurns: vi.fn(),
    updateTurn: vi.fn(),
    ...overrides,
  };
}

describe("createRunnerThreadRunExecutor", () => {
  beforeEach(() => {
    startEnvironmentMock.mockReset();
    startEnvironmentMock.mockResolvedValue(undefined);
  });

  it("hands a newly created thread to the page coordinator exactly once", async () => {
    const onExternalRunRequestCreate = vi.fn(() => true);
    const execute = vi.fn();
    const run = createRunnerThreadRunExecutor(
      dependencies({
        execute,
        onExternalRunRequestCreate,
      }),
    );

    const result = await run("Build the feature", []);

    expect(result).toEqual({
      threadId: "thread_1",
      executionResult: null,
      turnId: null,
    });
    expect(onExternalRunRequestCreate).toHaveBeenCalledTimes(1);
    expect(onExternalRunRequestCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: "thread_1",
        displayPrompt: "Build the feature",
        projectId: "project_1",
      }),
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("keeps ordinary environment warm-up off the message execution critical path", async () => {
    let finishWarmup: (() => void) | null = null;
    startEnvironmentMock.mockReturnValue(new Promise<void>((resolve) => {
      finishWarmup = resolve;
    }));
    const execute = vi.fn(async () => ({
      cancelled: false,
      durationSeconds: 1,
    }));
    const run = createRunnerThreadRunExecutor(
      dependencies({
        effectiveEnvironmentId: "environment_1",
        ensureThread: vi.fn(async () => ({
          threadId: "thread_1",
          didCreateThread: false,
          initialTitle: "Existing thread",
          environmentId: "environment_1",
        })),
        execute,
      }),
    );

    const resultPromise = run("Start immediately", []);
    await vi.waitFor(() => {
      expect(execute).toHaveBeenCalledTimes(1);
    });
    expect(startEnvironmentMock).toHaveBeenCalledTimes(1);

    finishWarmup?.();
    await expect(resultPromise).resolves.toEqual(expect.objectContaining({
      threadId: "thread_1",
    }));
  });
});
