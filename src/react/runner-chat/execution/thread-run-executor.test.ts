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

    const result = await run("Build the feature", [], {
      connectorsOverride: {
        atlassian: { enabled: true },
      },
    });

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
        connectors: {
          atlassian: { enabled: true },
        },
      }),
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("preserves Knowledge scope when an external host hands a run back", async () => {
    const execute = vi.fn(async () => ({
      cancelled: false,
      durationSeconds: 1,
    }));
    const ensureThread = vi.fn(async () => ({
      threadId: "thread_knowledge",
      didCreateThread: false,
      initialTitle: "Knowledge thread",
      environmentId: null,
    }));
    const knowledgeContext = {
      schemaVersion: "computer_agents_knowledge_context_v1" as const,
      enabled: true as const,
      libraryIds: ["library_1"],
      bindings: [{ libraryId: "library_1", versionId: "version_4", versionNumber: 4 }],
      mode: "read" as const,
      source: "composer",
    };
    const run = createRunnerThreadRunExecutor(
      dependencies({ ensureThread, execute }),
    );

    const result = await run("Use the runbook", [], {
      knowledgeContextOverride: knowledgeContext,
    });

    expect(result.threadId).toBe("thread_knowledge");
    expect(ensureThread).toHaveBeenCalledWith("Use the runbook", expect.objectContaining({
      knowledgeContext,
    }));
    expect(execute.mock.calls[0]?.[0]?.run?.body).toMatchObject({
      knowledgeContext: {
      libraryIds: ["library_1"],
      bindings: [{ libraryId: "library_1", versionId: "version_4", versionNumber: 4 }],
      },
    });
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
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({
      run: expect.objectContaining({
        credentials: "include",
      }),
    }));

    finishWarmup?.();
    await expect(resultPromise).resolves.toEqual(expect.objectContaining({
      threadId: "thread_1",
    }));
  });

  it("resolves fresh authenticated headers immediately before a connector run", async () => {
    const execute = vi.fn(async () => ({
      cancelled: false,
      durationSeconds: 1,
    }));
    const resolveRequestHeaders = vi.fn(async () => ({
      Authorization: "Bearer refreshed-firebase-token",
      "X-Request-Scope": "current",
    }));
    const run = createRunnerThreadRunExecutor(
      dependencies({
        ensureThread: vi.fn(async () => ({
          threadId: "thread_1",
          didCreateThread: false,
          initialTitle: "Existing thread",
          environmentId: null,
        })),
        execute,
        requestHeaders: { "X-Request-Scope": "stale" },
        resolveRequestHeaders,
      }),
    );

    await run("Search Atlassian", [], {
      connectorsOverride: {
        jira: { enabled: true },
      },
    });

    expect(resolveRequestHeaders).toHaveBeenCalledTimes(1);
    const executeOptions = execute.mock.calls[0]?.[0];
    const headers = new Headers(executeOptions?.run.headers);
    expect(headers.get("Authorization")).toBe(
      "Bearer refreshed-firebase-token",
    );
    expect(headers.get("X-Request-Scope")).toBe("current");
    expect(headers.get("Idempotency-Key")).toMatch(
      /^thread-turn:thread_1:turn[-_]/,
    );
    expect(executeOptions?.run.credentials).toBe("include");
  });
});
