export type RunnerLogType = "info" | "error" | "success" | "warning";

export type RunnerEventType =
  | "user_message"
  | "agent_message"
  | "reasoning"
  | "subagent_invocation"
  | "command_execution"
  | "mcp_tool_call"
  | "mcp_log"
  | "file_change"
  | "todo_list"
  | "action_summary"
  | "setup"
  | "startup"
  | "turn_completed"
  | "planning"
  | "llm_response"
  | "deep_research";

export interface RunnerUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  totalTokens: number;
  costUsd?: number;
}

export interface RunnerTeamExecutionMember {
  agentId: string;
  agentName: string;
  claudeAgentName: string;
}

export interface RunnerTeamExecutionMetadata {
  mode: "team";
  teamAgentId: string;
  teamAgentName: string;
  orchestrator: RunnerTeamExecutionMember;
  subagents: RunnerTeamExecutionMember[];
}

export interface RunnerLogActorMetadata {
  kind: "orchestrator" | "subagent";
  agentId: string;
  agentName: string;
  teamAgentId: string;
  teamAgentName: string;
  claudeAgentName: string;
  subagentType: string;
  parentToolUseId?: string;
  invocationId?: string;
}

export interface RunnerSubagentInvocationMetadata {
  invocationId: string;
  parentToolUseId: string;
  toolName: string;
  agentId: string;
  agentName: string;
  teamAgentId: string;
  teamAgentName: string;
  claudeAgentName: string;
  subagentType: string;
  message?: string;
  description?: string;
  status?: "started" | "completed" | "failed";
}

export interface RunnerLog {
  createdAt?: string;
  time: string;
  message: string;
  type: RunnerLogType;
  eventType?: RunnerEventType;
  isActionSummary?: boolean;
  isReasoning?: boolean;
  isPlanning?: boolean;
  isLLMResponse?: boolean;
  metadata?: {
    actor?: RunnerLogActorMetadata;
    delegatedTo?: RunnerLogActorMetadata;
    teamExecution?: RunnerTeamExecutionMetadata;
    subagentInvocation?: RunnerSubagentInvocationMetadata;
    command?: string;
    exitCode?: number;
    status?: "running" | "completed" | "failed" | "started" | "output";
    output?: string;
    serverName?: string;
    toolName?: string;
    toolId?: string;
    isToolStarted?: boolean;
    toolInput?: Record<string, unknown>;
    result?: unknown;
    error?: unknown;
    durationMs?: number;
    args?: unknown;
    savedImagePath?: string;
    isImageGeneration?: boolean;
    filePaths?: string[];
    changeKinds?: Array<"created" | "modified" | "deleted">;
    diffs?: Record<
      string,
      {
        diff?: string;
        changes?: string;
        additions?: number;
        deletions?: number;
      }
    >;
    fileContents?: Record<string, string>;
    todos?: Array<{ text: string; completed: boolean }>;
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
    totalTokens?: number;
    costUsd?: number;
    deepResearch?: {
      sessionId?: string;
      event: string;
      topic?: string;
      interactionId?: string;
      thinkingSummary?: string;
      reportFile?: string;
      sourcesCount?: number;
      sources?: string[];
      elapsedSeconds?: number;
      errorMessage?: string;
      resumeAttempt?: number;
      reportLength?: number;
      timestamp?: string;
    };
    actionType?: "compact" | "clear" | "fork" | "btw" | "revert" | "reapply";
    isPending?: boolean;
    failed?: boolean;
    revertedChangeStepId?: string | null;
    revertedFilePath?: string | null;
    revertedFileName?: string | null;
    quotedSelection?: {
      text: string;
      sourceType: "working_log" | "run_summary";
    };
  };
}

export interface RunnerRunRequest {
  url: string;
  body: unknown;
  method?: "POST" | "PUT";
  headers?: HeadersInit;
  credentials?: RequestCredentials;
}

export interface RunnerPrepareRequest {
  url: string;
  body: unknown;
  method?: "POST" | "PUT";
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  buildRunRequest?: (preparePayload: unknown, currentRunRequest: RunnerRunRequest) => RunnerRunRequest;
  getSetupLogs?: (preparePayload: unknown) => RunnerLog[];
}

export interface RunnerExecuteOptions {
  run: RunnerRunRequest;
  prepare?: RunnerPrepareRequest;
  signal?: AbortSignal;
  throwOnError?: boolean;
  onRawEvent?: (event: RawRunnerEvent) => void;
  onLog?: (log: RunnerLog) => void;
  onSetupComplete?: () => void;
}

export interface RunnerExecuteResult {
  durationSeconds: number;
  usage?: RunnerUsage;
  cancelled: boolean;
}

export interface RunnerEventHandleResult {
  logs: RunnerLog[];
  usage?: RunnerUsage;
  setupComplete?: boolean;
  cancelled?: boolean;
  streamError?: Error;
}

export type RawRunnerEvent = {
  type: string;
  [key: string]: unknown;
};

export interface RunnerApiRequestOptions {
  backendUrl: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

export interface RunnerThreadStep {
  id: string;
  threadId: string;
  environmentId: string;
  sequence: number;
  sourceMessageId: string | null;
  stepKind: string;
  eventType: string | null;
  title: string;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunnerEnvironmentSnapshot {
  id: string;
  environmentId: string;
  sourceThreadId: string | null;
  sourceStepId: string | null;
  parentSnapshotId: string | null;
  ledgerCommitSha: string;
  changedPaths: string[];
  additions: number;
  deletions: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunnerSnapshotDiff {
  fromCommitSha: string | null;
  toCommitSha: string;
  path: string | null;
  diff: string;
  changedPaths: string[];
  additions: number;
  deletions: number;
}

export interface RunnerSnapshotFileEntry {
  path: string;
  name: string;
  type: "file" | "directory";
  size: number | null;
}

export interface RunnerThreadStepDiffResult extends RunnerSnapshotDiff {
  threadId: string;
  stepId: string;
  sequence: number;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
}

export interface RunnerThreadStepFileResult {
  path: string;
  snapshotId: string;
  stepId: string;
  content: string;
}

export interface RunnerEnvironmentSnapshotDiffResult extends RunnerSnapshotDiff {
  environmentId: string;
  snapshotId: string;
  parentSnapshotId: string | null;
}

export interface RunnerEnvironmentSnapshotFileResult {
  path: string;
  snapshotId: string;
  content: string;
}

export interface RunnerThreadFileHistoryEntry {
  threadId: string;
  path: string;
  changedPath: string;
  stepId: string;
  sequence: number;
  title: string;
  eventType: string | null;
  snapshotBeforeId: string | null;
  snapshotAfterId: string | null;
  changeKind: "created" | "modified" | "deleted" | null;
  createdAt: string;
}

export interface RunnerThreadFileHistoryResult {
  object: "list";
  threadId: string;
  path: string;
  data: RunnerThreadFileHistoryEntry[];
  total_count: number;
  has_more: boolean;
}

export interface RunnerEnvironmentSnapshotInitializeResult {
  environmentId: string;
  snapshot: RunnerEnvironmentSnapshot;
}

export interface RunnerThreadForkResult {
  thread: Record<string, unknown>;
  environmentId: string;
  environmentName?: string | null;
  snapshotId: string | null;
  messagesCopied: number;
  forkMode: "latest" | "historical" | "current_environment" | "existing_environment";
}

export interface RunnerThreadRevertResult {
  thread: Record<string, unknown>;
  environmentId: string;
  snapshotId: string | null;
  revertStepId: string;
  revertedToStepId: string;
  revertedChangeStepId?: string | null;
}

export interface RunnerEnvironmentForkResult {
  environment: Record<string, unknown>;
  snapshot: RunnerEnvironmentSnapshot | null;
  sourceSnapshotId: string;
}
